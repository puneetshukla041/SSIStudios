import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import { Member } from "@/models/Employee";

// Handle GET /api/user
export async function GET(req: Request) {
  try {
    // Connect to DB
    await dbConnect();

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    // Find user and exclude only __v
    const userProfile = await Member.findById(userId).select("-__v");

    if (!userProfile) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ data: userProfile }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
