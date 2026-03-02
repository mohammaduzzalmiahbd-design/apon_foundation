import { NextRequest, NextResponse } from 'next/server';
import { saveToJsonBin, loadFromJsonBin } from '@/lib/jsonbin';

// GET - ক্লাউড থেকে ডাটা লোড
export async function GET() {
  try {
    const data = await loadFromJsonBin();
    
    if (data) {
      return NextResponse.json({
        data,
        success: true,
        source: 'jsonbin',
        message: 'ক্লাউড থেকে লোড হয়েছে'
      });
    }

    return NextResponse.json({
      data: null,
      success: false,
      message: 'কোনো ডাটা পাওয়া যায়নি'
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'ডাটা লোড করতে সমস্যা', success: false }, { status: 500 });
  }
}

// POST - ক্লাউডে ডাটা সেভ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.fullData) {
      const result = await saveToJsonBin(body.fullData);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        source: 'jsonbin'
      });
    }

    return NextResponse.json({ error: 'Invalid request', success: false }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'ডাটা সেভ করতে সমস্যা', success: false }, { status: 500 });
  }
}
