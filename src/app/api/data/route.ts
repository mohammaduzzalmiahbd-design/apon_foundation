import { NextRequest, NextResponse } from 'next/server';
import { saveToGitHub, loadFromGitHub } from '@/lib/github-db';

// GET - ডাটা পাওয়া (GitHub থেকে)
export async function GET() {
  try {
    const data = await loadFromGitHub();
    
    if (data) {
      return NextResponse.json({
        data,
        success: true,
        source: 'github',
        message: 'GitHub থেকে লোড হয়েছে'
      });
    }

    // যদি GitHub-এ ডাটা না থাকে, default ডাটা দেখাও
    return NextResponse.json({
      data: null,
      success: false,
      message: 'কোনো ডাটা পাওয়া যায়নি'
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to load data', success: false }, { status: 500 });
  }
}

// POST - ডাটা সেভ করা (GitHub-এ)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // সব ডাটা সেভ করা
    if (body.fullData) {
      const dataToSave = {
        ...body.fullData,
        lastSync: new Date().toISOString(),
      };

      const result = await saveToGitHub(dataToSave);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        source: 'github'
      });
    }

    return NextResponse.json({ error: 'Invalid request', success: false }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to save data', success: false }, { status: 500 });
  }
}
