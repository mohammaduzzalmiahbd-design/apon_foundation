import { NextRequest, NextResponse } from 'next/server';

// Simple API - শুধু localStorage থেকে ডাটা নেয়
// ব্যাকআপ/রিস্টোর ব্যবহারকারী নিজে করবেন

export async function GET() {
  return NextResponse.json({
    message: 'localStorage ব্যবহার করুন',
    success: true
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'localStorage ব্যবহার করুন',
    success: true
  });
}
