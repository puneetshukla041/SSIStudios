import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import Usage from "@/models/Usage";

// Ensure DB connection (using your existing pattern or a standard one)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined");
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, seconds } = await req.json();

    if (!userId) return NextResponse.json({ success: false, error: "No userId provided" }, { status: 400 });

    // Calculate minutes delta (e.g., 1 second = 0.01666 minutes)
    const minutesDelta = seconds / 60;

    // Increment user's usage time in minutes
    const usage = await Usage.findOneAndUpdate(
      { userId },
      { 
        $inc: { minutes: minutesDelta }, 
        updatedAt: new Date() 
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, usage }, { status: 200 });
  } catch (error: any) {
    console.error("Usage Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) return NextResponse.json({ success: false, error: "No userId provided" }, { status: 400 });

    const usage = await Usage.findOne({ userId });
    
    // Return the usage doc. The frontend will convert minutes -> seconds for display.
    return NextResponse.json({ success: true, usage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}