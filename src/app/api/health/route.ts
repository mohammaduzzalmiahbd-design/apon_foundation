import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '2.0-jsonbin',
    message: 'API কাজ করছে!',
    timestamp: new Date().toISOString()
  });
}
