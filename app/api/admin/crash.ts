import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { SystemState } from '@/models/SystemState'; // Ensure path is correct

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

// Force dynamic to prevent caching the result
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const state = await SystemState.findOne({ key: 'global_crash' });
    
    return NextResponse.json({ 
      crashed: state ? state.value : false 
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ crashed: false });
  }
}