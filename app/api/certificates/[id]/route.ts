import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Certificate, { ICertificate } from '@/models/Certificate';

export const dynamic = 'force-dynamic';

// Helper function to validate DOI format (DD-MM-YYYY)
const isValidDOI = (doi: string): boolean => {
    if (!doi || typeof doi !== 'string' || doi.length !== 10) return false;
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(doi);
};

// PUT handler for updating a single certificate
export async function PUT(
    req: NextRequest, 
    context: { params: Promise<{ id: string }> } // FIX: Correct Type
) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }
        
        // --- FIX: Await params here ---
        const { id } = await context.params;
        const body: Partial<ICertificate> = await req.json();

        const updateData: Partial<ICertificate> = {};

        // Validate and set fields for update
        if (body.certificateNo && body.certificateNo.trim() !== '') {
            updateData.certificateNo = body.certificateNo.trim();
        }
        if (body.name && body.name.trim() !== '') {
            updateData.name = body.name.trim();
        }
        if (body.hospital && body.hospital.trim() !== '') {
            updateData.hospital = body.hospital.trim();
        }
        if (body.doi && body.doi.trim() !== '') {
            const trimmedDoi = body.doi.trim();
            if (!isValidDOI(trimmedDoi)) {
                return NextResponse.json({ success: false, message: 'Validation Error: DOI must be in DD-MM-YYYY format.' }, { status: 400 });
            }
            updateData.doi = trimmedDoi;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, message: 'No valid data provided for update.' }, { status: 400 });
        }

        const certificate = await Certificate.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose schema validators
        }).lean();

        if (!certificate) {
            return NextResponse.json({ success: false, message: 'Certificate not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: certificate }, { status: 200 });

    } catch (error: any) {
        console.error('Update error:', error);

        // Handle Mongoose duplicate key error (11000)
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'Update failed: Certificate No. must be unique.' }, { status: 400 });
        }
        
        return NextResponse.json({ success: false, message: 'Server error during certificate update.' }, { status: 500 });
    }
}

// DELETE handler for deleting a single certificate
export async function DELETE(
    req: NextRequest, 
    context: { params: Promise<{ id: string }> } // FIX: Correct Type
) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }
        
        // --- FIX: Await params here ---
        const { id } = await context.params;

        console.log(`Attempting to delete Certificate ID: ${id}`); // Debug log

        const deletedCertificate = await Certificate.findByIdAndDelete(id).lean();

        if (!deletedCertificate) {
            // If ID is valid but not found in DB, we still return 404
            return NextResponse.json({ success: false, message: 'Certificate not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Certificate deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, message: 'Server error during certificate deletion.' }, { status: 500 });
    }
}