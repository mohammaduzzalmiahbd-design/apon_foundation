// Upstash Redis Storage - ফ্রি এবং Vercel-এ পারমানেন্ট ডাটা স্টোরেজ
// সেটআপ: https://upstash.com গিয়ে ফ্রি সাইন আপ করুন

import { Redis } from '@upstash/redis';

// Upstash Redis ক্লায়েন্ট
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.log('Upstash Redis not configured');
    return null;
  }
  
  redis = new Redis({ url, token });
  return redis;
}

// চেক করি Upstash কনফিগার করা আছে কিনা
export function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// ডাটা লোড করা
export async function loadUpstashData<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  
  try {
    const data = await client.get<T>(key);
    console.log(`Loaded ${key} from Upstash`);
    return data;
  } catch (error) {
    console.error(`Failed to load ${key} from Upstash:`, error);
    return null;
  }
}

// ডাটা সেভ করা
export async function saveUpstashData<T>(key: string, data: T): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  
  try {
    await client.set(key, data);
    console.log(`Saved ${key} to Upstash`);
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to Upstash:`, error);
    return false;
  }
}

// সব ডাটা একসাথে লোড
export async function loadAllData(): Promise<Record<string, any> | null> {
  const client = getRedis();
  if (!client) return null;
  
  try {
    const keys = [
      'members', 'constitution', 'notices', 'transactions', 
      'gallery', 'socialLinks', 'receipts', 'vouchers', 
      'foundationInfo', 'socialPosts', 'admins'
    ];
    
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      const value = await client.get(key);
      if (value !== null) {
        data[key] = value;
      }
    }
    
    console.log('Loaded all data from Upstash');
    return data;
  } catch (error) {
    console.error('Failed to load all data from Upstash:', error);
    return null;
  }
}

// সব ডাটা একসাথে সেভ
export async function saveAllData(data: Record<string, any>): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  
  try {
    const pipeline = client.pipeline();
    
    for (const [key, value] of Object.entries(data)) {
      pipeline.set(key, value);
    }
    
    await pipeline.exec();
    console.log('Saved all data to Upstash');
    return true;
  } catch (error) {
    console.error('Failed to save all data to Upstash:', error);
    return false;
  }
}
