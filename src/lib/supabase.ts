import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qvrtrkblduhgvttrhvkh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnRya2JsZHVoZ3Z0dHJodmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzQ1NjcsImV4cCI6MjA1NjgxMDU2N30.TFlrXvJBTg_FVc-OTfxV_xTkJmLqG9m5sQJ2p6jVKGQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to save article to Supabase
export async function saveArticleToSupabase(article: {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  title?: string;
  content?: string;
  author?: string;
  tags?: string[];
  isPublished?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .upsert({
        id: article.id,
        url: article.url,
        caption: article.caption,
        category: article.category,
        date: article.date,
        title: article.title || null,
        content: article.content || null,
        author: article.author || null,
        tags: article.tags || [],
        is_published: article.isPublished || false,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase save error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Save article error:', err);
    return { success: false, error: err };
  }
}

// Helper function to get article from Supabase
export async function getArticleFromSupabase(id: string) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Fetch article error:', err);
    return { success: false, error: err };
  }
}

// Helper function to get all published articles
export async function getAllPublishedArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch all error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Fetch all articles error:', err);
    return { success: false, error: err };
  }
}

// Delete article from Supabase
export async function deleteArticleFromSupabase(id: string) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('Delete article error:', err);
    return { success: false, error: err };
  }
}
