// app/api/auth/me/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "mock-user-id",
    username: "testuser",
    email: "testuser@example.com",
  });
}
