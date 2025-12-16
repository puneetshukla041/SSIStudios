import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
// Assuming your Certificate model has 'certificateNo' indexed as unique.
import Certificate, { ICertificate } from '@/models/Certificate'; 
import * as XLSX from 'xlsx';

// Maximum file size of 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

                    // Handle other string fields first
                    if (dbField !== 'doi') {
                        value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
                    } else {
                        // DOI Handling
                        if (typeof rawValue === 'number') {
                            const doiString = safeXlsxDateToDoi(rawValue);
                            value = doiString ? doiString : ''; 
                        } else {
                            value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
                        }
                    }

                    // Enforce presence ONLY for 'certificateNo'
                    if (dbField === 'certificateNo' && value === '') {
                        throw new Error(`Missing required unique field: ${header}.`);
                    }

                    // @ts-ignore
                    certificate[dbField] = value;
                });

                if (certificate.certificateNo) {
                    certificatesToInsert.push(certificate as ICertificate);
                }
                
            } catch (e: any) {
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

        // --- Insert into MongoDB & Capture IDs ---
        
        
        let insertedIds: string[] = [];
        let insertedCount = 0;
        let dbErrors = 0;

        try {
            // We REMOVE 'rawResult: true' here to get the actual documents back easily.
            // 'ordered: false' allows continuing even if duplicates are found.
            const resultDocs = await Certificate.insertMany(certificatesToInsert, {
                ordered: false, 
                lean: true
            });

            // If we reach here, all documents were inserted successfully
            insertedCount = resultDocs.length;
            insertedIds = resultDocs.map((doc: any) => doc._id.toString());

        } catch (e: any) {
            // Handle "Partial Success" (e.g., duplicates existed, but some were new)
            if (e.writeErrors && e.writeErrors.length > 0) { 
                dbErrors = e.writeErrors.length;
                
                // Mongoose attaches successful documents to 'insertedDocs' in the error object
                if (Array.isArray(e.insertedDocs)) {
                    insertedCount = e.insertedDocs.length;
                    insertedIds = e.insertedDocs.map((doc: any) => doc._id.toString());
                }
            } else {
                 throw e; // Non-duplicate fatal error
            }
        }
        
        const totalRows = dataRows.length; 
        const finalFailedCount = totalRows - insertedCount; 

        let responseMessage = `${insertedCount} unique certificates successfully uploaded.`;
        if (finalFailedCount > 0) {
            responseMessage += ` ${finalFailedCount} rows were skipped due to errors (e.g., duplicate Certificate No.).`;
        }

        return NextResponse.json({
            success: true,
            message: responseMessage,
            ids: insertedIds, // ✅ THIS IS WHAT THE FRONTEND NEEDS
            summary: {
                totalRows: totalRows,
                successfullyInserted: insertedCount,
                failedToProcess: finalFailedCount,
                dbErrors: dbErrors,
            },
        }, { status: 200 });

    } catch (error: any) {
        console.error('Upload error (FATAL):', error);
        return NextResponse.json({ success: false, message: `Server error: ${error.message}` }, { status: 500 });
    }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';