import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Transform to match the GalleryImage type
    const article = {
      id: data.id,
      url: data.url,
      caption: data.caption,
      category: data.category,
      date: data.date,
      createdAt: data.created_at || data.date,
      title: data.title,
      content: data.content,
      author: data.author,
      tags: data.tags,
      isPublished: data.is_published
    };

    return NextResponse.json({
      success: true,
      article
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
