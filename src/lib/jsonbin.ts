// JSONBin.io - পারমানেন্ট ক্লাউড স্টোরেজ
// সব ডাটা অটোমেটিক সেভ ও লোড হবে

const JSONBIN_API_KEY = '$2a$10$UFbnELNoFdI2JXN2VXNIp.MBKM4X4LhB42T5upCfsxXHy/a3z7l8q';
const JSONBIN_BIN_ID = '683e5e188a456b7f66d5e7c0'; // আপনার ডাটার ID
const JSONBIN_URL = 'https://api.jsonbin.io/v3';

// ডাটা সেভ করা
export async function saveToJsonBin(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${JSONBIN_URL}/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({
        ...data,
        lastSync: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log('✅ ক্লাউডে সেভ হয়েছে!');
      return { success: true, message: 'ক্লাউডে সেভ হয়েছে!' };
    } else {
      // যদি bin না থাকে, নতুন তৈরি করা
      const createResponse = await fetch(`${JSONBIN_URL}/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Name': 'apon-foundation-data',
        },
        body: JSON.stringify({
          ...data,
          lastSync: new Date().toISOString(),
        }),
      });

      if (createResponse.ok) {
        console.log('✅ নতুন bin তৈরি হয়েছে!');
        return { success: true, message: 'ক্লাউডে সেভ হয়েছে!' };
      }

      return { success: false, message: 'সেভ করতে সমস্যা হয়েছে' };
    }
  } catch (error) {
    console.error('Save error:', error);
    return { success: false, message: 'সেভ করতে সমস্যা হয়েছে' };
  }
}

// ডাটা লোড করা
export async function loadFromJsonBin(): Promise<any | null> {
  try {
    const response = await fetch(`${JSONBIN_URL}/b/${JSONBIN_BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ ক্লাউড থেকে লোড হয়েছে!');
      return result.record;
    }
    return null;
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
}
