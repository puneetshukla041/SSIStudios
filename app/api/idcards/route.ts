import dbConnect from "@/lib/dbconnect"; // Corrected import
import IdCard from "@/models/IdCard";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect(); // Corrected function call
    const cards = await IdCard.find({}).sort({ createdAt: -1 });
    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch ID Cards:", error);
    return NextResponse.json({ error: "Failed to fetch ID Cards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect(); // Corrected function call
    const body = await req.json();
    
    // Basic validation
    if (!body.fullName || !body.idCardNo) {
      return NextResponse.json({ error: "Name and ID Number are required" }, { status: 400 });
    }

    const newCard = await IdCard.create(body);
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Failed to create ID Card:", error);
    return NextResponse.json({ error: "Failed to create ID Card" }, { status: 500 });
  }
}