'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Member,
  Constitution,
  Notice,
  Transaction,
  GalleryImage,
  SocialLink,
  Receipt,
  Voucher,
  FoundationInfo,
  SocialPost,
} from './types';

// ইউনিক ID জেনারেটর
export const generateId = () => Math.random().toString(36).substr(2, 9);

// ডিফল্ট ফাউন্ডেশন তথ্য
const defaultFoundationInfo: FoundationInfo = {
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
};

// ডিফল্ট সোশ্যাল লিংক
const defaultSocialLinks: SocialLink[] = [
  { id: '1', platform: 'facebook', url: 'https://www.facebook.com/aponfoundation.bd', label: 'Facebook', isVisible: true, order: 1 },
  { id: '2', platform: 'whatsapp', url: 'https://wa.me/8801608427115', label: 'WhatsApp', isVisible: true, order: 2 },
];

interface StoreState {
  foundationInfo: FoundationInfo;
  updateFoundationInfo: (info: Partial<FoundationInfo>) => void;
  members: Member[];
  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMembersByCouncil: (council: string) => Member[];
  constitution: Constitution | null;
  initializeConstitution: (constitution: Constitution) => void;
  setPreface: (preface: import('./types').ConstitutionPreface) => void;
  setMissionVision: (missionVision: import('./types').MissionVision) => void;
  addChapter: (chapter: Omit<import('./types').Chapter, 'id' | 'sections'>) => void;
  updateChapter: (id: string, chapter: Partial<import('./types').Chapter>) => void;
  deleteChapter: (id: string) => void;
  addSection: (chapterId: string, section: Omit<import('./types').Section, 'id' | 'subSections'>) => void;
  updateSection: (chapterId: string, sectionId: string, section: Partial<import('./types').Section>) => void;
  deleteSection: (chapterId: string, sectionId: string) => void;
  addSubSection: (chapterId: string, sectionId: string, subSection: Omit<import('./types').SubSection, 'id'>) => void;
  updateSubSection: (chapterId: string, sectionId: string, subSectionId: string, subSection: Partial<import('./types').SubSection>) => void;
  deleteSubSection: (chapterId: string, sectionId: string, subSectionId: string) => void;
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  updateNotice: (id: string, notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  gallery: GalleryImage[];
  addGalleryImage: (image: GalleryImage) => Promise<boolean>;
  deleteGalleryImage: (id: string) => void;
  setGallery: (images: GalleryImage[]) => void;
  socialLinks: SocialLink[];
  addSocialLink: (link: Omit<SocialLink, 'id'>) => void;
  updateSocialLink: (id: string, link: Partial<SocialLink>) => void;
  deleteSocialLink: (id: string) => void;
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>) => void;
  deleteReceipt: (id: string) => void;
  vouchers: Voucher[];
  addVoucher: (voucher: Omit<Voucher, 'id' | 'createdAt'>) => void;
  deleteVoucher: (id: string) => void;
  socialPosts: SocialPost[];
  addSocialPost: (post: Omit<SocialPost, 'id' | 'createdAt'>) => void;
  deleteSocialPost: (id: string) => void;
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      foundationInfo: defaultFoundationInfo,
      updateFoundationInfo: (info) => set((state) => ({ foundationInfo: { ...state.foundationInfo, ...info } })),
      members: [],
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, member) => set((state) => ({ members: state.members.map((m) => m.id === id ? { ...m, ...member, updatedAt: new Date().toISOString() } : m) })),
      deleteMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
      getMembersByCouncil: (council) => get().members.filter((m) => m.council === council),
      constitution: null,
      initializeConstitution: (constitution) => set({ constitution }),
      setPreface: (preface) => set((state) => {
        if (!state.constitution) return { constitution: { id: generateId(), title: 'আপন ফাউন্ডেশন গঠনতন্ত্র', preface, chapters: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
        return { constitution: { ...state.constitution, preface, updatedAt: new Date().toISOString() } };
      }),
      setMissionVision: (missionVision) => set((state) => {
        if (!state.constitution) return { constitution: { id: generateId(), title: 'আপন ফাউন্ডেশন গঠনতন্ত্র', missionVision, chapters: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
        return { constitution: { ...state.constitution, missionVision, updatedAt: new Date().toISOString() } };
      }),
      addChapter: (chapter) => set((state) => {
        if (!state.constitution) return { constitution: { id: generateId(), title: 'আপন ফাউন্ডেশন গঠনতন্ত্র', chapters: [{ ...chapter, id: generateId(), sections: [] }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
        return { constitution: { ...state.constitution, chapters: [...state.constitution.chapters, { ...chapter, id: generateId(), sections: [] }], updatedAt: new Date().toISOString() } };
      }),
      updateChapter: (id, chapter) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === id ? { ...c, ...chapter } : c), updatedAt: new Date().toISOString() } };
      }),
      deleteChapter: (id) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.filter((c) => c.id !== id), updatedAt: new Date().toISOString() } };
      }),
      addSection: (chapterId, section) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === chapterId ? { ...c, sections: [...c.sections, { ...section, id: generateId(), subSections: [] }] } : c), updatedAt: new Date().toISOString() } };
      }),
      updateSection: (chapterId, sectionId, section) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === chapterId ? { ...c, sections: c.sections.map((s) => s.id === sectionId ? { ...s, ...section } : s) } : c), updatedAt: new Date().toISOString() } };
      }),
      deleteSection: (chapterId, sectionId) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === chapterId ? { ...c, sections: c.sections.filter((s) => s.id !== sectionId) } : c), updatedAt: new Date().toISOString() } };
      }),
      addSubSection: (chapterId, sectionId, subSection) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === chapterId ? { ...c, sections: c.sections.map((s) => s.id === sectionId ? { ...s, subSections: [...s.subSections, { ...subSection, id: generateId() }] } : s) } : c), updatedAt: new Date().toISOString() } };
      }),
      updateSubSection: (chapterId, sectionId, subSectionId, subSection) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === chapterId ? { ...c, sections: c.sections.map((s) => s.id === sectionId ? { ...s, subSections: s.subSections.map((ss) => ss.id === subSectionId ? { ...ss, ...subSection } : ss) } : s) } : c), updatedAt: new Date().toISOString() } };
      }),
      deleteSubSection: (chapterId, sectionId, subSectionId) => set((state) => {
        if (!state.constitution) return state;
        return { constitution: { ...state.constitution, chapters: state.constitution.chapters.map((c) => c.id === chapterId ? { ...c, sections: c.sections.map((s) => s.id === sectionId ? { ...s, subSections: s.subSections.filter((ss) => ss.id !== subSectionId) } : s) } : c), updatedAt: new Date().toISOString() } };
      }),
      notices: [],
      addNotice: (notice) => set((state) => ({ notices: [...state.notices, { ...notice, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateNotice: (id, notice) => set((state) => ({ notices: state.notices.map((n) => n.id === id ? { ...n, ...notice } : n) })),
      deleteNotice: (id) => set((state) => ({ notices: state.notices.filter((n) => n.id !== id) })),
      transactions: [],
      addTransaction: (transaction) => set((state) => ({ transactions: [...state.transactions, { ...transaction, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateTransaction: (id, transaction) => set((state) => ({ transactions: state.transactions.map((t) => t.id === id ? { ...t, ...transaction } : t) })),
      deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),
      gallery: [],
      addGalleryImage: async (image) => { set((state) => ({ gallery: [...state.gallery, image] })); return true; },
      deleteGalleryImage: (id) => set((state) => ({ gallery: state.gallery.filter((g) => g.id !== id) })),
      setGallery: (images) => set({ gallery: images }),
      socialLinks: defaultSocialLinks,
      addSocialLink: (link) => set((state) => ({ socialLinks: [...state.socialLinks, { ...link, id: generateId() }] })),
      updateSocialLink: (id, link) => set((state) => ({ socialLinks: state.socialLinks.map((s) => s.id === id ? { ...s, ...link } : s) })),
      deleteSocialLink: (id) => set((state) => ({ socialLinks: state.socialLinks.filter((s) => s.id !== id) })),
      receipts: [],
      addReceipt: (receipt) => set((state) => ({ receipts: [...state.receipts, { ...receipt, id: generateId(), createdAt: new Date().toISOString() }] })),
      deleteReceipt: (id) => set((state) => ({ receipts: state.receipts.filter((r) => r.id !== id) })),
      vouchers: [],
      addVoucher: (voucher) => set((state) => ({ vouchers: [...state.vouchers, { ...voucher, id: generateId(), createdAt: new Date().toISOString() }] })),
      deleteVoucher: (id) => set((state) => ({ vouchers: state.vouchers.filter((v) => v.id !== id) })),
      socialPosts: [],
      addSocialPost: (post) => set((state) => ({ socialPosts: [...state.socialPosts, { ...post, id: generateId(), createdAt: new Date().toISOString() }] })),
      deleteSocialPost: (id) => set((state) => ({ socialPosts: state.socialPosts.filter((p) => p.id !== id) })),
      isInitialized: true,
      setInitialized: (val) => set({ isInitialized: val }),
    }),
    { name: 'apon-foundation-storage', storage: createJSONStorage(() => localStorage) }
  )
);

// বাংলায় সংখ্যা রূপান্তর
export const toBanglaNumber = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
};

export const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export const formatBanglaDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${toBanglaNumber(date.getDate())} ${banglaMonths[date.getMonth()]}, ${toBanglaNumber(date.getFullYear())}`;
};

export const numberToBanglaWords = (num: number): string => {
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  if (num === 0) return 'শূন্য';
  if (num < 0) return 'ঋণাত্মক ' + numberToBanglaWords(Math.abs(num));
  const formatNumber = (n: number): string => {
    if (n < 10) return units[n];
    if (n < 100) { const ten = Math.floor(n / 10); const unit = n % 10; if (unit === 0) return tens[ten]; if (ten === 1) { const teens = ['এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'ঊনিশ']; return teens[unit - 1]; } return tens[ten] + (unit > 0 ? units[unit] : ''); }
    if (n < 1000) { const hundred = Math.floor(n / 100); const remainder = n % 100; let result = units[hundred] + 'শ'; if (remainder > 0) result += ' ' + formatNumber(remainder); return result; }
    return '';
  };
  let result = '';
  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;
  if (crores > 0) result += formatNumber(crores) + ' কোটি ';
  if (lakhs > 0) result += formatNumber(lakhs) + ' লক্ষ ';
  if (thousands > 0) result += formatNumber(thousands) + ' হাজার ';
  if (remainder > 0) result += formatNumber(remainder);
  return result.trim() + ' টাকা মাত্র';
};

export const incomeCategoriesBn: Record<string, string> = { membership_fee: 'সদস্য ফি', monthly_subscription: 'মাসিক চাঁদা', donation: 'অনুদান', grant: 'অনুদান/গ্রান্ট', other: 'অন্যান্য' };
export const expenseCategoriesBn: Record<string, string> = { medical: 'চিকিৎসা', winter_clothes: 'শীতবস্ত্র বিতরণ', sports_equipment: 'ক্রীড়া উপকরণ বিতরণ', educational_materials: 'শিক্ষা উপকরণ বিতরণ', scholarship: 'শিক্ষাবৃত্তি প্রদান', relief: 'ত্রাণ বিতরণ', administrative: 'প্রশাসনিক খরচ', other: 'অন্যান্য' };
