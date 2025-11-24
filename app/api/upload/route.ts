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

// Helper function to validate DOI format (DD-MM-YYYY) - UNUSED FOR STRING DATES NOW
const isValidDOI = (doi: string): boolean => {
    if (!doi || typeof doi !== 'string' || doi.length !== 10) return false;
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(doi);
};

// Helper function to convert XLSX date number to DD-MM-YYYY string safely
const safeXlsxDateToDoi = (excelSerial: number): string | null => {
    try {
        if (excelSerial > 0) {
            const date = XLSX.SSF.parse_date_code(excelSerial);
            // Check for valid year (Excel dates typically start after 1900)
            if (date && date.y > 1900) { 
                return `${String(date.d).padStart(2, '0')}-${String(date.m).padStart(2, '0')}-${String(date.y).padStart(4, '0')}`;
            }
        }
    } catch (e) {
        // Parsing failed (e.g., invalid input)
        return null;
    }
    return null;
};


export async function POST(req: NextRequest) {
    try {
        // --- Database Connection Check ---
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
        // Use raw: true to prevent XLSX.js from auto-formatting date strings,
        // which helps us keep the original text formats like "31st August 2023"
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false, raw: true });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
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

        const columnMap = Object.keys(requiredColumns).reduce((acc, requiredHeader) => {
            const index = headers.findIndex(h => h && String(h).trim() === requiredHeader);
            if (index !== -1) {
                // @ts-ignore
                acc[requiredHeader] = { index, dbField: requiredColumns[requiredHeader] };
            }
            return acc;
        }, {} as Record<string, { index: number, dbField: string }>);

        const missingColumns = Object.keys(requiredColumns).filter(header => !columnMap[header]);
        if (missingColumns.length > 0) {
            return NextResponse.json({
                success: false,
                message: `Missing required columns: ${missingColumns.join(', ')}.`,
            }, { status: 400 });
        }

        const certificatesToInsert: ICertificate[] = [];
        let failedCount = 0;

        // Process data rows
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const processedCount = i + 1;
            try {
                const certificate: Partial<ICertificate> = {};
                
                Object.keys(columnMap).forEach(header => {
                    const { index, dbField } = columnMap[header];
                    
                    let rawValue = row[index];
                    let value: string = '';

                    // Handle other string fields (certificateNo, name, hospital) first
                    if (dbField !== 'doi') {
                        value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
                    } else {
                        // --- MODIFIED DOI HANDLING (Step 1 & 2 combined) ---
                        if (typeof rawValue === 'number') {
                            // If it's a number (Excel serial date), try to convert it to the standardized format
                            const doiString = safeXlsxDateToDoi(rawValue);
                            if (doiString) {
                                value = doiString;
                            } else {
                                // Numeric date failed to parse (e.g., 0 or bad serial number)
                                console.warn(`Row ${processedCount}: Unparsable numeric date value (${rawValue}) for DOI. Treating as empty string.`);
                                value = ''; 
                            }
                        } else {
                            // If it's a string, accept the raw string value as is, no format validation.
                            value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
                        }

                        // ❌ REMOVED: The strict isValidDOI check for non-empty strings is removed here.
                        // All non-empty strings (including "31st August 2023" and "2/13/2024") are now allowed to pass.
                        // --- END MODIFIED DOI HANDLING ---
                    }

                    // Enforce presence ONLY for 'certificateNo' (the unique key)
                    if (dbField === 'certificateNo' && value === '') {
                        throw new Error(`Missing required unique field: ${header}.`);
                    }

                    // For all other fields (name, hospital, doi), an empty string is now allowed.
                    // @ts-ignore
                    certificate[dbField] = value;
                });

                if (certificate.certificateNo) {
                    certificatesToInsert.push(certificate as ICertificate);
                }
                
            } catch (e: any) {
                // Log and count rows that failed internal processing (e.g., missing Certificate No.)
                console.error(`Row processing failed (row ${processedCount}): ${e.message}`);
                failedCount++;
            }
        }

        if (certificatesToInsert.length === 0) {
            const message = failedCount > 0 
                ? `No valid data rows found to insert. ${failedCount} rows failed initial processing/validation.`
                : 'No valid data rows found to insert.';
            return NextResponse.json({ success: false, message }, { status: 400 });
        }

        // --- Insert into MongoDB, handling duplicates ---
        let insertResult: InsertManyRawResult = { insertedCount: 0 };
        let dbErrors = 0;

        try {
            // Use ordered: false to ensure valid documents are inserted even if duplicates exist
            insertResult = (await Certificate.insertMany(certificatesToInsert, {
                ordered: false, 
                lean: true,
                rawResult: true,
            })) as InsertManyRawResult;
            dbErrors = insertResult.writeErrors?.length || 0; 

        } catch (e: any) {
            // If the bulk write fails completely (e.g., all are duplicates, connection error)
            if (e.code === 11000 || (e.writeErrors && e.writeErrors.length > 0)) { 
                dbErrors = e.writeErrors?.length || 0;
            } else {
                 throw e; // Re-throw any non-duplicate related error (e.g., connection issue)
            }
        }
        
        const insertedCount = insertResult.insertedCount || 0;
        const totalRows = dataRows.length; 
        
        // Final skipped count combines processing errors and database (duplicate) errors
        const finalFailedCount = totalRows - insertedCount; 

        let responseMessage = `${insertedCount} unique certificates successfully uploaded.`;
        if (finalFailedCount > 0) {
            responseMessage += ` ${finalFailedCount} rows were skipped due to errors (e.g., duplicate Certificate No. or processing failures).`;
        }

        return NextResponse.json({
            success: true,
            message: responseMessage,
            summary: {
                totalRows: totalRows,
                successfullyInserted: insertedCount,
                failedToProcess: finalFailedCount,
                dbErrors: dbErrors,
            },
        }, { status: 200 });

    } catch (error: any) {
        console.error('Upload error (FATAL):', error);

        // Catch-all for fatal server-side errors
        return NextResponse.json({ success: false, message: `Server error during file processing or database operation: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}

// Set runtime for higher memory/time limits for large file processing
export const runtime = 'nodejs';
// Ensure the route is executed dynamically
export const dynamic = 'force-dynamic';