'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { GalleryImage, FoundationInfo } from '@/lib/types';
import { useStore } from '@/lib/store';
import { formatBanglaDate, toBanglaNumber } from '@/lib/store';
import { Facebook, MessageCircle, Share2, Calendar, User, Tag, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function ArticlePage() {
  const params = useParams();
  const { gallery, foundationInfo, isInitialized } = useStore();
  const [copied, setCopied] = useState(false);

  // Find article using useMemo instead of useEffect with setState
  const article = useMemo(() => {
    if (params.id && gallery.length > 0) {
      return gallery.find((g: GalleryImage) => g.id === params.id) || null;
    }
    return null;
  }, [params.id, gallery]);

  // শেয়ার ফাংশন
  const shareOnFacebook = () => {
    const url = window.location.href;
    const text = article?.title || article?.caption || '';
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `${article?.title || article?.caption}\n\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20] mx-auto mb-4"></div>
          <p className="text-gray-500">আর্টিকেল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">আর্টিকেল পাওয়া যায়নি</h1>
          <p className="text-gray-500 mb-6">এই আর্টিকেলটি আর নেই বা সরানো হয়েছে।</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-6 py-3 rounded-lg hover:bg-[#2e7d32] transition-colors"
          >
            <Home size={18} /> হোম পেজে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full p-1">
                <img 
                  src={foundationInfo.logo} 
                  alt="লোগো" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-[#FFD700]">আপন</span>
                  <span className="text-[#FFB6C1]"> ফাউন্ডেশন</span>
                </h1>
                <p className="text-xs text-[#FFD700]/80">মানব সেবায় আমরা</p>
              </div>
            </Link>
            <Link 
              href="/"
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={18} /> হোম
            </Link>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative">
            <img 
              src={article.url} 
              alt={article.title || article.caption}
              className="w-full h-[300px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-[#D4AF37] text-[#1B5E20] px-4 py-1 rounded-full text-sm font-semibold">
                {article.category}
              </span>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                {article.title || article.caption}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                {article.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> {formatBanglaDate(article.date)}
                  </span>
                )}
                {article.author && (
                  <span className="flex items-center gap-1">
                    <User size={16} /> {article.author}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 md:p-10">
            {/* বিসমিল্লাহ */}
            <div className="text-center text-3xl mb-6 font-arabic text-[#1B5E20]" style={{ fontFamily: 'Amiri, serif' }}>
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {article.content ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                  {article.content}
                </div>
              ) : (
                <p className="text-gray-600 italic text-center py-8">
                  এই আর্টিকেলের বিস্তারিত বিবরণ এখনো যোগ করা হয়নি।
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="my-8 border-t-2 border-[#D4AF37]/30"></div>

            {/* Share Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 text-center text-[#1B5E20]">
                📤 এই আর্টিকেল শেয়ার করুন
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:bg-[#166fe5] transition-colors"
                >
                  <Facebook size={20} /> ফেসবুকে শেয়ার
                </button>
                <button 
                  onClick={shareOnWhatsApp}
                  className="flex items-center gap-2 bg-[#25d366] text-white px-6 py-3 rounded-lg hover:bg-[#22c55e] transition-colors"
                >
                  <MessageCircle size={20} /> হোয়াটসঅ্যাপ
                </button>
                <button 
                  onClick={copyLink}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {copied ? '✓ কপি হয়েছে!' : <><Share2 size={20} /> লিংক কপি</>}
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              <p>
                © {toBanglaNumber(new Date().getFullYear())} আপন ফাউন্ডেশন | 
                বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ
              </p>
              <p className="mt-1">
                📧 {foundationInfo.email} | 📱 {foundationInfo.whatsapp}
              </p>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {gallery.filter(g => g.id !== article.id && g.isPublished).length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-[#1B5E20] mb-6">📰 আরো আর্টিকেল</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {gallery
                .filter(g => g.id !== article.id && g.isPublished)
                .slice(0, 3)
                .map((item) => (
                  <Link 
                    key={item.id}
                    href={`/article/${item.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img 
                      src={item.url} 
                      alt={item.title || item.caption}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <span className="text-xs text-[#D4AF37] font-semibold">{item.category}</span>
                      <h3 className="font-semibold text-gray-800 mt-1 line-clamp-2">
                        {item.title || item.caption}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
