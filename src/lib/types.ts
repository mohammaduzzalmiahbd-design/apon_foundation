// Foundation Types

// সদস্য টাইপ
export interface Member {
  id: string;
  serialNo: number;
  name: string;
  fatherName: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  council: 'general' | 'executive' | 'advisor'; // সাধারণ, নির্বাহী, উপদেষ্টা
  designation?: string; // পদবী (সভাপতি, সম্পাদক ইত্যাদি)
  photo?: string;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

// গঠনতন্ত্র টাইপ
export interface SubSection {
  id: string;
  number: string; // যেমন: ১.১.১
  title: string;
  content: string;
}

export interface Section {
  id: string;
  number: string; // যেমন: ১.১
  title: string;
  content: string;
  subSections: SubSection[];
}

export interface Chapter {
  id: string;
  number: number; // যেমন: ১
  title: string;
  sections: Section[];
}

export interface ConstitutionPreface {
  bismillah: string;
  content: string;
  compiledBy: string; // সংকলন ও সম্পাদনায়
  cooperatedBy: string; // সার্বিক সহযোগিতায়
}

export interface MissionVision {
  mission: string[]; // মিশন পয়েন্ট সমূহ
  vision: string; // ভিশন টেক্সট
}

export interface Constitution {
  id: string;
  title: string;
  preface?: ConstitutionPreface; // ভূমিকা
  missionVision?: MissionVision; // মিশন ও ভিশন
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

// নোটিশ টাইপ
export type NoticeType = 'general' | 'disciplinary';

export interface Notice {
  id: string;
  type: NoticeType;
  subject: string;
  content: string;
  date: string;
  referenceNumber: string;
  recipientCouncil?: 'general' | 'executive' | 'advisor' | 'all';
  recipientMemberIds?: string[];
  // শাস্তিমূলক নোটিশের জন্য
  violationSection?: string;
  violationDetails?: string;
  punishmentDetails?: string;
  createdAt: string;
}

// আর্থিক টাইপ
export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'medical' // চিকিৎসা
  | 'winter_clothes' // শীতবস্ত্র
  | 'sports_equipment' // ক্রীড়া উপকরণ
  | 'educational_materials' // শিক্ষা উপকরণ
  | 'scholarship' // শিক্ষাবৃত্তি
  | 'relief' // ত্রাণ
  | 'administrative' // প্রশাসনিক
  | 'other'; // অন্যান্য

export type IncomeCategory =
  | 'membership_fee' // সদস্য ফি
  | 'monthly_subscription' // মাসিক চাঁদা
  | 'donation' // অনুদান
  | 'grant' // অনুদান/গ্রান্ট
  | 'other'; // অন্যান্য

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  categoryLabel: string; // বাংলা নাম
  description: string;
  date: string;
  memberId?: string;
  memberName?: string;
  receiptNumber?: string;
  createdAt: string;
}

// গ্যালারি টাইপ (পত্রিকা স্টাইল আর্টিকেল সহ)
export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  createdAt: string;
  // আর্টিকেল ফিল্ড
  title?: string; // আর্টিকেল শিরোনাম
  content?: string; // আর্টিকেল বিস্তারিত
  author?: string; // লেখক
  tags?: string[]; // ট্যাগ
  isPublished?: boolean; // প্রকাশিত কিনা
}

// সোশ্যাল মিডিয়া টাইপ
export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok' | 'youtube' | 'other';
  url: string;
  label: string;
  isVisible: boolean;
  order: number;
}

// ডকুমেন্ট টাইপ
export type DocumentType = 'pad' | 'receipt' | 'voucher' | 'donation_receipt';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

// রশিদ টাইপ
export interface Receipt {
  id: string;
  receiptNo: string;
  type: 'subscription' | 'donation';
  amount: number;
  amountInWords: string;
  purpose: string;
  payerName: string;
  payerAddress: string;
  payerMobile: string;
  date: string;
  createdAt: string;
}

// ভাউচার টাইপ
export interface Voucher {
  id: string;
  voucherNo: string;
  type: 'payment' | 'donation_given';
  amount: number;
  amountInWords: string;
  purpose: string;
  recipientName: string;
  recipientAddress: string;
  recipientMobile: string;
  date: string;
  createdAt: string;
}

// সোশ্যাল পোস্ট টাইপ (টেক্সট শেয়ার)
export interface SocialPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  date: string;
  category: 'announcement' | 'event' | 'achievement' | 'general';
  createdAt: string;
}

// ফাউন্ডেশন তথ্য
export interface FoundationInfo {
  nameGreen: string; // "আপন"
  nameRed: string; // "ফাউন্ডেশন"
  slogan: string;
  address: string;
  established: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  logo: string;
}

// অ্যাপ স্টেট
export interface AppState {
  foundationInfo: FoundationInfo;
  members: Member[];
  constitution: Constitution | null;
  notices: Notice[];
  transactions: Transaction[];
  gallery: GalleryImage[];
  socialLinks: SocialLink[];
  receipts: Receipt[];
  vouchers: Voucher[];
  socialPosts: SocialPost[];
}
