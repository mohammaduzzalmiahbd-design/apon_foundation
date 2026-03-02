/**
 * =====================================================
 * আপন ফাউন্ডেশন - Google Sheets ডাটা সিঙ্ক সেটআপ
 * =====================================================
 * 
 * ধাপ ১: Google Sheets তৈরি করুন
 * - https://sheets.google.com গিয়ে নতুন Spreadsheet তৈরি করুন
 * - নাম দিন: "আপন ফাউন্ডেশন ডাটা"
 * 
 * ধাপ ২: Apps Script খুলুন
 * - Extensions → Apps Script ক্লিক করুন
 * - নিচের কোডটি পেস্ট করুন
 * 
 * ধাপ ৩: ডিপ্লয় করুন
 * - Deploy → New deployment
 * - Type: Web app
 * - Execute as: Me
 * - Who has access: Anyone
 * - Deploy ক্লিক করুন
 * - URL কপি করুন
 * 
 * ধাপ ৪: Vercel Environment Variable সেট করুন
 * - NEXT_PUBLIC_GOOGLE_SCRIPT_URL = আপনার URL
 * =====================================================
 */

// শীট ID (অটোমেটিক)
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME = 'Data';

// ডাটা লোড করা
function loadData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // শীট না থাকলে তৈরি করা
    const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    newSheet.appendRow(['Key', 'Value', 'LastUpdated']);
    return {};
  }
  
  const data = sheet.getDataRange().getValues();
  const result = {};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    
    if (key && value) {
      try {
        result[key] = JSON.parse(value);
      } catch (e) {
        result[key] = value;
      }
    }
  }
  
  return result;
}

// ডাটা সেভ করা
function saveData(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
  }
  
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  // পুরনো ডাটা মুছে ফেলা
  targetSheet.clear();
  targetSheet.appendRow(['Key', 'Value', 'LastUpdated']);
  
  // নতুন ডাটা যোগ করা
  const now = new Date().toISOString();
  
  for (const [key, value] of Object.entries(data)) {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    targetSheet.appendRow([key, jsonValue, now]);
  }
  
  return true;
}

// GET Request - ডাটা লোড
function doGet(e) {
  const action = e.parameter.action || 'load';
  
  if (action === 'load') {
    const data = loadData();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data,
      lastSync: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

// POST Request - ডাটা সেভ
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'save';
    
    if (action === 'save') {
      const success = saveData(body.data);
      return ContentService.createTextOutput(JSON.stringify({
        success: success,
        message: 'Data saved successfully',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// টেস্ট ফাংশন
function testConnection() {
  const testData = {
    test: 'Hello from আপন ফাউন্ডেশন!',
    timestamp: new Date().toISOString()
  };
  
  saveData(testData);
  const loaded = loadData();
  
  Logger.log('Saved: ' + JSON.stringify(testData));
  Logger.log('Loaded: ' + JSON.stringify(loaded));
  
  return 'Test successful!';
}
