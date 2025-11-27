import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Certificate from '@/models/Certificate';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }

        // Get the list of IDs from the request body
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No IDs provided for deletion.' }, 
                { status: 400 }
            );
        }

        // Perform the bulk delete
        const result = await Certificate.deleteMany({
            _id: { $in: ids }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Successfully deleted ${result.deletedCount} certificates.`,
            deletedCount: result.deletedCount 
        }, { status: 200 });

    } catch (error) {
        console.error('Bulk delete error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error during bulk deletion.' }, 
            { status: 500 }
        );
    }
}