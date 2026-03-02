import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all published articles
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // Transform to match the GalleryImage type
    const articles = data.map((item: Record<string, unknown>) => ({
      id: item.id,
      url: item.url,
      caption: item.caption,
      category: item.category,
      date: item.date,
      createdAt: item.created_at || item.date,
      title: item.title,
      content: item.content,
      author: item.author,
      tags: item.tags,
      isPublished: item.is_published
    }));

    return NextResponse.json({
      success: true,
      articles
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save article to Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      url,
      caption,
      category,
      date,
      title,
      content,
      author,
      tags,
      is_published
    } = body;

    if (!id || !url) {
      return NextResponse.json(
        { success: false, error: 'ID and URL are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('articles')
      .upsert({
        id,
        url,
        caption: caption || '',
        category: category || 'সাধারণ',
        date: date || new Date().toISOString().split('T')[0],
        title: title || null,
        content: content || null,
        author: author || null,
        tags: tags || [],
        is_published: is_published ?? true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Supabase save error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save article' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
