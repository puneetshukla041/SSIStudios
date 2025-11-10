// =========================================================================
// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Member, IMember } from '@/models/Employee';
import dbConnect from '@/lib/dbconnect';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: 'Username and password are required.' },
      { status: 400 }
    );
  }

  try {
    const user: IMember | null = await Member.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Simple password check (replace with hashing in production)
    const isMatch = password === user.password;

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // 🔑 Include the access object from MongoDB in the response
    return NextResponse.json(
      {
        message: 'Login successful!',
        user: {
          id: user._id,
          username: user.username,
          access: user.access, // ← Added access flags
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
