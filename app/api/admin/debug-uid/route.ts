import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    adminUid: process.env.ADMIN_UID || 'NOT_SET'
  });
}
