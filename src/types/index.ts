// আপন ফাউন্ডেশন - Type Definitions

// Organization Info
export interface OrganizationInfo {
  name: string;
  nameGreen: string;
  nameRed: string;
  slogan: string;
  address: string;
  established: string;
  whatsapp: string;
  email: string;
  facebook: string;
}

// গঠনতন্ত্র (Constitution)
export interface SubSection {
  id: string;
  number: string;
  content: string;
}

export interface Section {
  id: string;
  number: string;
  title: string;
  subSections: SubSection[];
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  sections: Section[];
}

// পরিচালনা পরিষদ (Management Council)
export type CouncilType = 'general' | 'executive' | 'advisor';

export interface CouncilMember {
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
  councilType: CouncilType;
  designation: string;
  photo?: string;
  createdAt: string;
}

// নোটিশ বোর্ড (Notice Board)
export type NoticeType = 'general' | 'disciplinary';

export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  subject: string;
  body: string;
  date: string;
  time?: string;
  venue?: string;
  presidentName?: string;
  secretaryName?: string;
  createdAt: string;
}

// গ্যালারি (Gallery)
export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  imageData: string;
  category: string;
  createdAt: string;
}

// আর্থিক ব্যবস্থাপনা (Financial Management)
export type IncomeCategory = 'donation' | 'subscription' | 'grant' | 'other';
export type ExpenseCategory = 'medical' | 'winter-clothes' | 'sports' | 'education' | 'scholarship' | 'other';

export interface Income {
  id: string;
  amount: number;
  category: IncomeCategory;
  categoryLabel: string;
  description: string;
  date: string;
  receivedFrom?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  categoryLabel: string;
  description: string;
  date: string;
  paidTo?: string;
  createdAt: string;
}

// ডকুমেন্ট (Documents)
export type DocumentType = 'pad' | 'subscription-receipt' | 'donation-receipt' | 'voucher';

export interface Receipt {
  id: string;
  type: 'subscription' | 'donation';
  serialNo: number;
  name: string;
  amount: number;
  purpose: string;
  date: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  serialNo: number;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

// যোগাযোগ (Contact)
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

// সোশ্যাল মিডিয়া (Social Media)
export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok' | 'youtube' | 'other';
  url: string;
  label: string;
}

// App State
export interface AppState {
  chapters: Chapter[];
  members: CouncilMember[];
  notices: Notice[];
  gallery: GalleryImage[];
  incomes: Income[];
  expenses: Expense[];
  receipts: Receipt[];
  vouchers: Voucher[];
  contactMessages: ContactMessage[];
  socialLinks: SocialLink[];
}
