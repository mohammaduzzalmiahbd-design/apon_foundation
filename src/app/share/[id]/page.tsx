import { Metadata } from 'next';
import ImageShareClient from './client';

// ডায়নামিক মেটা ডেটা - সোশ্যাল মিডিয়া প্রিভিউ
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ছবি দেখুন - আপন ফাউন্ডেশন',
    description: 'আপন ফাউন্ডেশন - বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ। মানব সেবায় নিবেদিত অলাভজনক প্রতিষ্ঠান।',
    openGraph: {
      title: 'আপন ফাউন্ডেশন - গ্যালারি',
      description: 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ - মানব সেবায় আমরা',
      type: 'article',
      locale: 'bn_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'আপন ফাউন্ডেশন',
      description: 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ',
    },
  };
}

// সার্ভার কম্পোনেন্ট
export default function SharePage() {
  return <ImageShareClient />;
}
