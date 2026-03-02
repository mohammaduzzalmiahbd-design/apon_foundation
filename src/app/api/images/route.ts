import { NextRequest, NextResponse } from 'next/server';
import { loadData, saveData } from '@/lib/server-storage';

// GET - সব ইমেজ বা নির্দিষ্ট ইমেজ পাওয়া
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const data = loadData();
    
    if (id) {
      const image = data.gallery.find((img: any) => img.id === id);
      if (image) {
        return NextResponse.json({ image, success: true });
      }
      return NextResponse.json({ error: 'Image not found', success: false }, { status: 404 });
    }
    
    return NextResponse.json({ images: data.gallery, success: true });
  } catch (error) {
    console.error('GET images error:', error);
    return NextResponse.json({ images: [], success: true });
  }
}

// POST - নতুন ইমেজ সেভ করা
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loadData();
    
    // চেক করা ইমেজ আগে থেকে আছে কিনা
    const existingIndex = data.gallery.findIndex((img: any) => img.id === body.id);
    
    if (existingIndex >= 0) {
      // আপডেট করা
      data.gallery[existingIndex] = {
        ...data.gallery[existingIndex],
        ...body,
        updatedAt: new Date().toISOString()
      };
    } else {
      // নতুন যুক্ত করা
      data.gallery.push({
        ...body,
        createdAt: body.createdAt || new Date().toISOString()
      });
    }
    
    saveData(data);
    
    return NextResponse.json({ 
      success: true, 
      id: body.id,
      message: 'Image saved successfully'
    });
  } catch (error) {
    console.error('POST image error:', error);
    return NextResponse.json({ 
      error: 'Failed to save image', 
      success: false 
    }, { status: 500 });
  }
}

// DELETE - ইমেজ ডিলিট করা
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const data = loadData();
      const originalLength = data.gallery.length;
      data.gallery = data.gallery.filter((img: any) => img.id !== id);
      
      if (data.gallery.length < originalLength) {
        saveData(data);
        return NextResponse.json({ success: true, message: 'Image deleted' });
      }
      return NextResponse.json({ error: 'Image not found', success: false }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'No ID provided', success: false }, { status: 400 });
  } catch (error) {
    console.error('DELETE image error:', error);
    return NextResponse.json({ error: 'Failed to delete', success: false }, { status: 500 });
  }
}
