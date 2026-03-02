// পারমানেন্ট ডাটা স্টোরেজ - সার্ভার সাইড অনলি
// এই ফাইল শুধু API route এ ব্যবহার করবে

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'foundation-data.json');

// সব ডাটা টাইপ
export interface FoundationData {
  members: any[];
  constitution: any;
  notices: any[];
  transactions: any[];
  gallery: any[];
  socialLinks: any[];
  receipts: any[];
  vouchers: any[];
  foundationInfo: any;
  admins: any[];
}

// ডিফল্ট ডাটা
const defaultData: FoundationData = {
  members: [],
  constitution: null,
  notices: [],
  transactions: [],
  gallery: [],
  socialLinks: [
    { id: '1', platform: 'facebook', url: 'https://www.facebook.com/aponfoundation.bd', label: 'Facebook', isVisible: true, order: 1 },
    { id: '2', platform: 'whatsapp', url: 'https://wa.me/8801608427115', label: 'WhatsApp', isVisible: true, order: 2 },
  ],
  receipts: [],
  vouchers: [],
  foundationInfo: {
    nameGreen: 'আপন',
    nameRed: 'ফাউন্ডেশন',
    slogan: 'মানব সেবায় আমরা',
    address: 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ',
    established: '০২/০৪/২০২৫',
    whatsapp: '8801608-427115',
    email: 'aponfoundation.baligaw@gmail.com',
    website: 'www.aponfoundation.org',
    facebook: 'https://www.facebook.com/aponfoundation.bd',
    logo: '/upload/Photoroom-20260105_213952.png',
  },
  admins: [],
};

// ডিরেক্টরি নিশ্চিত করা
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// সব ডাটা পড়া
export function loadData(): FoundationData {
  try {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
      return { ...defaultData };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return { ...defaultData, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { ...defaultData };
  }
}

// সব ডাটা সেভ করা
export function saveData(data: Partial<FoundationData>): void {
  try {
    ensureDataDir();
    const currentData = loadData();
    const newData = { ...currentData, ...data };
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

// নির্দিষ্ট সেকশন আপডেট করা
export function updateSection<K extends keyof FoundationData>(key: K, value: FoundationData[K]): void {
  const data = loadData();
  data[key] = value;
  saveData(data);
}

// নির্দিষ্ট সেকশন পড়া
export function getSection<K extends keyof FoundationData>(key: K): FoundationData[K] {
  const data = loadData();
  return data[key];
}

// গ্যালারি ইমেজ যুক্ত করা
export function addGalleryImage(image: any): void {
  const gallery = getSection('gallery');
  gallery.push({ ...image, createdAt: new Date().toISOString() });
  updateSection('gallery', gallery);
}

// গ্যালারি ইমেজ ডিলিট করা
export function deleteGalleryImage(id: string): void {
  const gallery = getSection('gallery');
  updateSection('gallery', gallery.filter((img: any) => img.id !== id));
}

// গ্যালারি ইমেজ পড়া
export function getGalleryImage(id: string): any | null {
  const gallery = getSection('gallery');
  return gallery.find((img: any) => img.id === id) || null;
}
