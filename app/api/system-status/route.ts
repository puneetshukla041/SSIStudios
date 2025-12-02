import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { SystemState } from '@/models/SystemState';

// Helper to connect to DB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(process.env.MONGODB_URI);
};

// Force dynamic execution so we always get the latest DB state (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // Find the global_crash key
    const state = await SystemState.findOne({ key: 'global_crash' });
    
    return NextResponse.json({ 
      crashed: state ? state.value : false 
    });
  } catch (error) {
    console.error("System Status Check Error:", error);
    // Default to false (safe mode) if DB fails, so the site doesn't crash accidentally
    return NextResponse.json({ crashed: false });
  }
}