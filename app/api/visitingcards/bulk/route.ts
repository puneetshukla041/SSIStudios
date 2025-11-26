import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import VisitingCard from '@/models/VisitingCard';

// DELETE: Bulk delete cards
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No IDs provided for deletion.' }, { status: 400 });
    }

    // Delete all documents where _id is in the provided IDs array
    const result = await VisitingCard.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
        return NextResponse.json({ success: false, message: 'No records found to delete.' }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        message: `Successfully deleted ${result.deletedCount} cards.` 
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Bulk delete operation failed.' }, { status: 500 });
  }
}