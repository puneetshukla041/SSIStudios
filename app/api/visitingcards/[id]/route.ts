import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import VisitingCard from '@/models/VisitingCard';

export const dynamic = 'force-dynamic';

// PUT: Update a specific card
export async function PUT(req: NextRequest, context: any) {
  try {
    await dbConnect();
    const { id } = context.params;
    const body = await req.json();

    const updatedCard = await VisitingCard.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Ensure new data matches schema rules
    }).lean();

    if (!updatedCard) {
      return NextResponse.json({ success: false, message: 'Visiting Card not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCard }, { status: 200 });
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update card.' }, { status: 500 });
  }
}

// DELETE: Delete a specific card
export async function DELETE(req: NextRequest, context: any) {
  try {
    await dbConnect();
    const { id } = context.params;

    const deletedCard = await VisitingCard.findByIdAndDelete(id).lean();

    if (!deletedCard) {
      return NextResponse.json({ success: false, message: 'Visiting Card not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Card deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete card.' }, { status: 500 });
  }
}