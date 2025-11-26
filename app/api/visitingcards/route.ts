import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect'; // Ensure you have your dbConnect utility
import VisitingCard, { IVisitingCard } from '@/models/VisitingCard';

export const dynamic = 'force-dynamic';

// GET: Fetch cards with Pagination, Search, and Filtering
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    
    // Parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const query = searchParams.get('q') || '';
    const designationFilter = searchParams.get('designation') || '';
    const isExport = searchParams.get('all') === 'true'; // For Excel export

    // Pagination logic
    const skip = isExport ? 0 : (page - 1) * limit;
    const queryLimit = isExport ? 0 : limit;

    // Build Query
    const dbQuery: any = {};

    // 1. Search (Case-insensitive partial match)
    if (query) {
      const searchRegex = new RegExp(query, 'i');
      dbQuery.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { designation: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
      ];
    }

    // 2. Filter
    if (designationFilter) {
      dbQuery.designation = designationFilter;
    }

    // Execute Queries (Parallel for performance)
    // We fetch the data, the total count (for pagination), and unique designations (for the filter dropdown)
    let cardsQuery = VisitingCard.find(dbQuery).sort({ createdAt: -1 }).lean();
            
    if (queryLimit > 0) {
      cardsQuery = cardsQuery.limit(queryLimit).skip(skip);
    }

    const [cards, totalCount, uniqueDesignations] = await Promise.all([
      cardsQuery.exec(),
      VisitingCard.countDocuments(dbQuery),
      VisitingCard.distinct('designation')
    ]);

    return NextResponse.json({
      success: true,
      data: cards,
      total: totalCount,
      page,
      limit: queryLimit || totalCount,
      totalPages: Math.ceil(totalCount / (limit || 1)),
      filters: { designations: uniqueDesignations.filter((d: string) => d) }, // Clean empty strings
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Error fetching visiting cards.' }, { status: 500 });
  }
}

// POST: Create a new Visiting Card
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body: IVisitingCard = await req.json();

    // Validation
    if (!body.firstName || !body.lastName || !body.designation || !body.email || !body.phone) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    const newCard = await VisitingCard.create(body);
    
    return NextResponse.json({ success: true, data: newCard.toObject() }, { status: 201 });

  } catch (error: any) {
    console.error('Creation Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create card.' }, { status: 500 });
  }
}