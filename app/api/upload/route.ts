// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
// Assuming your Certificate model has 'certificateNo' indexed as unique.
import Certificate, { ICertificate } from '@/models/Certificate'; 
import * as XLSX from 'xlsx';

// Maximum file size of 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Define the expected shape of the raw result from insertMany with rawResult: true
interface InsertManyRawResult {
    insertedCount: number;
    writeErrors?: Array<any>; // Contains details about documents that failed to insert
}

// Helper function to validate DOI format (DD-MM-YYYY)
const isValidDOI = (doi: string): boolean => {
    if (!doi || typeof doi !== 'string' || doi.length !== 10) return false;
    // Regex to check for exactly two digits, a dash, two digits, a dash, and four digits
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(doi)) return false;
    return true;
};

export async function POST(req: NextRequest) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
        }

        // 1. File size check
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, message: 'File size exceeds 10MB limit.' }, { status: 413 });
        }

        // 2. File type check
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            return NextResponse.json({ success: false, message: `Invalid file type: ${file.name}. Only .xlsx or .xls files are accepted.` }, { status: 400 });
        }
        
        // 3. Read file into buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Read data starting from the first row (header row)
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
            return NextResponse.json({ success: false, message: 'Excel sheet is empty or only contains headers.' }, { status: 400 });
        }

        const headers: string[] = json[0];
        const dataRows: any[][] = json.slice(1);

        const requiredColumns = {
            'Certificate No.': 'certificateNo',
            'Name': 'name',
            'Hospital': 'hospital',
            'DOI': 'doi',
        };

        // Map required column headers to their index in the Excel sheet
        const columnMap = Object.keys(requiredColumns).reduce((acc, requiredHeader) => {
            // Find the index of the header, trimming whitespace for robustness
            const index = headers.findIndex(h => h && String(h).trim() === requiredHeader);
            if (index !== -1) {
                // @ts-ignore
                acc[requiredHeader] = { index, dbField: requiredColumns[requiredHeader] };
            }
            return acc;
        }, {} as Record<string, { index: number, dbField: string }>);

        // Ensure all required columns are present
        const missingColumns = Object.keys(requiredColumns).filter(header => !columnMap[header]);
        if (missingColumns.length > 0) {
            return NextResponse.json({
                success: false,
                message: `Missing required columns: ${missingColumns.join(', ')}.`,
            }, { status: 400 });
        }

        const certificatesToInsert: ICertificate[] = [];
        let processedCount = 0;
        let failedCount = 0;

        // Process data rows
        for (const row of dataRows) {
            processedCount++;
            try {
                const certificate: Partial<ICertificate> = {};
                let isValidRow = true;

                // Extract and map data
                Object.keys(columnMap).forEach(header => {
                    const { index, dbField } = columnMap[header];
                    
                    // Get value, handle undefined/null, and trim whitespace
                    let value = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';

                    if (dbField === 'doi') {
                        // Handle DOI: convert XLSX date number to DD-MM-YYYY string if necessary
                        if (typeof row[index] === 'number') {
                            const date = XLSX.SSF.parse_date_code(row[index]);
                            value = `${String(date.d).padStart(2, '0')}-${String(date.m).padStart(2, '0')}-${String(date.y).padStart(4, '0')}`;
                        }

                        // We still validate DOI format, but allow empty/missing DOI if it's not the critical field.
                        // If a DOI is provided, it must be valid. If it's missing, we insert an empty string.
                        if (value !== '' && !isValidDOI(value)) {
                            throw new Error(`Invalid DOI format for row ${processedCount}: "${value}". Expected DD-MM-YYYY.`);
                        }
                    }
                    
                    // --- CRITICAL CHANGE 1: Enforce presence ONLY for 'certificateNo' ---
                    if (dbField === 'certificateNo' && value === '') {
                        throw new Error(`Missing required unique field: ${header} in row ${processedCount}.`);
                    }

                    // For all other fields (name, hospital, doi), an empty string is now allowed if the cell is blank.
                    // This satisfies the requirement to "insert empty values also".
                    // @ts-ignore
                    certificate[dbField] = value;
                });

                // --- CRITICAL CHANGE 2: Only check for the primary unique field ---
                if (certificate.certificateNo) {
                    certificatesToInsert.push(certificate as ICertificate);
                } else {
                    // This block should only be hit if certificateNo was somehow missing
                    throw new Error(`Missing critical unique field (Certificate No.) in row ${processedCount}.`);
                }
                
            } catch (e: any) {
                console.error(`Row processing failed (row ${processedCount}): ${e.message}`);
                failedCount++;
            }
        }

        if (certificatesToInsert.length === 0) {
            return NextResponse.json({ success: false, message: 'No valid data rows found to insert.' }, { status: 400 });
        }

        // --- CRITICAL CHANGE 3: Insert into MongoDB, handling duplicates ---
        // 'ordered: false' and unique indexing on 'certificateNo' handles the "don't repeat certificate no" requirement.
        const insertResult = (await Certificate.insertMany(certificatesToInsert, {
            ordered: false, // Allows processing to continue after a duplicate key error (11000)
            lean: true,
            rawResult: true,
        })) as InsertManyRawResult;

        const insertedCount = insertResult.insertedCount;
        const totalProcessed = processedCount;
        
        // Calculate the number of documents that failed due to database errors (mostly duplicates)
        const dbErrors = insertResult.writeErrors?.length || 0; 
        const finalFailedCount = failedCount + dbErrors; // combines processing errors + database errors (duplicates)

        let responseMessage = `${insertedCount} unique certificates successfully uploaded.`;
        if (finalFailedCount > 0) {
            responseMessage += ` ${finalFailedCount} rows were skipped due to errors (e.g., duplicate Certificate No., missing Certificate No., or invalid DOI format).`;
        }

        return NextResponse.json({
            success: true,
            message: responseMessage,
            summary: {
                totalRows: totalProcessed,
                successfullyInserted: insertedCount,
                failedToProcess: finalFailedCount,
                dbErrors: dbErrors,
            },
        }, { status: 200 });

    } catch (error: any) {
        console.error('Upload error:', error);

        // Catch-all for other server-side errors
        // Note: The main logic relies on writeErrors inside insertMany for duplicate handling.
        return NextResponse.json({ success: false, message: 'Server error during file processing or database operation.' }, { status: 500 });
    }
}

// Set runtime for higher memory/time limits for large file processing
export const runtime = 'nodejs';
// Ensure the route is executed dynamically
export const dynamic = 'force-dynamic';