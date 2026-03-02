'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============ TYPES ============

export type Permission = 
  // গঠনতন্ত্র
  | 'constitution_view'
  | 'constitution_add'
  | 'constitution_edit'
  | 'constitution_delete'
  | 'constitution_pdf'
  // পরিচালনা পরিষদ
  | 'council_view'
  | 'council_add'
  | 'council_edit'
  | 'council_delete'
  | 'council_pdf'
  // নোটিশ বোর্ড
  | 'notice_view'
  | 'notice_general'
  | 'notice_disciplinary'
  | 'notice_delete'
  | 'notice_whatsapp'
  | 'notice_pdf'
  // গ্যালারি
  | 'gallery_view'
  | 'gallery_upload'
  | 'gallery_delete'
  | 'gallery_share'
  // আর্থিক
  | 'finance_view'
  | 'finance_income'
  | 'finance_expense'
  | 'finance_edit'
  | 'finance_delete'
  | 'finance_pdf'
  // ডকুমেন্ট
  | 'document_pad'
  | 'document_receipt'
  | 'document_voucher'
  | 'document_delete'
  // সেটিংস (শুধু সুপার এডমিন)
  | 'settings_logo'
  | 'settings_backup'
  | 'settings_admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'super_admin' | 'admin';
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthState {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  users: AdminUser[];
  
  // Actions
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  
  // Super Admin Actions
  addAdmin: (email: string, name: string, password: string, permissions: Permission[]) => { success: boolean; message: string };
  updateAdmin: (id: string, data: Partial<AdminUser>) => void;
  deleteAdmin: (id: string) => void;
  updateAdminPermissions: (id: string, permissions: Permission[]) => void;
  
  // Permission Check
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  
  // Get admins list
  getAdmins: () => AdminUser[];
}

// ডিফল্ট সুপার এডমিন (ফাউন্ডেশনের ইমেইল)
const defaultSuperAdmin: AdminUser = {
  id: 'super-admin-001',
  email: 'aponfoundation.baligaw@gmail.com',
  name: 'সুপার এডমিন',
  password: 'admin123', // প্রথম লগইনে পরিবর্তন করতে হবে
  role: 'super_admin',
  permissions: [
    'constitution_view', 'constitution_add', 'constitution_edit', 'constitution_delete', 'constitution_pdf',
    'council_view', 'council_add', 'council_edit', 'council_delete', 'council_pdf',
    'notice_view', 'notice_general', 'notice_disciplinary', 'notice_delete', 'notice_whatsapp', 'notice_pdf',
    'gallery_view', 'gallery_upload', 'gallery_delete', 'gallery_share',
    'finance_view', 'finance_income', 'finance_expense', 'finance_edit', 'finance_delete', 'finance_pdf',
    'document_pad', 'document_receipt', 'document_voucher', 'document_delete',
    'settings_logo', 'settings_backup', 'settings_admin'
  ],
  createdAt: new Date().toISOString(),
  isActive: true,
};

// সব পারমিশনের তালিকা (UI এর জন্য)
export const permissionGroups = {
  constitution: {
    title: '📜 গঠনতন্ত্র',
    permissions: [
      { key: 'constitution_view', label: 'দেখতে পারবে' },
      { key: 'constitution_add', label: 'যুক্ত করতে পারবে' },
      { key: 'constitution_edit', label: 'এডিট করতে পারবে' },
      { key: 'constitution_delete', label: 'ডিলিট করতে পারবে' },
      { key: 'constitution_pdf', label: 'PDF ডাউনলোড করতে পারবে' },
    ],
  },
  council: {
    title: '👥 পরিচালনা পরিষদ',
    permissions: [
      { key: 'council_view', label: 'দেখতে পারবে' },
      { key: 'council_add', label: 'সদস্য যুক্ত করতে পারবে' },
      { key: 'council_edit', label: 'সদস্য এডিট করতে পারবে' },
      { key: 'council_delete', label: 'সদস্য ডিলিট করতে পারবে' },
      { key: 'council_pdf', label: 'PDF ডাউনলোড করতে পারবে' },
    ],
  },
  notice: {
    title: '📢 নোটিশ বোর্ড',
    permissions: [
      { key: 'notice_view', label: 'দেখতে পারবে' },
      { key: 'notice_general', label: 'সাধারণ নোটিশ তৈরি করতে পারবে' },
      { key: 'notice_disciplinary', label: 'শাস্তিমূলক নোটিশ তৈরি করতে পারবে' },
      { key: 'notice_delete', label: 'নোটিশ ডিলিট করতে পারবে' },
      { key: 'notice_whatsapp', label: 'WhatsApp এ পাঠাতে পারবে' },
      { key: 'notice_pdf', label: 'PDF প্রিন্ট করতে পারবে' },
    ],
  },
  gallery: {
    title: '🖼️ গ্যালারি',
    permissions: [
      { key: 'gallery_view', label: 'দেখতে পারবে' },
      { key: 'gallery_upload', label: 'ছবি আপলোড করতে পারবে' },
      { key: 'gallery_delete', label: 'ছবি ডিলিট করতে পারবে' },
      { key: 'gallery_share', label: 'সোশ্যাল মিডিয়ায় শেয়ার করতে পারবে' },
    ],
  },
  finance: {
    title: '💰 আর্থিক ব্যবস্থাপনা',
    permissions: [
      { key: 'finance_view', label: 'দেখতে পারবে' },
      { key: 'finance_income', label: 'আয় এন্ট্রি করতে পারবে' },
      { key: 'finance_expense', label: 'ব্যয় এন্ট্রি করতে পারবে' },
      { key: 'finance_edit', label: 'এডিট করতে পারবে' },
      { key: 'finance_delete', label: 'ডিলিট করতে পারবে' },
      { key: 'finance_pdf', label: 'PDF ডাউনলোড করতে পারবে' },
    ],
  },
  document: {
    title: '📄 ডকুমেন্ট',
    permissions: [
      { key: 'document_pad', label: 'প্যাড তৈরি করতে পারবে' },
      { key: 'document_receipt', label: 'রশিদ তৈরি করতে পারবে' },
      { key: 'document_voucher', label: 'ভাউচার তৈরি করতে পারবে' },
      { key: 'document_delete', label: 'রশিদ/ভাউচার ডিলিট করতে পারবে' },
    ],
  },
  settings: {
    title: '⚙️ সেটিংস (সুপার এডমিন)',
    permissions: [
      { key: 'settings_logo', label: 'লোগো আপলোড' },
      { key: 'settings_backup', label: 'ব্যাকআপ/রিস্টোর' },
      { key: 'settings_admin', label: 'এডমিন ব্যবস্থাপনা' },
    ],
  },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [defaultSuperAdmin],

      login: (email: string, password: string) => {
        const state = get();
        const user = state.users.find(
          (u) => u.email === email && u.password === password && u.isActive
        );

        if (user) {
          set({
            currentUser: { ...user, lastLogin: new Date().toISOString() },
            isAuthenticated: true,
          });
          return { success: true, message: 'লগইন সফল!' };
        }

        return { success: false, message: 'ইমেইল বা পাসওয়ার্ড ভুল!' };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      addAdmin: (email: string, name: string, password: string, permissions: Permission[]) => {
        const state = get();
        
        // সর্বোচ্চ ৫ জন এডমিন যুক্ত করা যাবে
        const adminCount = state.users.filter((u) => u.role === 'admin').length;
        if (adminCount >= 5) {
          return { success: false, message: 'সর্বোচ্চ ৫ জন এডমিন যুক্ত করা যাবে!' };
        }

        // ইমেইল চেক
        if (state.users.some((u) => u.email === email)) {
          return { success: false, message: 'এই ইমেইল আগে থেকেই আছে!' };
        }

        const newAdmin: AdminUser = {
          id: generateId(),
          email,
          name,
          password,
          role: 'admin',
          permissions,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        set({ users: [...state.users, newAdmin] });
        return { success: true, message: 'এডমিন সফলভাবে যুক্ত হয়েছে!' };
      },

      updateAdmin: (id: string, data: Partial<AdminUser>) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },

      deleteAdmin: (id: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      updateAdminPermissions: (id: string, permissions: Permission[]) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, permissions } : u
          ),
        }));
      },

      hasPermission: (permission: Permission) => {
        const state = get();
        if (!state.currentUser) return false;
        return state.currentUser.permissions.includes(permission);
      },

      hasAnyPermission: (permissions: Permission[]) => {
        const state = get();
        if (!state.currentUser) return false;
        return permissions.some((p) => state.currentUser!.permissions.includes(p));
      },

      getAdmins: () => {
        const state = get();
        return state.users.filter((u) => u.role === 'admin');
      },
    }),
    {
      name: 'apon-foundation-auth',
    }
  )
);
