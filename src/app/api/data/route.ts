import { NextRequest, NextResponse } from 'next/server';
import { loadData, saveData } from '@/lib/server-storage';
import { loadFromGoogle, saveToGoogle, isGoogleSyncConfigured, SyncData } from '@/lib/google-sync';

const DATA_KEY = 'apon-foundation-data';

// GET - ডাটা পাওয়া
export async function GET(request: NextRequest) {
  try {
    // প্রথমে Google থেকে লোড করার চেষ্টা
    if (isGoogleSyncConfigured()) {
      const googleData = await loadFromGoogle();
      if (googleData) {
        return NextResponse.json({ 
          data: googleData, 
          success: true, 
          source: 'google',
          message: 'Google Sheets থেকে লোড হয়েছে'
        });
      }
    }
    
    // Google না থাকলে local file থেকে
    const data = loadData();
    return NextResponse.json({ 
      data, 
      success: true, 
      source: 'local',
      message: 'লোকাল স্টোরেজ থেকে লোড হয়েছে'
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to load data', success: false }, { status: 500 });
  }
}

// POST - ডাটা সেভ করা
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // সব ডাটা সেভ করা
    if (body.fullData) {
      const currentData = loadData();
      const newData: SyncData = {
        members: body.fullData.members ?? currentData.members,
        constitution: body.fullData.constitution ?? currentData.constitution,
        notices: body.fullData.notices ?? currentData.notices,
        transactions: body.fullData.transactions ?? currentData.transactions,
        gallery: body.fullData.gallery ?? currentData.gallery,
        socialLinks: body.fullData.socialLinks ?? currentData.socialLinks,
        receipts: body.fullData.receipts ?? currentData.receipts,
        vouchers: body.fullData.vouchers ?? currentData.vouchers,
        socialPosts: body.fullData.socialPosts ?? [],
        foundationInfo: body.fullData.foundationInfo ?? currentData.foundationInfo,
        admins: body.fullData.admins ?? currentData.admins ?? [],
        lastSync: new Date().toISOString(),
      };
      
      // Local file এ সেভ (fallback)
      saveData(newData);
      
      // Google এ সেভ (পারমানেন্ট)
      let googleSaved = false;
      if (isGoogleSyncConfigured()) {
        googleSaved = await saveToGoogle(newData);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: googleSaved 
          ? 'Google Sheets এ সেভ হয়েছে!' 
          : 'লোকাল স্টোরেজে সেভ হয়েছে',
        source: googleSaved ? 'google' : 'local'
      });
    }
    
    // সেকশন আপডেট করা
    if (body.section && body.data !== undefined) {
      const currentData = loadData();
      (currentData as any)[body.section] = body.data;
      (currentData as any).lastSync = new Date().toISOString();
      saveData(currentData);
      
      // Google এ সেভ
      if (isGoogleSyncConfigured()) {
        await saveToGoogle(currentData as SyncData);
      }
      
      return NextResponse.json({ success: true, message: 'Section updated' });
    }
    
    return NextResponse.json({ error: 'Invalid request', success: false }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to save data', success: false }, { status: 500 });
  }
}
