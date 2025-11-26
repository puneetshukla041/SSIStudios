import dbConnect from "@/lib/dbconnect";
import IdCard from "@/models/IdCard";
import { NextRequest, NextResponse } from "next/server";

// Update ID Card
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Change: params is now a Promise
) {
  try {
    await dbConnect();
    const { id } = await params; // Change: await the params
    const body = await req.json();

    const updatedCard = await IdCard.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCard) {
      return NextResponse.json({ error: "ID Card not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error) {
    console.error("Failed to update ID Card:", error);
    return NextResponse.json({ error: "Failed to update ID Card" }, { status: 500 });
  }
}

// Delete ID Card
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Change: params is now a Promise
) {
  try {
    await dbConnect();
    const { id } = await params; // Change: await the params

    const deletedCard = await IdCard.findByIdAndDelete(id);

    if (!deletedCard) {
      return NextResponse.json({ error: "ID Card not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "ID Card deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete ID Card:", error);
    return NextResponse.json({ error: "Failed to delete ID Card" }, { status: 500 });
  }
}