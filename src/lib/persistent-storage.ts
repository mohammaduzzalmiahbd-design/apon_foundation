// Upstash Redis - ফ্রি এবং স্থায়ী ডাটা স্টোরেজ
// একবার সেটআপ করলে আর ডিপ্লয় করতে হবে না

import { Redis } from '@upstash/redis';

// Upstash Redis কনফিগারেশন
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const DATA_KEY = 'apon-foundation-data';

export interface PersistentData {
  constitution: any;
  members: any[];
  notices: any[];
  transactions: any[];
  gallery: any[];
  socialLinks: any[];
  receipts: any[];
  vouchers: any[];
  foundationInfo: any;
  socialPosts: any[];
}

const defaultData: PersistentData = {
  constitution: {
    id: "const_001",
    title: "আপন ফাউন্ডেশন গঠনতন্ত্র",
    preface: {
      bismillah: "বিসমিল্লাহির রাহমানির রাহিম",
      content: `কিশোরগঞ্জ জেলার অষ্টগ্রাম উপজেলার বালীগাঁও গ্রামের একদল তরুণ যুবকের আন্তরিক প্রচেষ্টা ও স্বপ্নের ফসল হলো "আপন ফাউন্ডেশন"।
সমাজের উন্নয়ন, মানবতার কল্যাণ এবং সুন্দর বাংলাদেশ বিনির্মাণে তাদের ক্ষুদ্র প্রয়াস থেকেই এই ফাউন্ডেশনের জন্ম।`,
      compiledBy: 'মুহাম্মদ উজ্জল মিয়া',
      cooperatedBy: 'আব্দুল জিহাদ (প্রতিষ্ঠাতা উপদেষ্টা ও প্রধান উদ্যোক্তা)'
    },
    missionVision: {
      mission: [
        'অর্থনৈতিকভাবে দুর্বল, দরিদ্র ও সুবিধাবঞ্চিত মানুষের মৌলিক অধিকার নিশ্চিত করা।',
        'শিক্ষা ও স্বাস্থ্যসেবায় প্রান্তিক জনগোষ্ঠীর জন্য প্রকল্প গ্রহণ ও বাস্তবায়ন করা।',
        'বেকার যুবকদের জন্য কারিগরি প্রশিক্ষণ ও কর্মসংস্থানের সুযোগ সৃষ্টি করা।',
        'প্রাকৃতিক দুর্যোগ ও মানবিক বিপর্যয়ের সময়ে ক্ষতিগ্রস্তদের পাশে দাঁড়ানো এবং পুনর্বাসন কার্যক্রম পরিচালনা করা।'
      ],
      vision: 'একটি আদর্শ সমাজ প্রতিষ্ঠা করা যেখানে দারিদ্র্য, বৈষম্য ও অশিক্ষা থাকবে না।'
    },
    chapters: []
  },
  members: [],
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
  socialPosts: [],
};

// চেক করি Upstash কনফিগার করা আছে কিনা
export function isPersistentStorageConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// ডাটা লোড করা
export async function loadPersistentData(): Promise<PersistentData> {
  if (!isPersistentStorageConfigured()) {
    console.log('Upstash not configured, returning default data');
    return defaultData;
  }

  try {
    const data = await redis.get<PersistentData>(DATA_KEY);
    if (data) {
      console.log('Data loaded from Upstash Redis');
      return { ...defaultData, ...data };
    }
    return defaultData;
  } catch (error) {
    console.error('Error loading from Upstash:', error);
    return defaultData;
  }
}

// ডাটা সেভ করা
export async function savePersistentData(data: PersistentData): Promise<boolean> {
  if (!isPersistentStorageConfigured()) {
    console.log('Upstash not configured, data not saved');
    return false;
  }

  try {
    await redis.set(DATA_KEY, JSON.stringify(data));
    console.log('Data saved to Upstash Redis');
    return true;
  } catch (error) {
    console.error('Error saving to Upstash:', error);
    return false;
  }
}
