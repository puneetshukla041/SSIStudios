import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Certificate, { ICertificate } from '@/models/Certificate'; // Import ICertificate

// Ensure the route is executed dynamically
export const dynamic = 'force-dynamic';

// GET handler for fetching certificates
export async function GET(req: NextRequest) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }
        
        const { searchParams } = new URL(req.url);
        // Use 'all' flag to determine if pagination/limits should be ignored for export
        const isExport = searchParams.get('all') === 'true';
        
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const query = searchParams.get('q') || '';
        const hospitalFilter = searchParams.get('hospital') || '';

        // Pagination setup
        const skip = isExport ? 0 : (page - 1) * limit;
        const queryLimit = isExport ? 0 : limit; // Limit 0 means no limit in Mongoose

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
                { status: { $regex: searchRegex } }, // Included status in search
            ];
        }

        // 2. Hospital filter
        if (hospitalFilter) {
            dbQuery.hospital = hospitalFilter;
        }

        // --- Execute Queries ---

        // 1. Fetch filtered results
        let certificatesQuery = Certificate.find(dbQuery)
            .lean();
            
        if (queryLimit > 0) {
            certificatesQuery = certificatesQuery.limit(queryLimit).skip(skip);
        }

        const certificatesPromise = certificatesQuery.exec();

        // 2. Fetch total count (only needed if not exporting all data)
        const totalCountPromise = Certificate.countDocuments(dbQuery);

        // 3. Fetch list of unique hospitals for filter dropdown
        const uniqueHospitalsPromise = Certificate.distinct('hospital');

        const [certificates, totalCount, uniqueHospitals] = await Promise.all([
            certificatesPromise, 
            totalCountPromise, 
            uniqueHospitalsPromise
        ]);

        return NextResponse.json({
            success: true,
            data: certificates,
            total: totalCount,
            page,
            limit: queryLimit || totalCount, // Report the effective limit
            totalPages: Math.ceil(totalCount / limit),
            filters: { hospitals: uniqueHospitals.filter((h: string) => h) }, // Filter out any empty strings
        }, { status: 200 });
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ success: false, message: 'Error fetching certificates.' }, { status: 500 });
    }
}

// POST handler for creating a new certificate
export async function POST(req: NextRequest) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }

        const body: ICertificate = await req.json();

        // Basic validation on required fields and DOI format
        if (!body.certificateNo || !body.name || !body.hospital || !body.doi) {
            return NextResponse.json({ success: false, message: 'Validation Error: Missing required fields (certificateNo, name, hospital, doi).' }, { status: 400 });
        }
        if (!/^\d{2}-\d{2}-\d{4}$/.test(body.doi)) {
            return NextResponse.json({ success: false, message: 'Validation Error: DOI must be in DD-MM-YYYY format.' }, { status: 400 });
        }

        // Create new document (Mongoose will apply 'status' default)
        const newCertificate = await Certificate.create(body);

        return NextResponse.json({ success: true, data: newCertificate.toObject() }, { status: 201 });

    } catch (error: any) {
        console.error('Creation error:', error);
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'Creation failed: Certificate No. must be unique.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Server error during certificate creation.' }, { status: 500 });
    }
}