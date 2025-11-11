// app/api/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Certificate, { ICertificateDocument } from '@/models/Certificate';
export const dynamic = 'force-dynamic'; // Ensures this API route is dynamic

export async function GET(req: NextRequest) {
  try {
    const connection = await dbConnect();
    if (!connection) {
      return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const query = searchParams.get('q') || '';
    const hospitalFilter = searchParams.get('hospital') || '';

    // Pagination setup
    const skip = (page - 1) * limit;

    // Build Mongoose query
    const dbQuery: any = {};

    // 1. Full text search (across all fields)
    if (query) {
      const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
      dbQuery.$or = [
        { certificateNo: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { hospital: { $regex: searchRegex } },
        { doi: { $regex: searchRegex } },
      ];
    }

    // 2. Hospital filter
    if (hospitalFilter) {
      dbQuery.hospital = hospitalFilter;
    }

    // --- Execute Queries ---

    // 1. Fetch filtered and paginated results (Note: using find and skip/limit for efficiency)
    const certificatesPromise = Certificate.find(dbQuery)
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean for faster queries

    // 2. Fetch total count
    const totalCountPromise = Certificate.countDocuments(dbQuery);

    const [certificates, totalCount] = await Promise.all([certificatesPromise, totalCountPromise]);

    // 3. Fetch list of unique hospitals for filter dropdown
    const uniqueHospitals = await Certificate.distinct('hospital');


    return NextResponse.json({
      success: true,
      data: certificates,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      filters: { hospitals: uniqueHospitals.filter(h => h) }, // Filter out any empty strings
    }, { status: 200 });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ success: false, message: 'Error fetching certificates.' }, { status: 500 });
  }
}