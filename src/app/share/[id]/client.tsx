'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface SharedImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  createdAt: string;
}

const foundationInfo = {
  nameGreen: 'আপন',
  nameRed: 'ফাউন্ডেশন',
  slogan: 'মানব সেবায় আমরা',
  address: 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ',
  logo: '/upload/Photoroom-20260105_213952.png',
};

const banglaMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const toBanglaNumber = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
};

const formatBanglaDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = toBanglaNumber(date.getDate());
  const month = banglaMonths[date.getMonth()];
  const year = toBanglaNumber(date.getFullYear());
  return `${day} ${month}, ${year}`;
};

export default function ImageShareClient() {
  const router = useRouter();
  const params = useParams();
  const imageId = params.id as string;
  
  const [image, setImage] = useState<SharedImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // API থেকে ইমেজ লোড করা
      try {
        const response = await fetch(`/api/images?id=${imageId}`);
        const data = await response.json();
        if (data.image) {
          setImage(data.image);
        }
      } catch (error) {
        console.error('Failed to load image from server:', error);
      }
      
      setLoading(false);
    };

    if (imageId) {
      loadImage();
    }
  }, [imageId]);

  const copyLink = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const shareLink = window.location.href;
    const text = `আপন ফাউন্ডেশন\n${image?.caption || ''}\n\nছবি দেখতে ক্লিক করুন: ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const shareLink = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1B5E20] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📷</div>
          <h1 className="text-2xl font-bold text-[#1B5E20] mb-2">ছবি পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-4">এই ছবিটি আর উপলব্ধ নেই</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#1B5E20] text-white px-6 py-2 rounded-lg hover:bg-[#2e7d32]"
          >
            🏠 হোম পেজে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5E6]">
      {/* হেডার */}
      <header className="bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] text-white py-3">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-white rounded-full p-1">
              <img 
                src={foundationInfo.logo} 
                alt="লোগো" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold">
                <span className="text-[#4caf50]">আপন</span>
                <span className="text-[#ff6b6b]"> ফাউন্ডেশন</span>
              </h1>
              <p className="text-xs text-[#D4AF37]">মানব সেবায় আমরা</p>
            </div>
          </button>
        </div>
      </header>

      {/* মূল কন্টেন্ট */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* ছবি */}
            <div className="relative">
              <img 
                src={image.url} 
                alt={image.caption || 'গ্যালারি ছবি'} 
                className="w-full aspect-square object-cover"
              />
              {image.category && (
                <span className="absolute top-3 left-3 bg-[#1B5E20] text-white px-3 py-1 rounded-full text-sm">
                  {image.category}
                </span>
              )}
            </div>

            {/* তথ্য */}
            <div className="p-5">
              <h2 className="text-xl font-bold text-[#1B5E20] mb-2">
                {image.caption || 'গ্যালারি ছবি'}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                📅 {formatBanglaDate(image.date || image.createdAt)}
              </p>
              
              <div className="bg-[#1B5E20]/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <strong className="text-[#1B5E20]">আপন ফাউন্ডেশন</strong>
                </p>
                <p className="text-xs text-gray-500">বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ</p>
              </div>

              {/* শেয়ার লিংক */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-2">শেয়ার লিংক:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={typeof window !== 'undefined' ? window.location.href : ''} 
                    readOnly
                    className="flex-1 text-xs bg-white border rounded px-2 py-1 truncate"
                  />
                  <button 
                    onClick={copyLink}
                    className={`px-3 py-1 rounded text-white text-xs ${copied ? 'bg-green-500' : 'bg-[#1B5E20]'}`}
                  >
                    {copied ? 'কপি হয়েছে!' : 'কপি'}
                  </button>
                </div>
              </div>

              {/* শেয়ার বাটন */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600"
                >
                  <span>📱</span> WhatsApp
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  <span>📘</span> Facebook
                </button>
              </div>

              {/* হোমে যাওয়ার বাটন */}
              <button
                onClick={() => router.push('/')}
                className="w-full border-2 border-[#1B5E20] text-[#1B5E20] py-3 rounded-lg font-medium hover:bg-[#1B5E20] hover:text-white transition-colors"
              >
                🏠 ওয়েবসাইটে যান
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
