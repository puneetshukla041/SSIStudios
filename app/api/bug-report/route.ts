// app/api/bug-report/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import BugReport from "@/models/BugReport";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { userId, title, description, rating } = body;

    if (!userId || !title || !description || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await BugReport.create({
      userId,
      title,
      description,
      rating,
      status: "Open",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bug report save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
