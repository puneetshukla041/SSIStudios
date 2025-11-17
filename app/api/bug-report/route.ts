import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import BugReport from "@/models/BugReport";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();

        // The API route handler is slightly modified to also accept feedbackType
        const { userId, title, description, rating, feedbackType } = body; 

        // Removed required check for 'description' because we handle a default in the client, 
        // but the Mongoose schema requires it, so it's safer to ensure a non-empty string is sent.
        if (!userId || !title || !rating) { 
            return NextResponse.json({ error: "Missing required fields: userId, title, or rating." }, { status: 400 });
        }
        
        // Final check for description to match the Mongoose schema requirement
        if (!description || description.trim() === "") {
             return NextResponse.json({ error: "Description cannot be empty." }, { status: 400 });
        }

        await BugReport.create({
            userId,
            title: `[${feedbackType}] ${title}`, // Prepend type for better tracking in MongoDB
            description,
            rating,
            status: "Open",
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Bug report save error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}