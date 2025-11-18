// /app/api/analysis/route.ts or /pages/api/analysis.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Certificate from '@/models/Certificate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const connection = await dbConnect();
        if (!connection) {
            return NextResponse.json({ success: false, message: 'Database connection failed.' }, { status: 500 });
        }

        // --- 1. Total Count of Certificates ---
        const totalCertificates = await Certificate.countDocuments();

        // --- 2. Certificates by Hospital (Top N) ---
        const certificatesByHospital = await Certificate.aggregate([
            {
                $group: {
                    _id: '$hospital',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10 // Limit to top 10 hospitals
            },
            {
                $project: {
                    hospital: '$_id',
                    count: 1,
                    _id: 0,
                }
            }
        ]);

        // --- 3. Certificates by Year/Month (for a timeline chart) ---
        const certificatesByTime = await Certificate.aggregate([
            {
                $project: {
                    // Extract year and month from the 'doi' (DD-MM-YYYY string)
                    doiYear: { $substr: ['$doi', 6, 4] },
                    doiMonth: { $substr: ['$doi', 3, 2] },
                }
            },
            {
                $group: {
                    // Group by year and month, then sort them chronologically (e.g., 2024-05)
                    _id: {
                        year: '$doiYear',
                        month: '$doiMonth'
                    },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: { 
                    '_id.year': 1, 
                    '_id.month': 1 
                }
            },
            {
                $project: {
                    _id: 0,
                    label: { $concat: ['$_id.year', '-', '$_id.month'] }, // e.g., "2024-05"
                    count: '$count'
                }
            }
        ]);


        // --- 4. Certificates by Name Length/Initial (Example of a less obvious metric) ---
        // This aggregates by the first letter of the name
        const certificatesByInitial = await Certificate.aggregate([
            {
                $group: {
                    _id: { $toUpper: { $substrCP: ['$name', 0, 1] } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    initial: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);


        return NextResponse.json({
            success: true,
            data: {
                totalCertificates,
                byHospital: certificatesByHospital,
                byTime: certificatesByTime,
                byInitial: certificatesByInitial,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ success: false, message: 'Error fetching analysis data.' }, { status: 500 });
    }
}