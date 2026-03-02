// Upstash Redis - ফ্রি ক্লাউড ডাটাবেস
// একবার সেটআপ করলে স্থায়ীভাবে ডাটা থাকবে

import { Redis } from '@upstash/redis';

// Upstash কনফিগারেশন
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

let redis: Redis | null = null;

// Redis ক্লায়েন্ট তৈরি
function getRedis(): Redis | null {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: UPSTASH_URL,
      token: UPSTASH_TOKEN,
    });
  }
  return redis;
}

export interface CloudData {
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
}

const DATA_KEY = 'apon-foundation-data';

const defaultData: CloudData = {
  members: [],
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
      vision: `একটি আদর্শ সমাজ প্রতিষ্ঠা করা যেখানে দারিদ্র্য, বৈষম্য ও অশিক্ষা থাকবে না।`
    },
    chapters: [
      {
        id: "chapter_001",
        number: 1,
        title: "ফাউন্ডেশনের পরিচয় সংক্রান্ত নীতিমালা",
        sections: [
          { id: "s1", number: "১", title: "নামকরণ", content: "এই ফাউন্ডেশনটি \"আপন ফাউন্ডেশন\" নামে পরিচিত হইবে।", subSections: [] },
          { id: "s2", number: "২", title: "প্রতিষ্ঠা", content: "ফাউন্ডেশনটি ২০২৫ খ্রিস্টাব্দের ৪ঠা এপ্রিল তারিখে প্রতিষ্ঠিত হইয়াছে।", subSections: [] },
          { id: "s3", number: "৩", title: "প্রকৃতি", content: "ইহা একটি অলাভজনক, অরাজনৈতিক, অসাম্প্রদায়িক ফাউন্ডেশন।", subSections: [] },
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
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

// চেক করি Redis কনফিগার করা আছে কিনা
export function isCloudStorageConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

// ক্লাউড থেকে ডাটা লোড
export async function loadCloudData(): Promise<CloudData | null> {
  const client = getRedis();
  if (!client) {
    return null;
  }

  try {
    const data = await client.get<CloudData>(DATA_KEY);
    if (data) {
      console.log('✅ Data loaded from Upstash Redis');
      return { ...defaultData, ...data };
    }
    return null;
  } catch (error) {
    console.error('Failed to load from Redis:', error);
    return null;
  }
}

// ক্লাউডে ডাটা সেভ
export async function saveCloudData(data: CloudData): Promise<boolean> {
  const client = getRedis();
  if (!client) {
    return false;
  }

  try {
    await client.set(DATA_KEY, JSON.stringify(data));
    console.log('✅ Data saved to Upstash Redis');
    return true;
  } catch (error) {
    console.error('Failed to save to Redis:', error);
    return false;
  }
}
