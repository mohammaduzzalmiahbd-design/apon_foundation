// আপন ফাউন্ডেশন - Constants

import { OrganizationInfo, SocialLink } from '@/types';

export const ORGANIZATION_INFO: OrganizationInfo = {
  name: 'আপন ফাউন্ডেশন',
  nameGreen: 'আপন',
  nameRed: 'ফাউন্ডেশন',
  slogan: 'মানব সেবায় আমরা',
  address: 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ',
  established: '০২/০৪/২০২৫',
  whatsapp: '8801608-427115',
  email: 'aponfoundation.baligaw@gmail.com',
  facebook: 'https://www.facebook.com/aponfoundation.bd',
};

// Color Theme
export const COLORS = {
  primary: '#1B5E20',     // গাঢ় সবুন
  secondary: '#8B0000',   // গাঢ় লাল/মেরুন
  accent: '#D4AF37',      // সোনালি
  background: '#FDF5E6',  // ক্রিম/অফ-হোয়াইট
};

// বিসমিল্লাহির রাহমানির রাহিম (Arabic)
export const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

// Default Social Links
export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: '1',
    platform: 'facebook',
    url: 'https://www.facebook.com/aponfoundation.bd',
    label: 'Facebook',
  },
  {
    id: '2',
    platform: 'whatsapp',
    url: 'https://wa.me/8801608427115',
    label: 'WhatsApp',
  },
];

// Council Types
export const COUNCIL_TYPES = {
  general: 'সাধারণ পরিষদ',
  executive: 'নির্বাহী পরিষদ',
  advisor: 'উপদেষ্টা পরিষদ',
} as const;

// Income Categories
export const INCOME_CATEGORIES = {
  donation: 'অনুদান',
  subscription: 'চাঁদা',
  grant: 'অনুদান/গ্রান্ট',
  other: 'অন্যান্য',
} as const;

// Expense Categories
export const EXPENSE_CATEGORIES = {
  medical: 'চিকিৎসা',
  'winter-clothes': 'শীতবস্ত্র',
  sports: 'ক্রীড়া উপকরণ',
  education: 'শিক্ষা উপকরণ',
  scholarship: 'শিক্ষাবৃত্তি',
  other: 'অন্যান্য',
} as const;

// Blood Groups
export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

// Designations for each council
export const DESIGNATIONS = {
  general: ['সদস্য', 'সভাপতি', 'সহ-সভাপতি', 'সাধারণ সম্পাদক', 'যুগ্ম সাধারণ সম্পাদক', 'কোষাধ্যক্ষ', 'সাংগঠনিক সম্পাদক', 'দপ্তর সম্পাদক'],
  executive: ['সভাপতি', 'সহ-সভাপতি', 'সাধারণ সম্পাদক', 'যুগ্ম সাধারণ সম্পাদক', 'কোষাধ্যক্ষ', 'সাংগঠনিক সম্পাদক', 'দপ্তর সম্পাদক', 'সদস্য'],
  advisor: ['উপদেষ্টা', 'প্রধান উপদেষ্টা', 'সিনিয়র উপদেষ্টা'],
};

// Menu Items
export const MENU_ITEMS = [
  { id: 'home', label: '🏠 হোম', icon: 'home' },
  { id: 'constitution', label: '📜 গঠনতন্ত্র', icon: 'scroll' },
  { id: 'council', label: '👥 পরিচালনা পরিষদ', icon: 'users', hasDropdown: true },
  { id: 'notice', label: '📢 নোটিশ বোর্ড', icon: 'bell' },
  { id: 'gallery', label: '🖼️ গ্যালারি', icon: 'image' },
  { id: 'finance', label: '💰 আর্থিক ব্যবস্থাপনা', icon: 'wallet' },
  { id: 'documents', label: '📄 ডকুমেন্ট', icon: 'file', hasDropdown: true },
  { id: 'contact', label: '📞 যোগাযোগ', icon: 'phone' },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  chapters: 'apon_chapters',
  members: 'apon_members',
  notices: 'apon_notices',
  gallery: 'apon_gallery',
  incomes: 'apon_incomes',
  expenses: 'apon_expenses',
  receipts: 'apon_receipts',
  vouchers: 'apon_vouchers',
  contactMessages: 'apon_contact_messages',
  socialLinks: 'apon_social_links',
};
