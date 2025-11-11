import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Usage from "@/models/Usage";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, seconds } = await req.json();

    if (!userId) return NextResponse.json({ success: false, error: "No userId provided" }, { status: 400 });

    // Increment user's usage time
    const usage = await Usage.findOneAndUpdate(
      { userId },
      { $inc: { seconds }, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, usage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) return NextResponse.json({ success: false, error: "No userId provided" }, { status: 400 });

    const usage = await Usage.findOne({ userId });
    return NextResponse.json({ success: true, usage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
