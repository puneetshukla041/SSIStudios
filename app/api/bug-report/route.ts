// D:\ssistudios\ssistudios\app\api\bug-report\route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import BugReport from "@/models/BugReport"; // Ensure BugReport model is imported
import { Member } from "@/models/Employee"; // Ensure Employee/Member model is imported
import * as mongoose from 'mongoose'; 

// Define a local type for the minimal data structure returned by the .lean() query
// We use 'any' for _id since it could be ObjectId or a string UUID depending on how Member is setup.
interface EmployeeLeanResult {
    _id: any; 
    username: string;
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();

        // userId in the payload is now treated as the USERNAME for lookup purposes
        const { userId, title, description, rating, feedbackType } = body; 

        // 1. Basic Validation
        if (!userId || !title || !rating) { 
            return NextResponse.json({ error: "Missing required fields: userId (should be username), title, or rating." }, { status: 400 });
        }
        
        if (!description || description.trim() === "") {
             return NextResponse.json({ error: "Description cannot be empty." }, { status: 400 });
        }

        // 2. LOOK UP EMPLOYEE BY USERNAME (userId is actually the username/ID sent by the client)
        // We query the 'username' field, which is guaranteed to be a string and avoids the CastError on _id.
        const employee = (await Member.findOne({ username: userId }, 'username _id').lean()) as EmployeeLeanResult | null; 
        
        if (!employee) {
            // This 404 is now for a missing username, which is what the client must send.
            return NextResponse.json({ 
                error: `User/Employee not found. Please ensure the username/ID '${userId}' is valid.`,
                details: "The submitted user ID does not match any existing employee username."
            }, { status: 404 });
        }
        
        const username = employee.username;
        // Use the actual MongoDB _id for the BugReport document's userId field, if needed for linking.
        const employeeId = employee._id; 

        // 3. Create and save the new bug report document
        await BugReport.create({
            // Store the actual MongoDB ID for linkage, if available. Otherwise, store the string ID.
            userId: employeeId, 
            title: `[${feedbackType}] ${title}`, 
            username, 
            description,
            rating,
            status: "Open",
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Bug report save error:", error);

        // Catch the CastError here if the Mongoose Model threw it (unlikely now, but safe)
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return NextResponse.json({ 
                error: `Invalid ID format error during lookup.`, 
                details: error.message 
            }, { status: 400 });
        }
        
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: `Validation Error: ${error.message}` }, { status: 400 });
        }

        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}