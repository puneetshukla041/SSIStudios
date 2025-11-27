import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect'; // FIXED: Changed to lowercase to match 'certificates/route.ts'
import Certificate from '@/models/Certificate'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // 1. Count Doctors (Case insensitive search for "Dr" or "Dr." at start)
    const doctorsCount = await Certificate.countDocuments({
      name: { $regex: /^(dr|dr\.)/i } 
    });

    // 2. Count Total Records
    const totalRecords = await Certificate.countDocuments({});

    // 3. Calculate Staff
    const staffCount = totalRecords - doctorsCount;

    return NextResponse.json({
      totalRecords,
      doctorsCount,
      staffCount
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}