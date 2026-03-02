// Google Sheets ব্যবহার করে ডাটা সিঙ্ক্রোনাইজেশন
// URL localStorage থেকে পড়বে

export interface SyncData {
  members: any[];
  constitution: any;
  notices: any[];
  transactions: any[];
  gallery: any[];
  socialLinks: any[];
  receipts: any[];
  vouchers: any[];
  foundationInfo: any;
  socialPosts: any[];
  admins: any[];
  lastSync: string;
}

// localStorage থেকে Google Script URL পড়া
function getGoogleScriptUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('googleScriptUrl');
}

export function isGoogleSyncConfigured(): boolean {
  return Boolean(getGoogleScriptUrl());
}

// Google Sheets থেকে ডাটা লোড
export async function loadFromGoogle(): Promise<SyncData | null> {
  const url = getGoogleScriptUrl();
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(`${url}?action=load`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to load from Google:', response.status);
      return null;
    }

    const result = await response.json();
    if (result.success && result.data) {
      console.log('✅ Data loaded from Google Sheets');
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error loading from Google:', error);
    return null;
  }
}

// Google Sheets এ ডাটা সেভ
export async function saveToGoogle(data: SyncData): Promise<boolean> {
  const url = getGoogleScriptUrl();
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save',
        data: {
          ...data,
          lastSync: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to save to Google:', response.status);
      return false;
    }

    const result = await response.json();
    if (result.success) {
      console.log('✅ Data saved to Google Sheets');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving to Google:', error);
    return false;
  }
}

// সিঙ্ক স্ট্যাটাস চেক
export async function checkSyncStatus(): Promise<{ configured: boolean; working: boolean }> {
  const url = getGoogleScriptUrl();
  if (!url) {
    return { configured: false, working: false };
  }

  try {
    const response = await fetch(`${url}?action=load`);
    const result = await response.json();
    return { configured: true, working: result.success === true };
  } catch {
    return { configured: true, working: false };
  }
}
