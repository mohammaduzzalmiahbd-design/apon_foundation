'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore, generateId, toBanglaNumber, formatBanglaDate, numberToBanglaWords, incomeCategoriesBn, expenseCategoriesBn } from '@/lib/store';
import { useAuthStore, permissionGroups, Permission, AdminUser } from '@/lib/auth-store';
import { Member, Notice, Transaction, Receipt, Voucher } from '@/lib/types';
import { 
  generateDonationReceiptPDF, 
  generateExpenseVoucherPDF, 
  generateIncomeExpenseReportPDF,
  generateGeneralPadPDF,
  generateNoticeDocumentPDF,
  shareViaWhatsApp,
  shareViaFacebook,
  generateReceiptShareText,
  generateVoucherShareText
} from '@/lib/pdf-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Home, ScrollText, Users, Bell, Image as ImageIcon, Wallet, FileText, Phone, 
  Menu, X, Plus, Edit, Trash2, Download, Search, Share2, Facebook, 
  Instagram, Youtube, MessageCircle, Music, Printer, Eye, Settings, Save, 
  File, Upload, Database, AlertTriangle, LogIn, LogOut, Lock, User, UserPlus,
  PieChart, BarChart3, TrendingUp, Calendar, Cloud, CloudOff, RefreshCw, Check, ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function HomePage() {
  const { isAuthenticated, currentUser, login, logout, hasPermission } = useAuthStore();
  const { loadFromServer, saveAllToServer, members, constitution, notices, transactions, gallery, socialLinks, receipts, vouchers, foundationInfo, isInitialized } = useStore();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // পেজ লোড হলে সার্ভার থেকে ডাটা লোড
  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  // ডাটা পরিবর্তন হলে সার্ভারে সেভ (debounced)
  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      saveAllToServer();
    }, 2000); // 2 সেকেন্ড অপেক্ষা করে সেভ

    return () => clearTimeout(timeoutId);
  }, [members, constitution, notices, transactions, gallery, socialLinks, receipts, vouchers, foundationInfo, isInitialized, saveAllToServer]);

  const handleLogin = () => {
    const result = login(loginEmail, loginPassword);
    if (result.success) {
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
      setActiveSection('home');
    } else {
      setLoginError(result.message);
    }
  };

  // পাবলিক মেনু (লগইন ছাড়া দেখা যাবে)
  const publicMenuItems = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'search', label: 'সার্চ', icon: Search },
    { id: 'share', label: 'পোস্ট শেয়ার', icon: Share2 },
    { id: 'notice', label: 'নোটিশ বোর্ড', icon: Bell },
    { id: 'gallery', label: 'গ্যালারি', icon: ImageIcon },
    { id: 'contact', label: 'যোগাযোগ', icon: Phone },
  ];

  // অ্যাডমিন মেনু (লগইন করলে দেখা যাবে)
  const getAdminMenuItems = () => {
    const items = [];
    
    if (hasPermission('constitution_view' as Permission)) {
      items.push({ id: 'constitution', label: 'গঠনতন্ত্র', icon: ScrollText });
    }
    if (hasPermission('council_view' as Permission)) {
      items.push({ id: 'council', label: 'পরিচালনা পরিষদ', icon: Users });
    }
    // নোটিশ ও গ্যালারি পাবলিক, তাই এডমিন মেনুতে নেই
    if (hasPermission('finance_view' as Permission)) {
      items.push({ id: 'finance', label: 'আর্থিক ব্যবস্থাপনা', icon: Wallet });
    }
    if (hasPermission('document_pad' as Permission) || hasPermission('document_receipt' as Permission)) {
      items.push({ id: 'documents', label: 'ডকুমেন্ট', icon: FileText });
    }
    
    // সেটিংস (সুপার এডমিন বা যার settings পারমিশন আছে)
    if (currentUser?.role === 'super_admin' || 
        hasPermission('settings_logo' as Permission) || 
        hasPermission('settings_admin' as Permission)) {
      items.push({ id: 'settings', label: 'সেটিংস', icon: Settings });
    }
    
    return items;
  };

  const menuItems = isAuthenticated ? [...publicMenuItems, ...getAdminMenuItems()] : publicMenuItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        menuItems={menuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        showLogin={showLogin}
        setShowLogin={setShowLogin}
      />

      {/* Main Content */}
      <main className="pt-20">
        {activeSection === 'home' && <HomeSection setActiveSection={setActiveSection} />}
        
        {/* পাবলিক সেকশন */}
        {activeSection === 'search' && <SearchSection />}
        {activeSection === 'share' && <ShareSection />}
        {activeSection === 'notice' && <NoticeSection />}
        {activeSection === 'gallery' && <GallerySection />}
        {activeSection === 'contact' && <ContactSection />}
        
        {/* প্রোটেক্টেড সেকশন (শুধু লগইন করলে দেখা যাবে) */}
        {isAuthenticated && activeSection === 'constitution' && <ConstitutionSection />}
        {isAuthenticated && activeSection === 'council' && <CouncilSection />}
        {isAuthenticated && activeSection === 'finance' && <FinanceSection />}
        {isAuthenticated && activeSection === 'documents' && <DocumentsSection />}
        {isAuthenticated && activeSection === 'settings' && <SettingsSection />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenu 
          menuItems={menuItems}
          activeSection={activeSection}
          setActiveSection={(id) => {
            setActiveSection(id);
            setIsMobileMenuOpen(false);
          }}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              <Lock className="inline mr-2" size={24} />
              লগইন করুন
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {loginError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
                {loginError}
              </div>
            )}
            <div>
              <Label>ইমেইল</Label>
              <Input 
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <Label>পাসওয়ার্ড</Label>
              <Input 
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-[#1B5E20]">
              <LogIn className="mr-2" size={18} /> লগইন করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ HEADER COMPONENT ============
interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  menuItems: { id: string; label: string; icon: any }[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
}

function Header({ isMobileMenuOpen, setIsMobileMenuOpen, menuItems, activeSection, setActiveSection, showLogin, setShowLogin }: HeaderProps) {
  const { foundationInfo } = useStore();
  const { isAuthenticated, currentUser, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      {/* Top Bar with Logo and Name */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full p-1 flex items-center justify-center">
              <img 
                src={foundationInfo.logo} 
                alt="লোগো" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-[#FFD700] drop-shadow-lg">আপন</span>
                <span className="text-[#FFB6C1]"> ফাউন্ডেশন</span>
              </h1>
              <p className="text-sm text-[#FFD700]/90 font-medium">মানব সেবায় আমরা</p>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated && currentUser && (
              <div className="hidden md:flex items-center gap-2 mr-4">
                <Badge className="bg-[#D4AF37] text-[#1B5E20]">
                  {currentUser.role === 'super_admin' ? '👑 সুপার এডমিন' : '👤 এডমিন'}
                </Badge>
                <span className="text-sm">{currentUser.name}</span>
              </div>
            )}
            
            {isAuthenticated ? (
              <Button 
                onClick={logout}
                variant="outline"
                className="bg-white/20 border-white text-white hover:bg-white/30"
              >
                <LogOut size={18} className="mr-1" /> লগআউট
              </Button>
            ) : (
              <Button 
                onClick={() => setShowLogin(true)}
                className="bg-[#D4AF37] text-[#1B5E20] hover:bg-[#e5c158]"
              >
                <LogIn size={18} className="mr-1" /> লগইন
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-white/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <nav className="hidden md:block bg-white border-b">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id 
                      ? 'bg-[#1B5E20] text-white' 
                      : 'text-[#1B5E20] hover:bg-[#1B5E20]/10'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

// ============ MOBILE MENU ============
interface MobileMenuProps {
  menuItems: { id: string; label: string; icon: any }[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  onClose: () => void;
}

function MobileMenu({ menuItems, activeSection, setActiveSection, onClose }: MobileMenuProps) {
  const { isAuthenticated, currentUser, logout } = useAuthStore();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 w-72 h-full bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-[#1B5E20] text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">মেনু</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded">
              <X size={20} />
            </button>
          </div>
          {isAuthenticated && currentUser && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-sm">{currentUser.name}</p>
              <p className="text-xs text-[#D4AF37]">
                {currentUser.role === 'super_admin' ? 'সুপার এডমিন' : 'এডমিন'}
              </p>
            </div>
          )}
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id 
                      ? 'bg-[#1B5E20] text-white' 
                      : 'text-[#1B5E20] hover:bg-[#1B5E20]/10'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          {isAuthenticated && (
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full mt-4 border-red-500 text-red-500"
            >
              <LogOut size={18} className="mr-2" /> লগআউট
            </Button>
          )}
        </nav>
      </div>
    </div>
  );
}

// ============ HOME SECTION ============
function HomeSection({ setActiveSection }: { setActiveSection: (id: string) => void }) {
  const { foundationInfo } = useStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1B5E20] via-[#2e7d32] to-[#1B5E20] text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full p-2 shadow-2xl">
              <img 
                src={foundationInfo.logo} 
                alt="আপন ফাউন্ডেশন লোগো" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">আপন</span>
              <span className="text-[#FFB6C1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"> ফাউন্ডেশন</span>
            </h1>
            
            <p className="text-2xl text-[#D4AF37] mb-8">মানব সেবায় আমরা</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <p className="text-lg leading-relaxed">
                বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ ভিত্তিক একটি অলাভজনক সামাজিক সেবামূলক সংগঠন। 
                আমরা মানবসেবার মাধ্যমে সমাজের পিছিয়ে পড়া মানুষদের পাশে দাঁড়াতে প্রতিশ্রুতিবদ্ধ।
              </p>
            </div>

            {!isAuthenticated && (
              <Button 
                onClick={() => setActiveSection('contact')}
                className="bg-[#D4AF37] text-[#1B5E20] hover:bg-[#e5c158] px-8 py-6 text-lg"
              >
                যোগাযোগ করুন
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-[#1B5E20] card-hover">
            <CardHeader className="bg-[#1B5E20] text-white">
              <CardTitle className="text-center">🎯 আমাদের লক্ষ্য</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center text-gray-700">
                সমাজের পিছিয়ে পড়া মানুষদের মাঝে শিক্ষা, চিকিৎসা ও অন্যান্য সেবা পৌঁছে দেওয়া।
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#8B0000] card-hover">
            <CardHeader className="bg-[#8B0000] text-white">
              <CardTitle className="text-center">💡 আমাদের দৃষ্টি</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center text-gray-700">
                একটি সুস্থ, সবল ও সচেতন সমাজ গঠনে অংশীদার হওয়া।
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#D4AF37] card-hover">
            <CardHeader className="bg-[#D4AF37] text-[#1B5E20]">
              <CardTitle className="text-center">🤝 আমাদের কার্যক্রম</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center text-gray-700">
                শীতবস্ত্র বিতরণ, শিক্ষা উপকরণ বিতরণ, চিকিৎসা সেবা, ক্রীড়া উপকরণ বিতরণ।
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Foundation Info */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-[#1B5E20] mb-8">প্রতিষ্ঠানের তথ্য</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#1B5E20] text-xl">📍</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ঠিকানা</p>
                  <p className="font-semibold">{foundationInfo.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#1B5E20] text-xl">📅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">প্রতিষ্ঠা</p>
                  <p className="font-semibold">{foundationInfo.established}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#1B5E20] text-xl">📧</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ইমেইল</p>
                  <p className="font-semibold">{foundationInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#1B5E20] text-xl">📱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-semibold">{foundationInfo.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CONSTITUTION SECTION ============
function ConstitutionSection() {
  const { constitution, initializeConstitution, addChapter, addSection, setPreface, setMissionVision, foundationInfo } = useStore();
  const { hasPermission } = useAuthStore();
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState<string | null>(null);
  const [newChapter, setNewChapter] = useState({ number: 1, title: '' });
  const [newSection, setNewSection] = useState({ number: '', title: '', content: '' });
  const hasInitializedRef = useRef(false);

  const canAdd = hasPermission('constitution_add' as Permission);
  const canEdit = hasPermission('constitution_edit' as Permission);
  const canDelete = hasPermission('constitution_delete' as Permission);
  const canPdf = hasPermission('constitution_pdf' as Permission);

  const handleAddChapter = () => {
    if (newChapter.title) {
      addChapter({ number: newChapter.number, title: newChapter.title });
      setNewChapter({ number: (constitution?.chapters.length || 0) + 2, title: '' });
      setIsAddingChapter(false);
    }
  };

  const handleAddSection = (chapterId: string) => {
    if (newSection.title) {
      addSection(chapterId, { number: newSection.number, title: newSection.title, content: newSection.content });
      setNewSection({ number: '', title: '', content: '' });
      setIsAddingSection(null);
    }
  };

  // সম্পূর্ণ গঠনতন্ত্র একবারে ইনিশিয়ালাইজ করা
  useEffect(() => {
    if (!constitution && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      const chapterId = generateId();
      const defaultConstitution: import('@/lib/types').Constitution = {
        id: generateId(),
        title: 'আপন ফাউন্ডেশন গঠনতন্ত্র',
        preface: {
          bismillah: 'বিসমিল্লাহির রাহমানির রাহিম',
          content: `কিশোরগঞ্জ জেলার অষ্টগ্রাম উপজেলার বালীগাঁও গ্রামের একদল তরুণ যুবকের আন্তরিক প্রচেষ্টা ও স্বপ্নের ফসল হলো "আপন ফাউন্ডেশন"।
সমাজের উন্নয়ন, মানবতার কল্যাণ এবং সুন্দর বাংলাদেশ বিনির্মাণে তাদের ক্ষুদ্র প্রয়াস থেকেই এই ফাউন্ডেশনের জন্ম।

অর্থনৈতিকভাবে দুর্বল, সুবিধাবঞ্চিত ও প্রান্তিক জনগোষ্ঠীর পাশে দাঁড়ানো, শিক্ষা ও স্বাস্থ্যসেবায় সহায়তা প্রদান, যুবকদের কর্মসংস্থান ও প্রশিক্ষণের সুযোগ সৃষ্টি, এবং প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের পাশে দাঁড়ানোই আমাদের মূল উদ্দেশ্য।

এই গঠনতন্ত্র ফাউন্ডেশনের কার্যক্রম পরিচালনার ক্ষেত্রে সুস্পষ্ট দিকনির্দেশনা প্রদান করবে। সদস্য ভর্তি, অর্থনৈতিক ব্যবস্থাপনা, সভা ও সিদ্ধান্ত গ্রহণ, উপদেষ্টা পরিষদের ভূমিকা, সামাজিক মাধ্যম ব্যবহারের নীতিমালা এবং শাস্তিমূলক ব্যবস্থা—সবকিছুই এই গঠনতন্ত্রে নির্ধারিত। ফলে ফাউন্ডেশনের প্রতিটি কার্যক্রম হবে স্বচ্ছ, শৃঙ্খলাবদ্ধ এবং জবাবদিহিমূলক।

আপন ফাউন্ডেশন বিশ্বাস করে—ঐক্য, সহযোগিতা ও মানবসেবার মাধ্যমে একটি সুন্দর, নৈতিক ও ঐক্যবদ্ধ বাংলাদেশ গড়ে তোলা সম্ভব। এই গঠনতন্ত্র সেই লক্ষ্য পূরণের জন্য আমাদের পথনির্দেশক ও অঙ্গীকারপত্র।`,
          compiledBy: 'মুহাম্মদ উজ্জল মিয়া',
          cooperatedBy: 'আব্দুল জিহাদ (প্রতিষ্ঠাতা উপদেষ্টা ও প্রধান উদ্যোক্তা)',
        },
        missionVision: {
          mission: [
            'অর্থনৈতিকভাবে দুর্বল, দরিদ্র ও সুবিধাবঞ্চিত মানুষের মৌলিক অধিকার নিশ্চিত করা।',
            'শিক্ষা ও স্বাস্থ্যসেবায় প্রান্তিক জনগোষ্ঠীর জন্য প্রকল্প গ্রহণ ও বাস্তবায়ন করা।',
            'বেকার যুবকদের জন্য কারিগরি প্রশিক্ষণ ও কর্মসংস্থানের সুযোগ সৃষ্টি করা।',
            'প্রাকৃতিক দুর্যোগ ও মানবিক বিপর্যয়ের সময়ে ক্ষতিগ্রস্তদের পাশে দাঁড়ানো এবং পুনর্বাসন কার্যক্রম পরিচালনা করা।',
          ],
          vision: `একটি আদর্শ সমাজ প্রতিষ্ঠা করা যেখানে দারিদ্র্য, বৈষম্য ও অশিক্ষা থাকবে না।
মানবিক মূল্যবোধে সমৃদ্ধ, ন্যায়, অধিকার ও মর্যাদায় সবার সমান অংশগ্রহণ থাকবে।
আপন ফাউন্ডেশন স্বপ্ন দেখে—একটি সুন্দর বাংলাদেশ, যেখানে প্রতিটি মানুষ শান্তি, সহযোগিতা ও মানবতার আলোয় জীবনযাপন করবে।`,
        },
        chapters: [
          {
            id: chapterId,
            number: 1,
            title: 'ফাউন্ডেশনের পরিচয় সংক্রান্ত নীতিমালা',
            sections: [
              {
                id: generateId(),
                number: '১',
                title: 'নামকরণ',
                content: 'এই ফাউন্ডেশনটি "আপন ফাউন্ডেশন" নামে পরিচিত ও অভিহিত হইবে। ইংরেজিতে ইহাকে "Apon Foundation" বলা হইবে।',
                subSections: [],
              },
              {
                id: generateId(),
                number: '২',
                title: 'প্রতিষ্ঠা',
                content: 'ফাউন্ডেশনটি ২০২৫ খ্রিস্টাব্দের ৪ঠা এপ্রিল তারিখে প্রতিষ্ঠিত হইয়াছে।',
                subSections: [],
              },
              {
                id: generateId(),
                number: '৩',
                title: 'প্রকৃতি',
                content: 'ইহা একটি সম্পূর্ণ অলাভজনক, অরাজনৈতিক, অসাম্প্রদায়িক, স্বেচ্ছাসেবী ও সমাজকল্যাণমূলক ফাউন্ডেশন হিসাবে গণ্য হইবে।',
                subSections: [],
              },
              {
                id: generateId(),
                number: '৪',
                title: 'প্রধান কার্যালয়',
                content: 'ফাউন্ডেশনের প্রধান কার্যালয় বাংলাদেশের কিশোরগঞ্জ জেলার অষ্টগ্রাম উপজেলার বালীগাঁও গ্রামে অবস্থিত। প্রয়োজনে কার্যনির্বাহী পরিষদের অনুমোদনক্রমে দেশের অভ্যন্তরে বা বাহিরে শাখা কার্যালয় স্থাপন করা যাইবে।',
                subSections: [],
              },
              {
                id: generateId(),
                number: '৫',
                title: 'কার্য এলাকা',
                content: 'প্রাথমিকভাবে ফাউন্ডেশনের কার্য এলাকা অষ্টগ্রাম উপজেলা এবং লেখাই উপজেলাব্যাপী বিস্তৃত থাকিবে। তবে প্রয়োজনে কার্যনির্বাহী পরিষদের সিদ্ধান্তক্রমে বাংলাদেশের যেকোনো অঞ্চলে অথবা বিশ্বব্যাপী ইহার কার্যক্রম সম্প্রসারণ করা যাইবে।',
                subSections: [],
              },
              {
                id: generateId(),
                number: '৬',
                title: 'লক্ষ্য ও উদ্দেশ্য',
                content: `আপন ফাউন্ডেশনের মূল লক্ষ্য ও উদ্দেশ্যসমূহ হইবে নিম্নরূপ:

• সমাজের দুঃস্থ, অসহায়, সুবিধাবঞ্চিত ও অনগ্রসর জনগোষ্ঠীর আর্থ-সামাজিক অবস্থার উন্নয়ন সাধন করা।
• শিক্ষা, স্বাস্থ্যসেবা, ও পুষ্টি বিষয়ে সচেতনতা বৃদ্ধি ও সহায়তা প্রদান করা।
• দারিদ্র্য বিমোচন ও কর্মসংস্থান সৃষ্টির লক্ষ্যে বিভিন্ন প্রকল্প গ্রহণ ও বাস্তবায়ন করা।
• নারী ও শিশু অধিকার প্রতিষ্ঠা এবং তাহাদের ক্ষমতায়নে সহায়তা করা।
• পরিবেশ সংরক্ষণ ও প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের পুনর্বাসনে সহায়তা প্রদান করা।
• যুব সমাজকে সুসংগঠিত করিয়া সমাজ উন্নয়নমূলক কর্মকাণ্ডে উৎসাহিত করা এবং দক্ষতা বৃদ্ধিমূলক প্রশিক্ষণ প্রদান করা।
• সামাজিক সম্প্রীতি, মানবতাবোধ ও নৈতিক মূল্যবোধ জাগ্রত করার জন্য কাজ করা।`,
                subSections: [],
              },
              {
                id: generateId(),
                number: '৭',
                title: 'লোগো, সীলমোহর ও প্যাড',
                content: `আপন ফাউন্ডেশনের নির্দিষ্ট লোগো থাকিবে যা ফাউন্ডেশনের পরিচয় বহন করিবে।
কার্যনির্বাহী কমিটির সদস্যদের নির্দিষ্ট সীলমোহর থাকিবে।
এবং ফাউন্ডেশনের সকল লেখা ফাউন্ডেশনের নিজস্ব প্যাডে হইবে।`,
                subSections: [],
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      initializeConstitution(defaultConstitution);
    }
  }, [constitution, initializeConstitution]);

  const generateConstitutionPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>গঠনতন্ত্র - আপন ফাউন্ডেশন</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
          body { font-family: 'Noto Sans Bengali', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1B5E20; padding-bottom: 20px; }
          .bismillah { font-size: 28px; margin-bottom: 15px; direction: rtl; font-family: 'Amiri', serif; }
          .logo-container { display: flex; align-items: center; justify-content: center; gap: 20px; }
          .logo { width: 80px; height: 80px; }
          .org-name { font-size: 28px; font-weight: bold; }
          .green { color: #1B5E20; }
          .gold { color: #D4AF37; }
          .red { color: #8B0000; }
          .title { font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; color: #1B5E20; }
          .preface { margin: 30px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #D4AF37; }
          .preface-title { font-size: 20px; font-weight: bold; text-align: center; color: #D4AF37; margin-bottom: 20px; }
          .preface-content { line-height: 1.8; text-align: justify; white-space: pre-line; }
          .credits { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 14px; }
          .credit-row { margin: 8px 0; }
          .credit-label { color: #1B5E20; font-weight: 600; }
          .chapter { margin: 25px 0; page-break-inside: avoid; }
          .chapter-title { font-size: 18px; font-weight: bold; color: #1B5E20; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .section { margin: 15px 0 15px 20px; }
          .section-title { font-weight: 600; color: #333; }
          .section-content { margin: 5px 0 5px 20px; text-align: justify; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
          <div class="logo-container">
            <img src="${foundationInfo.logo}" class="logo" alt="Logo" onerror="this.style.display='none'">
            <div>
              <div class="org-name"><span class="green">আপন</span><span class="red"> ফাউন্ডেশন</span></div>
              <div style="color: #666;">বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ</div>
            </div>
          </div>
        </div>
        <div class="title">গঠনতন্ত্র</div>
        
        ${constitution?.preface ? `
          <div class="preface">
            <div class="preface-title">ভূমিকা</div>
            <div class="bismillah" style="text-align: center; font-size: 24px; margin-bottom: 15px;">${constitution.preface.bismillah}</div>
            <div class="preface-content">${constitution.preface.content}</div>
            <div class="credits">
              <div class="credit-row"><span class="credit-label">সংকলন ও সম্পাদনায়:</span> ${constitution.preface.compiledBy}</div>
              <div class="credit-row"><span class="credit-label">সার্বিক সহযোগিতায়:</span> ${constitution.preface.cooperatedBy}</div>
            </div>
          </div>
        ` : ''}
        
        ${constitution?.chapters.map((chapter) => `
          <div class="chapter">
            <div class="chapter-title">অধ্যায় ${toBanglaNumber(chapter.number)}: ${chapter.title}</div>
            ${chapter.sections.map((section) => `
              <div class="section">
                <div class="section-title">ধারা ${section.number}: ${section.title}</div>
                ${section.content ? `<div class="section-content">${section.content}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('') || '<p>কোনো অধ্যায় যুক্ত হয়নি।</p>'}
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#1B5E20]">📜 গঠনতন্ত্র</h2>
        <div className="flex gap-2">
          {canAdd && (
            <Button onClick={() => setIsAddingChapter(true)} className="bg-[#1B5E20]">
              <Plus className="mr-2" size={18} /> নতুন অধ্যায়
            </Button>
          )}
          {canPdf && constitution && constitution.chapters.length > 0 && (
            <Button onClick={generateConstitutionPDF} className="bg-[#D4AF37] text-[#1B5E20]">
              <Download className="mr-2" size={18} /> PDF ডাউনলোড
            </Button>
          )}
        </div>
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন অধ্যায় যুক্ত করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>অধ্যায় নম্বর</Label>
              <Input 
                type="number" 
                value={newChapter.number} 
                onChange={(e) => setNewChapter({ ...newChapter, number: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>অধ্যায়ের শিরোনাম</Label>
              <Input 
                value={newChapter.title} 
                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                placeholder="যেমন: নাম ও পরিচিতি"
              />
            </div>
            <Button onClick={handleAddChapter} className="w-full bg-[#1B5E20]">সংরক্ষণ করুন</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Constitution Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* ভূমিকা সেকশন */}
        {constitution?.preface && (
          <Card className="mb-8 border-2 border-[#D4AF37]">
            <CardHeader className="bg-gradient-to-r from-[#D4AF37] to-[#e5c158] text-[#1B5E20]">
              <CardTitle className="text-2xl text-center">ভূমিকা</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* বিসমিল্লাহ */}
              <div className="text-center text-3xl mb-6 font-arabic" style={{ fontFamily: 'Amiri, serif' }}>
                {constitution.preface.bismillah}
              </div>
              
              {/* ভূমিকা কনটেন্ট */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {constitution.preface.content}
              </div>
              
              {/* কৃতিত্ব */}
              <div className="mt-8 pt-6 border-t-2 border-[#D4AF37]/30 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#1B5E20] font-semibold min-w-[180px]">সংকলন ও সম্পাদনায়:</span>
                  <span className="text-gray-800">{constitution.preface.compiledBy}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#1B5E20] font-semibold min-w-[180px]">সার্বিক সহযোগিতায়:</span>
                  <span className="text-gray-800">{constitution.preface.cooperatedBy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* মিশন ও ভিশন সেকশন */}
        {constitution?.missionVision && (
          <Card className="mb-8 border-2 border-[#1B5E20]">
            <CardHeader className="bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] text-white">
              <CardTitle className="text-2xl text-center">মিশন ও ভিশন</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* মিশন */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#1B5E20] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm">১</span>
                  মিশন
                </h3>
                <div className="bg-[#1B5E20]/5 rounded-lg p-4 space-y-3">
                  {constitution.missionVision.mission.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#1B5E20] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1">
                        {toBanglaNumber(index + 1)}
                      </span>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ভিশন */}
              <div>
                <h3 className="text-xl font-bold text-[#8B0000] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm">২</span>
                  ভিশন
                </h3>
                <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#1B5E20]/5 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {constitution.missionVision.vision}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!constitution || constitution.chapters.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ScrollText size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl">কোনো অধ্যায় যুক্ত হয়নি</p>
            <p className="text-sm mt-2">অনুগ্রহ করে অধ্যায় যুক্ত করুন</p>
          </div>
        ) : (
          <div className="space-y-8">
            {constitution.chapters.map((chapter, chapterIndex) => {
              // প্রিমিয়াম কালার থিম - প্রতিটি অধ্যায়ের জন্য ভিন্ন কালার
              const chapterColors = [
                { bg: 'from-[#1B5E20] to-[#2e7d32]', accent: '#D4AF37', light: '#E8F5E9' },
                { bg: 'from-[#7B1FA2] to-[#9C27B0]', accent: '#E1BEE7', light: '#F3E5F5' },
                { bg: 'from-[#0288D1] to-[#03A9F4]', accent: '#B3E5FC', light: '#E1F5FE' },
                { bg: 'from-[#F57C00] to-[#FF9800]', accent: '#FFE0B2', light: '#FFF3E0' },
                { bg: 'from-[#C62828] to-[#E53935]', accent: '#FFCDD2', light: '#FFEBEE' },
                { bg: 'from-[#00695C] to-[#00897B]', accent: '#B2DFDB', light: '#E0F2F1' },
                { bg: 'from-[#5E35B1] to-[#7E57C2]', accent: '#D1C4E9', light: '#EDE7F6' },
                { bg: 'from-[#283593] to-[#3F51B5]', accent: '#C5CAE9', light: '#E8EAF6' },
              ];
              const color = chapterColors[chapterIndex % chapterColors.length];
              
              return (
                <div key={chapter.id} className="relative">
                  {/* অধ্যায় হেডার - ইনফোগ্রাফিক স্টাইল */}
                  <div className={`bg-gradient-to-r ${color.bg} rounded-t-2xl p-6 shadow-xl`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{toBanglaNumber(chapter.number)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-sm">অধ্যায়</p>
                        <h3 className="text-2xl font-bold text-white">{chapter.title}</h3>
                      </div>
                      {canAdd && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          onClick={() => setIsAddingSection(chapter.id)}
                        >
                          <Plus size={16} className="mr-1" /> ধারা যোগ
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* ধারা সমূহ - কানেক্টিং লাইন সহ */}
                  <div className="bg-white rounded-b-2xl shadow-lg border-2 border-t-0 border-gray-100 p-6">
                    {chapter.sections.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">কোনো ধারা নেই</p>
                    ) : (
                      <div className="relative">
                        {/* ভার্টিকাল কানেক্টিং লাইন */}
                        <div 
                          className="absolute left-6 top-0 bottom-0 w-1 rounded-full"
                          style={{ background: `linear-gradient(to bottom, ${color.accent}, ${color.light})` }}
                        />

                        <div className="space-y-6">
                          {chapter.sections.map((section, sectionIndex) => {
                            // ধারার কালার থিম
                            const sectionColors = [
                              { bg: '#E8F5E9', border: '#1B5E20', text: '#1B5E20' },
                              { bg: '#FFF3E0', border: '#E65100', text: '#E65100' },
                              { bg: '#E3F2FD', border: '#1565C0', text: '#1565C0' },
                              { bg: '#FCE4EC', border: '#C2185B', text: '#C2185B' },
                              { bg: '#F3E5F5', border: '#7B1FA2', text: '#7B1FA2' },
                              { bg: '#E0F2F1', border: '#00695C', text: '#00695C' },
                              { bg: '#EDE7F6', border: '#512DA8', text: '#512DA8' },
                              { bg: '#FFFDE7', border: '#F9A825', text: '#F9A825' },
                            ];
                            const secColor = sectionColors[sectionIndex % sectionColors.length];
                            
                            return (
                              <div key={section.id} className="relative pl-16">
                                {/* ধারা নম্বর সার্কেল */}
                                <div 
                                  className="absolute left-3 top-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
                                  style={{ backgroundColor: secColor.border, color: 'white' }}
                                >
                                  {section.number}
                                </div>

                                {/* ধারা কার্ড */}
                                <div 
                                  className="rounded-xl p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow"
                                  style={{ 
                                    backgroundColor: secColor.bg, 
                                    borderLeftColor: secColor.border 
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                      <h4 
                                        className="text-lg font-bold mb-2"
                                        style={{ color: secColor.text }}
                                      >
                                        {section.title}
                                      </h4>
                                      {section.content && (
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                          {section.content}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* উপধারা সমূহ */}
                                  {section.subSections && section.subSections.length > 0 && (
                                    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                                      {section.subSections.map((subSection) => (
                                        <div 
                                          key={subSection.id} 
                                          className="bg-white/70 rounded-lg p-3 border border-gray-100"
                                        >
                                          <div className="flex items-start gap-2">
                                            <span 
                                              className="w-5 h-5 rounded text-xs flex items-center justify-center font-medium"
                                              style={{ backgroundColor: secColor.border, color: 'white' }}
                                            >
                                              {subSection.number}
                                            </span>
                                            <div>
                                              <p className="font-medium text-gray-800">{subSection.title}</p>
                                              {subSection.content && (
                                                <p className="text-sm text-gray-600 mt-1">{subSection.content}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={!!isAddingSection} onOpenChange={() => setIsAddingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন ধারা যুক্ত করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ধারা নম্বর</Label>
              <Input 
                value={newSection.number} 
                onChange={(e) => setNewSection({ ...newSection, number: e.target.value })}
                placeholder="যেমন: ১.১"
              />
            </div>
            <div>
              <Label>ধারার শিরোনাম</Label>
              <Input 
                value={newSection.title} 
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              />
            </div>
            <div>
              <Label>বিবরণ</Label>
              <Textarea 
                value={newSection.content} 
                onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                rows={4}
              />
            </div>
            <Button 
              onClick={() => isAddingSection && handleAddSection(isAddingSection)} 
              className="w-full bg-[#1B5E20]"
            >
              সংরক্ষণ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ COUNCIL SECTION ============
function CouncilSection() {
  const { members, addMember, updateMember, deleteMember, getMembersByCouncil } = useStore();
  const { hasPermission } = useAuthStore();
  const [selectedCouncil, setSelectedCouncil] = useState<'general' | 'executive' | 'advisor'>('general');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const canAdd = hasPermission('council_add' as Permission);
  const canEdit = hasPermission('council_edit' as Permission);
  const canDelete = hasPermission('council_delete' as Permission);
  const canPdf = hasPermission('council_pdf' as Permission);
  
  const [newMember, setNewMember] = useState({
    serialNo: members.length + 1,
    name: '',
    fatherName: '',
    nidNumber: '',
    presentAddress: '',
    permanentAddress: '',
    mobile: '',
    email: '',
    bloodGroup: '',
    council: 'general' as 'general' | 'executive' | 'advisor',
    designation: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const councilNames = {
    general: 'সাধারণ পরিষদ',
    executive: 'নির্বাহী পরিষদ',
    advisor: 'উপদেষ্টা পরিষদ',
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.mobile) {
      addMember(newMember);
      setNewMember({
        serialNo: members.length + 2,
        name: '',
        fatherName: '',
        nidNumber: '',
        presentAddress: '',
        permanentAddress: '',
        mobile: '',
        email: '',
        bloodGroup: '',
        council: selectedCouncil,
        designation: '',
        joinDate: new Date().toISOString().split('T')[0],
      });
      setIsAddingMember(false);
    }
  };

  const handleEditMember = () => {
    if (editingMember) {
      updateMember(editingMember.id, editingMember);
      setEditingMember(null);
    }
  };

  const filteredMembers = getMembersByCouncil(selectedCouncil).filter(
    (m) => m.name.includes(searchQuery) || m.mobile.includes(searchQuery)
  );

  const generateMemberListPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${councilNames[selectedCouncil]} - সদস্য তালিকা</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
          body { font-family: 'Noto Sans Bengali', sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .org-name { font-size: 24px; font-weight: bold; }
          .green { color: #1B5E20; }
          .red { color: #8B0000; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #1B5E20; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="org-name"><span class="green">আপন</span><span class="red"> ফাউন্ডেশন</span></div>
          <h2 style="color: #1B5E20;">${councilNames[selectedCouncil]} - সদস্য তালিকা</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>নাম</th>
              <th>পিতার নাম</th>
              <th>মোবাইল</th>
              <th>রক্তের গ্রুপ</th>
            </tr>
          </thead>
          <tbody>
            ${filteredMembers.map((m, i) => `
              <tr>
                <td>${toBanglaNumber(i + 1)}</td>
                <td>${m.name}</td>
                <td>${m.fatherName}</td>
                <td>${m.mobile}</td>
                <td>${m.bloodGroup}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#1B5E20]">👥 পরিচালনা পরিষদ</h2>
        {canAdd && (
          <Button onClick={() => setIsAddingMember(true)} className="bg-[#1B5E20]">
            <Plus className="mr-2" size={18} /> নতুন সদস্য
          </Button>
        )}
      </div>

      {/* Council Tabs */}
      <Tabs value={selectedCouncil} onValueChange={(v) => setSelectedCouncil(v as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">সাধারণ পরিষদ</TabsTrigger>
          <TabsTrigger value="executive">নির্বাহী পরিষদ</TabsTrigger>
          <TabsTrigger value="advisor">উপদেষ্টা পরিষদ</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Export */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10"
            placeholder="নাম বা মোবাইল দিয়ে সার্চ করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {canPdf && (
          <Button onClick={generateMemberListPDF} className="bg-[#D4AF37] text-[#1B5E20]">
            <Download className="mr-2" size={18} /> PDF
          </Button>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl">কোনো সদস্য নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B5E20] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ক্রমিক</th>
                  <th className="px-4 py-3 text-left">নাম</th>
                  <th className="px-4 py-3 text-left">মোবাইল</th>
                  <th className="px-4 py-3 text-left">রক্তের গ্রুপ</th>
                  <th className="px-4 py-3 text-left">পদবী</th>
                  {(canEdit || canDelete) && <th className="px-4 py-3 text-left">কার্যক্রম</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{toBanglaNumber(index + 1)}</td>
                    <td className="px-4 py-3 font-semibold">{member.name}</td>
                    <td className="px-4 py-3">{member.mobile}</td>
                    <td className="px-4 py-3">
                      {member.bloodGroup && (
                        <Badge className="bg-red-100 text-red-700">{member.bloodGroup}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">{member.designation || '-'}</td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {canEdit && (
                            <Button size="sm" variant="outline" onClick={() => setEditingMember(member)}>
                              <Edit size={14} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button size="sm" variant="destructive" onClick={() => deleteMember(member.id)}>
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন সদস্য যুক্ত করুন</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>পরিষদ নির্বাচন</Label>
              <Select 
                value={newMember.council} 
                onValueChange={(v) => setNewMember({ ...newMember, council: v as any })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">সাধারণ পরিষদ</SelectItem>
                  <SelectItem value="executive">নির্বাহী পরিষদ</SelectItem>
                  <SelectItem value="advisor">উপদেষ্টা পরিষদ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>সদস্যের নাম *</Label>
              <Input 
                value={newMember.name} 
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div>
              <Label>পিতার নাম</Label>
              <Input 
                value={newMember.fatherName} 
                onChange={(e) => setNewMember({ ...newMember, fatherName: e.target.value })}
              />
            </div>
            <div>
              <Label>জাতীয় পরিচয় পত্র নং</Label>
              <Input 
                value={newMember.nidNumber} 
                onChange={(e) => setNewMember({ ...newMember, nidNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>মোবাইল নম্বর *</Label>
              <Input 
                value={newMember.mobile} 
                onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label>ইমেইল</Label>
              <Input 
                type="email"
                value={newMember.email} 
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            <div>
              <Label>রক্তের গ্রুপ</Label>
              <Select 
                value={newMember.bloodGroup} 
                onValueChange={(v) => setNewMember({ ...newMember, bloodGroup: v })}
              >
                <SelectTrigger><SelectValue placeholder="সিলেক্ট করুন" /></SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>পদবী</Label>
              <Input 
                value={newMember.designation} 
                onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>বর্তমান ঠিকানা</Label>
              <Input 
                value={newMember.presentAddress} 
                onChange={(e) => setNewMember({ ...newMember, presentAddress: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>স্থায়ী ঠিকানা</Label>
              <Input 
                value={newMember.permanentAddress} 
                onChange={(e) => setNewMember({ ...newMember, permanentAddress: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddingMember(false)}>বাতিল</Button>
            <Button className="flex-1 bg-[#1B5E20]" onClick={handleAddMember}>সংরক্ষণ করুন</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>সদস্য তথ্য সম্পাদনা</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>নাম</Label>
                <Input 
                  value={editingMember.name} 
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                />
              </div>
              <div>
                <Label>মোবাইল</Label>
                <Input 
                  value={editingMember.mobile} 
                  onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                />
              </div>
              <div>
                <Label>পদবী</Label>
                <Input 
                  value={editingMember.designation || ''} 
                  onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                />
              </div>
              <div>
                <Label>রক্তের গ্রুপ</Label>
                <Select 
                  value={editingMember.bloodGroup} 
                  onValueChange={(v) => setEditingMember({ ...editingMember, bloodGroup: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setEditingMember(null)}>বাতিল</Button>
            <Button className="flex-1 bg-[#1B5E20]" onClick={handleEditMember}>আপডেট করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ NOTICE SECTION ============
function NoticeSection() {
  const { notices, addNotice, deleteNotice, foundationInfo } = useStore();
  const { hasPermission } = useAuthStore();
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [noticeType, setNoticeType] = useState<'general' | 'disciplinary'>('general');
  const [newNotice, setNewNotice] = useState({
    type: 'general' as 'general' | 'disciplinary',
    subject: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    violationSection: '',
    violationDetails: '',
    punishmentDetails: '',
  });

  const canGeneral = hasPermission('notice_general' as Permission);
  const canDisciplinary = hasPermission('notice_disciplinary' as Permission);
  const canDelete = hasPermission('notice_delete' as Permission);
  const canWhatsapp = hasPermission('notice_whatsapp' as Permission);
  const canPdf = hasPermission('notice_pdf' as Permission);

  const handleAddNotice = () => {
    if (newNotice.subject && newNotice.content) {
      addNotice({
        ...newNotice,
        referenceNumber: newNotice.referenceNumber || `NF-${Date.now()}`,
      });
      setNewNotice({
        type: 'general',
        subject: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        violationSection: '',
        violationDetails: '',
        punishmentDetails: '',
      });
      setIsAddingNotice(false);
    }
  };

  const generateNoticePDF = (notice: Notice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>নোটিশ - আপন ফাউন্ডেশন</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
          body { font-family: 'Noto Sans Bengali', sans-serif; padding: 60px; max-width: 800px; margin: 0 auto; position: relative; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 300px; pointer-events: none; }
          .bismillah { text-align: center; font-size: 28px; margin-bottom: 20px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #1B5E20; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 20px; }
          .logo { width: 80px; height: 80px; }
          .org-name { font-size: 24px; font-weight: bold; }
          .green { color: #1B5E20; }
          .red { color: #8B0000; }
          .title { text-align: center; font-size: 32px; font-weight: bold; color: #1B5E20; text-decoration: underline; margin: 30px 0; }
          .notice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .subject { font-size: 18px; margin-bottom: 20px; }
          .content { text-align: justify; line-height: 1.8; margin-bottom: 30px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
          .signature-box { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 10px; }
        </style>
      </head>
      <body>
        <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
        <div class="bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
        <div class="header">
          <img src="${foundationInfo.logo}" class="logo" alt="Logo" onerror="this.style.display='none'">
          <div>
            <div class="org-name"><span class="green">আপন</span><span class="red"> ফাউন্ডেশন</span></div>
            <div style="color: #666;">বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ</div>
          </div>
        </div>
        <div class="title">নোটিশ</div>
        <div class="notice-info">
          <div><strong>রেফারেন্স:</strong> ${notice.referenceNumber}</div>
          <div><strong>তারিখ:</strong> ${formatBanglaDate(notice.date)}</div>
        </div>
        <div class="subject"><strong>বিষয়:</strong> ${notice.subject}</div>
        <div class="content">${notice.content.replace(/\n/g, '<br>')}</div>
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line">সভাপতি</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">সাধারণ সম্পাদক</div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendViaWhatsApp = (notice: Notice) => {
    const text = `*আপন ফাউন্ডেশন - নোটিশ*\n\nবিষয়: ${notice.subject}\nতারিখ: ${formatBanglaDate(notice.date)}\n\n${notice.content}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#1B5E20]">📢 নোটিশ বোর্ড</h2>
        {(canGeneral || canDisciplinary) && (
          <Button onClick={() => setIsAddingNotice(true)} className="bg-[#1B5E20]">
            <Plus className="mr-2" size={18} /> নতুন নোটিশ
          </Button>
        )}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Bell size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500">কোনো নোটিশ নেই</p>
          </div>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} className={`border-l-4 ${notice.type === 'disciplinary' ? 'border-l-red-500' : 'border-l-[#1B5E20]'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={notice.type === 'disciplinary' ? 'bg-red-500' : 'bg-[#1B5E20]'}>
                      {notice.type === 'disciplinary' ? 'শাস্তিমূলক' : 'সাধারণ'}
                    </Badge>
                    <CardTitle className="mt-2 text-xl">{notice.subject}</CardTitle>
                  </div>
                  <div className="text-sm text-gray-500">{formatBanglaDate(notice.date)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{notice.content.substring(0, 200)}...</p>
                <div className="flex gap-2">
                  {canPdf && (
                    <Button size="sm" variant="outline" onClick={() => generateNoticePDF(notice)}>
                      <Printer className="mr-1" size={14} /> প্রিন্ট
                    </Button>
                  )}
                  {canWhatsapp && (
                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => sendViaWhatsApp(notice)}>
                      <MessageCircle className="mr-1" size={14} /> WhatsApp
                    </Button>
                  )}
                  {canDelete && (
                    <Button size="sm" variant="destructive" onClick={() => deleteNotice(notice.id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )).reverse()
        )}
      </div>

      {/* Add Notice Dialog */}
      <Dialog open={isAddingNotice} onOpenChange={setIsAddingNotice}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন নোটিশ তৈরি করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>নোটিশের ধরন</Label>
              <Select value={noticeType} onValueChange={(v) => {
                setNoticeType(v as any);
                setNewNotice({ ...newNotice, type: v as any });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {canGeneral && <SelectItem value="general">সাধারণ নোটিশ</SelectItem>}
                  {canDisciplinary && <SelectItem value="disciplinary">শাস্তিমূলক নোটিশ</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>বিষয়</Label>
              <Input 
                value={newNotice.subject} 
                onChange={(e) => setNewNotice({ ...newNotice, subject: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>তারিখ</Label>
                <Input 
                  type="date"
                  value={newNotice.date} 
                  onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                />
              </div>
              <div>
                <Label>রেফারেন্স নম্বর</Label>
                <Input 
                  value={newNotice.referenceNumber} 
                  onChange={(e) => setNewNotice({ ...newNotice, referenceNumber: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>মূল বিষয়বস্তু</Label>
              <Textarea 
                value={newNotice.content} 
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingNotice(false)}>বাতিল</Button>
              <Button className="flex-1 bg-[#1B5E20]" onClick={handleAddNotice}>সংরক্ষণ করুন</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ GALLERY SECTION ============
function GallerySection() {
  const { gallery, addGalleryImage, deleteGalleryImage } = useStore();
  const { hasPermission } = useAuthStore();
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [newImage, setNewImage] = useState({
    url: '',
    caption: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    // আর্টিকেল ফিল্ড
    title: '',
    content: '',
    author: '',
    tags: '',
    isPublished: false,
  });

  const canUpload = hasPermission('gallery_upload' as Permission);
  const canDelete = hasPermission('gallery_delete' as Permission);
  const canShare = hasPermission('gallery_share' as Permission);

  // বর্তমান ওয়েবসাইট URL পাওয়া
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const handleAddImage = async () => {
    if (!newImage.url || !newImage.caption) {
      setSaveStatus('ছবি এবং ক্যাপশন দিতে হবে!');
      return;
    }

    setSaveStatus('সেভ হচ্ছে...');
    
    const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const imageData = {
      id,
      url: newImage.url,
      caption: newImage.caption,
      category: newImage.category,
      date: newImage.date,
      createdAt: new Date().toISOString(),
      // আর্টিকেল ডাটা
      title: newImage.title || newImage.caption,
      content: newImage.content,
      author: newImage.author,
      tags: newImage.tags ? newImage.tags.split(',').map(t => t.trim()) : [],
      isPublished: newImage.isPublished,
    };
    
    try {
      const success = await addGalleryImage(imageData);
      
      if (success) {
        setSaveStatus('সেভ হয়েছে!');
        setNewImage({ 
          url: '', caption: '', category: '', date: new Date().toISOString().split('T')[0],
          title: '', content: '', author: '', tags: '', isPublished: false 
        });
        setIsAddingImage(false);
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('সার্ভারে সেভ ব্যর্থ, কিন্তু লোকালি সেভ হয়েছে!');
        setTimeout(() => {
          setNewImage({ 
            url: '', caption: '', category: '', date: new Date().toISOString().split('T')[0],
            title: '', content: '', author: '', tags: '', isPublished: false 
          });
          setIsAddingImage(false);
          setSaveStatus('');
        }, 2000);
      }
    } catch (error) {
      setSaveStatus('সেভ ব্যর্থ হয়েছে!');
      console.error('Save error:', error);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ফাইল সাইজ চেক (৫MB পর্যন্ত)
      if (file.size > 5 * 1024 * 1024) {
        setSaveStatus('ছবি ৫MB এর বেশি হতে পারবে না!');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImage({ ...newImage, url: event.target?.result as string });
        setSaveStatus('');
      };
      reader.readAsDataURL(file);
    }
  };

  // শেয়ার লিংক কপি করা
  const copyShareLink = (imageId: string) => {
    const baseUrl = getBaseUrl();
    const shareLink = `${baseUrl}/article/${imageId}`;
    navigator.clipboard.writeText(shareLink);
    setCopiedId(imageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ছবি শেয়ার করা (WhatsApp)
  const shareOnWhatsApp = (image: { id?: string; caption: string; title?: string }) => {
    const baseUrl = getBaseUrl();
    const shareLink = `${baseUrl}/article/${image.id}`;
    const text = `আপন ফাউন্ডেশন\n${image.title || image.caption}\n\nবিস্তারিত পড়তে ক্লিক করুন:\n${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Facebook এ শেয়ার
  const shareOnFacebook = (image: { id?: string }) => {
    const baseUrl = getBaseUrl();
    const shareLink = `${baseUrl}/article/${image.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank');
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#1B5E20]">🖼️ গ্যালারি</h2>
        {canUpload && (
          <Button onClick={() => setIsAddingImage(true)} className="bg-[#1B5E20]">
            <Plus className="mr-2" size={18} /> ছবি যুক্ত করুন
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-xl text-gray-500">কোনো ছবি নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((image) => (
            <div key={image.id} className="relative group overflow-hidden rounded-lg shadow-lg">
              <img 
                src={image.url} 
                alt={image.caption} 
                className="w-full h-48 object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-3 w-full">
                  <p className="text-white text-sm truncate mb-2">{image.caption}</p>
                  <div className="flex flex-wrap gap-1">
                    {canShare && (
                      <>
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700 px-2" onClick={() => copyShareLink(image.id)} title="লিংক কপি করুন">
                          {copiedId === image.id ? '✓ কপি' : <Share2 size={12} />}
                        </Button>
                        <Button size="sm" className="bg-green-700 text-white hover:bg-green-800 px-2" onClick={() => shareOnWhatsApp(image)} title="WhatsApp">
                          <MessageCircle size={12} />
                        </Button>
                        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 px-2" onClick={() => shareOnFacebook(image)} title="Facebook">
                          <Facebook size={12} />
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button size="sm" variant="destructive" className="px-2" onClick={() => deleteGalleryImage(image.id)}>
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={isAddingImage} onOpenChange={setIsAddingImage}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">📸 ছবি ও আর্টিকেল যুক্ত করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* স্ট্যাটাস মেসেজ */}
            {saveStatus && (
              <div className={`p-3 rounded-lg text-center ${saveStatus.includes('সেভ হয়েছে') ? 'bg-green-100 text-green-700' : saveStatus.includes('ব্যর্থ') || saveStatus.includes('দিতে হবে') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {saveStatus}
              </div>
            )}
            
            {/* ছবি আপলোড */}
            <div>
              <Label>ছবি আপলোড করুন *</Label>
              <Input type="file" accept="image/*" onChange={handleFileUpload} />
              <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ ৫MB, JPG/PNG</p>
            </div>
            {newImage.url && (
              <img src={newImage.url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
            )}

            {/* ক্যাপশন ও ক্যাটেগরি */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ক্যাপশন *</Label>
                <Input 
                  value={newImage.caption} 
                  onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                  placeholder="ছবির সংক্ষিপ্ত বিবরণ"
                />
              </div>
              <div>
                <Label>ক্যাটেগরি</Label>
                <Select value={newImage.category} onValueChange={(v) => setNewImage({ ...newImage, category: v })}>
                  <SelectTrigger><SelectValue placeholder="সিলেক্ট করুন" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="অনুষ্ঠান">অনুষ্ঠান</SelectItem>
                    <SelectItem value="কার্যক্রম">কার্যক্রম</SelectItem>
                    <SelectItem value="সেবামূলক">সেবামূলক</SelectItem>
                    <SelectItem value="শিক্ষা">শিক্ষা</SelectItem>
                    <SelectItem value="স্বাস্থ্য">স্বাস্থ্য</SelectItem>
                    <SelectItem value="খেলাধুলা">খেলাধুলা</SelectItem>
                    <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* আর্টিকেল সেকশন */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <h3 className="font-bold text-[#1B5E20] mb-3 flex items-center gap-2">
                📰 আর্টিকেল (ঐচ্ছিক)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label>আর্টিকেল শিরোনাম</Label>
                  <Input 
                    value={newImage.title} 
                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    placeholder="পত্রিকার মতো শিরোনাম লিখুন"
                  />
                </div>
                <div>
                  <Label>বিস্তারিত লেখা</Label>
                  <Textarea 
                    value={newImage.content} 
                    onChange={(e) => setNewImage({ ...newImage, content: e.target.value })}
                    placeholder="এই ছবির বিস্তারিত বিবরণ লিখুন... পত্রিকার মতো আর্টিকেল হবে"
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>লেখক</Label>
                    <Input 
                      value={newImage.author} 
                      onChange={(e) => setNewImage({ ...newImage, author: e.target.value })}
                      placeholder="লেখকের নাম"
                    />
                  </div>
                  <div>
                    <Label>ট্যাগ (কমা দিয়ে)</Label>
                    <Input 
                      value={newImage.tags} 
                      onChange={(e) => setNewImage({ ...newImage, tags: e.target.value })}
                      placeholder="সেবা, শিক্ষা, স্বাস্থ্য"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={newImage.isPublished}
                    onCheckedChange={(checked) => setNewImage({ ...newImage, isPublished: checked as boolean })}
                  />
                  <span className="text-sm">প্রকাশিত (সবাই দেখতে পাবে)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setIsAddingImage(false); setSaveStatus(''); }}>বাতিল</Button>
              <Button 
                className="flex-1 bg-[#1B5E20]" 
                onClick={handleAddImage}
              >
                সংরক্ষণ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ FINANCE SECTION ============
function FinanceSection() {
  const { transactions, addTransaction, deleteTransaction, foundationInfo } = useStore();
  const { hasPermission } = useAuthStore();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [searchQuery, setSearchQuery] = useState({ month: '', year: '', category: '', member: '' });
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    amount: 0,
    category: 'donation' as string,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const canIncome = hasPermission('finance_income' as Permission);
  const canExpense = hasPermission('finance_expense' as Permission);
  const canDelete = hasPermission('finance_delete' as Permission);
  const canPdf = hasPermission('finance_pdf' as Permission);

  const handleAddTransaction = () => {
    if (newTransaction.amount > 0) {
      const categoryLabel = newTransaction.type === 'income' 
        ? incomeCategoriesBn[newTransaction.category] 
        : expenseCategoriesBn[newTransaction.category];
      
      addTransaction({
        ...newTransaction,
        categoryLabel,
      });
      setNewTransaction({
        type: 'income',
        amount: 0,
        category: 'donation',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsAddingTransaction(false);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    if (searchQuery.month && date.getMonth() + 1 !== parseInt(searchQuery.month)) return false;
    if (searchQuery.year && date.getFullYear() !== parseInt(searchQuery.year)) return false;
    if (searchQuery.category && t.category !== searchQuery.category) return false;
    return true;
  });

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#1B5E20]">💰 আর্থিক ব্যবস্থাপনা</h2>
        <div className="flex gap-2">
          {canPdf && (
            <Button onClick={() => generateIncomeExpenseReportPDF(transactions, foundationInfo)} className="bg-[#D4AF37] text-[#1B5E20]">
              <Download className="mr-2" size={18} /> রিপোর্ট PDF
            </Button>
          )}
          {(canIncome || canExpense) && (
            <Button onClick={() => setIsAddingTransaction(true)} className="bg-[#1B5E20]">
              <Plus className="mr-2" size={18} /> নতুন লেনদেন
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-[#1B5E20]">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">মোট আয়</p>
            <p className="text-3xl font-bold text-[#1B5E20]">৳{toBanglaNumber(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#8B0000]">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">মোট ব্যয়</p>
            <p className="text-3xl font-bold text-[#8B0000]">৳{toBanglaNumber(totalExpense)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#D4AF37]">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">বর্তমান ব্যালেন্স</p>
            <p className="text-3xl font-bold text-[#D4AF37]">৳{toBanglaNumber(balance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardContent className="pt-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet size={48} className="mx-auto mb-2 text-gray-300" />
              <p>কোনো লেনদেন নেই</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">তারিখ</th>
                    <th className="px-4 py-3 text-left">ধরন</th>
                    <th className="px-4 py-3 text-left">খাত</th>
                    <th className="px-4 py-3 text-right">পরিমাণ</th>
                    {canDelete && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{formatBanglaDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <Badge className={t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {t.type === 'income' ? 'আয়' : 'ব্যয়'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{t.categoryLabel}</td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: t.type === 'income' ? '#1B5E20' : '#8B0000' }}>
                        ৳{toBanglaNumber(t.amount)}
                      </td>
                      {canDelete && (
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost" onClick={() => deleteTransaction(t.id)}>
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* আর্থিক চার্ট */}
      {transactions.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* খাত অনুযায়ী আয় - পাই চার্ট */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#1B5E20]">📊 আয়ের বিতরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(
                      transactions.filter(t => t.type === 'income').reduce((acc, t) => {
                        const cat = t.categoryLabel || incomeCategoriesBn[t.category] || t.category;
                        acc[cat] = (acc[cat] || 0) + t.amount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {transactions.filter(t => t.type === 'income').map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#1B5E20', '#2e7d32', '#4caf50', '#81c784', '#a5d6a7'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* খাত অনুযায়ী ব্যয় - পাই চার্ট */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#8B0000]">📊 ব্যয়ের বিতরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(
                      transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
                        const cat = t.categoryLabel || expenseCategoriesBn[t.category] || t.category;
                        acc[cat] = (acc[cat] || 0) + t.amount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {transactions.filter(t => t.type === 'expense').map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#8B0000', '#b71c1c', '#c62828', '#e53935', '#ef5350'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* মাসিক আয়-ব্যয় লাইন চার্ট */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-center text-[#1B5E20]">📈 মাসিক আয়-ব্যয় প্রবণতা</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={(() => {
                  const monthData: Record<string, { income: number; expense: number; month: string }> = {};
                  transactions.forEach(t => {
                    const date = new Date(t.date);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (!monthData[key]) {
                      monthData[key] = { 
                        income: 0, 
                        expense: 0, 
                        month: `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}` 
                      };
                    }
                    if (t.type === 'income') {
                      monthData[key].income += t.amount;
                    } else {
                      monthData[key].expense += t.amount;
                    }
                  });
                  return Object.entries(monthData)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([, data]) => ({
                      ...data,
                      আয়: data.income,
                      ব্যয়: data.expense,
                    }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="আয়" stroke="#1B5E20" strokeWidth={2} dot={{ fill: '#1B5E20' }} />
                  <Line type="monotone" dataKey="ব্যয়" stroke="#8B0000" strokeWidth={2} dot={{ fill: '#8B0000' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন লেনদেন যুক্ত করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>লেনদেনের ধরন</Label>
              <Tabs value={transactionType} onValueChange={(v) => {
                setTransactionType(v as any);
                setNewTransaction({ ...newTransaction, type: v as any, category: v === 'income' ? 'donation' : 'medical' });
              }}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="income" className="text-green-700">আয়</TabsTrigger>
                  <TabsTrigger value="expense" className="text-red-700">ব্যয়</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <Label>পরিমাণ (টাকা)</Label>
              <Input 
                type="number"
                value={newTransaction.amount} 
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>খাত</Label>
              <Select value={newTransaction.category} onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {transactionType === 'income' ? (
                    <>
                      <SelectItem value="membership_fee">সদস্য ফি</SelectItem>
                      <SelectItem value="monthly_subscription">মাসিক চাঁদা</SelectItem>
                      <SelectItem value="donation">অনুদান</SelectItem>
                      <SelectItem value="other">অন্যান্য</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="medical">চিকিৎসা</SelectItem>
                      <SelectItem value="winter_clothes">শীতবস্ত্র বিতরণ</SelectItem>
                      <SelectItem value="sports_equipment">ক্রীড়া উপকরণ</SelectItem>
                      <SelectItem value="educational_materials">শিক্ষা উপকরণ</SelectItem>
                      <SelectItem value="scholarship">শিক্ষাবৃত্তি</SelectItem>
                      <SelectItem value="other">অন্যান্য</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>বিবরণ</Label>
              <Textarea 
                value={newTransaction.description} 
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>তারিখ</Label>
              <Input 
                type="date"
                value={newTransaction.date} 
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingTransaction(false)}>বাতিল</Button>
              <Button className="flex-1 bg-[#1B5E20]" onClick={handleAddTransaction}>সংরক্ষণ করুন</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ DOCUMENTS SECTION ============
function DocumentsSection() {
  const { receipts, addReceipt, deleteReceipt, vouchers, addVoucher, deleteVoucher, foundationInfo } = useStore();
  const { hasPermission } = useAuthStore();
  const [activeDoc, setActiveDoc] = useState<'pad' | 'receipt' | 'voucher'>('pad');
  const [isAddingReceipt, setIsAddingReceipt] = useState(false);
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  
  const canPad = hasPermission('document_pad' as Permission);
  const canReceipt = hasPermission('document_receipt' as Permission);
  const canVoucher = hasPermission('document_voucher' as Permission);
  const canDelete = hasPermission('document_delete' as Permission);
  
  const [newReceipt, setNewReceipt] = useState({
    receiptNo: '',
    type: 'subscription' as 'subscription' | 'donation',
    amount: 0,
    purpose: '',
    payerName: '',
    payerAddress: '',
    payerMobile: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [newVoucher, setNewVoucher] = useState({
    voucherNo: '',
    type: 'payment' as 'payment' | 'donation_given',
    amount: 0,
    purpose: '',
    recipientName: '',
    recipientAddress: '',
    recipientMobile: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddReceipt = () => {
    if (newReceipt.payerName && newReceipt.amount > 0) {
      addReceipt({
        ...newReceipt,
        amountInWords: numberToBanglaWords(newReceipt.amount),
      });
      setNewReceipt({
        receiptNo: '',
        type: 'subscription',
        amount: 0,
        purpose: '',
        payerName: '',
        payerAddress: '',
        payerMobile: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsAddingReceipt(false);
    }
  };

  const handleAddVoucher = () => {
    if (newVoucher.recipientName && newVoucher.amount > 0) {
      addVoucher({
        ...newVoucher,
        amountInWords: numberToBanglaWords(newVoucher.amount),
      });
      setNewVoucher({
        voucherNo: '',
        type: 'payment',
        amount: 0,
        purpose: '',
        recipientName: '',
        recipientAddress: '',
        recipientMobile: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsAddingVoucher(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#1B5E20] mb-8">📄 ডকুমেন্ট</h2>

      <Tabs value={activeDoc} onValueChange={(v) => setActiveDoc(v as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pad">নিজস্ব প্যাড</TabsTrigger>
          <TabsTrigger value="receipt">রশিদ</TabsTrigger>
          <TabsTrigger value="voucher">ভাউচার</TabsTrigger>
        </TabsList>

        {/* Pad Tab */}
        <TabsContent value="pad">
          <Card>
            <CardContent className="pt-6 text-center">
              <File size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-4">প্রতিষ্ঠানের নিজস্ব প্যাড প্রিন্ট করুন</p>
              {canPad && (
                <Button onClick={() => generateGeneralPadPDF(foundationInfo)} className="bg-[#1B5E20]">
                  <Printer className="mr-2" size={18} /> প্যাড প্রিন্ট করুন
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Tab */}
        <TabsContent value="receipt">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-semibold">রশিদ তালিকা</h3>
            {canReceipt && (
              <Button onClick={() => setIsAddingReceipt(true)} className="bg-[#1B5E20]">
                <Plus className="mr-2" size={18} /> নতুন রশিদ
              </Button>
            )}
          </div>
          {receipts.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-gray-500">কোনো রশিদ নেই</CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {receipts.map((receipt) => (
                <Card key={receipt.id} className="border-l-4 border-l-[#1B5E20]">
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{receipt.payerName}</p>
                      <p className="text-sm text-gray-500">{formatBanglaDate(receipt.date)} | ৳{toBanglaNumber(receipt.amount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => generateDonationReceiptPDF(receipt, foundationInfo)}>
                        <Printer size={14} />
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => shareViaWhatsApp(generateReceiptShareText(receipt))}>
                        <MessageCircle size={14} />
                      </Button>
                      {canDelete && (
                        <Button size="sm" variant="destructive" onClick={() => deleteReceipt(receipt.id)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Voucher Tab */}
        <TabsContent value="voucher">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-semibold">ভাউচার তালিকা</h3>
            {canVoucher && (
              <Button onClick={() => setIsAddingVoucher(true)} className="bg-[#8B0000]">
                <Plus className="mr-2" size={18} /> নতুন ভাউচার
              </Button>
            )}
          </div>
          {vouchers.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-gray-500">কোনো ভাউচার নেই</CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {vouchers.map((voucher) => (
                <Card key={voucher.id} className="border-l-4 border-l-[#8B0000]">
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{voucher.recipientName}</p>
                      <p className="text-sm text-gray-500">{formatBanglaDate(voucher.date)} | ৳{toBanglaNumber(voucher.amount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => generateExpenseVoucherPDF(voucher, foundationInfo)}>
                        <Printer size={14} />
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => shareViaWhatsApp(generateVoucherShareText(voucher))}>
                        <MessageCircle size={14} />
                      </Button>
                      {canDelete && (
                        <Button size="sm" variant="destructive" onClick={() => deleteVoucher(voucher.id)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Receipt Dialog */}
      <Dialog open={isAddingReceipt} onOpenChange={setIsAddingReceipt}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন রশিদ তৈরি করুন</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>রশিদ নম্বর</Label>
                <Input value={newReceipt.receiptNo} onChange={(e) => setNewReceipt({ ...newReceipt, receiptNo: e.target.value })} />
              </div>
              <div>
                <Label>তারিখ</Label>
                <Input type="date" value={newReceipt.date} onChange={(e) => setNewReceipt({ ...newReceipt, date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>প্রদানকারীর নাম</Label>
              <Input value={newReceipt.payerName} onChange={(e) => setNewReceipt({ ...newReceipt, payerName: e.target.value })} />
            </div>
            <div>
              <Label>ঠিকানা</Label>
              <Input value={newReceipt.payerAddress} onChange={(e) => setNewReceipt({ ...newReceipt, payerAddress: e.target.value })} />
            </div>
            <div>
              <Label>মোবাইল</Label>
              <Input value={newReceipt.payerMobile} onChange={(e) => setNewReceipt({ ...newReceipt, payerMobile: e.target.value })} />
            </div>
            <div>
              <Label>পরিমাণ</Label>
              <Input type="number" value={newReceipt.amount} onChange={(e) => setNewReceipt({ ...newReceipt, amount: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>উদ্দেশ্য</Label>
              <Input value={newReceipt.purpose} onChange={(e) => setNewReceipt({ ...newReceipt, purpose: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingReceipt(false)}>বাতিল</Button>
              <Button className="flex-1 bg-[#1B5E20]" onClick={handleAddReceipt}>সংরক্ষণ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Voucher Dialog */}
      <Dialog open={isAddingVoucher} onOpenChange={setIsAddingVoucher}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন ভাউচার তৈরি করুন</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ভাউচার নম্বর</Label>
                <Input value={newVoucher.voucherNo} onChange={(e) => setNewVoucher({ ...newVoucher, voucherNo: e.target.value })} />
              </div>
              <div>
                <Label>তারিখ</Label>
                <Input type="date" value={newVoucher.date} onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>প্রাপকের নাম</Label>
              <Input value={newVoucher.recipientName} onChange={(e) => setNewVoucher({ ...newVoucher, recipientName: e.target.value })} />
            </div>
            <div>
              <Label>ঠিকানা</Label>
              <Input value={newVoucher.recipientAddress} onChange={(e) => setNewVoucher({ ...newVoucher, recipientAddress: e.target.value })} />
            </div>
            <div>
              <Label>মোবাইল</Label>
              <Input value={newVoucher.recipientMobile} onChange={(e) => setNewVoucher({ ...newVoucher, recipientMobile: e.target.value })} />
            </div>
            <div>
              <Label>পরিমাণ</Label>
              <Input type="number" value={newVoucher.amount} onChange={(e) => setNewVoucher({ ...newVoucher, amount: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>উদ্দেশ্য</Label>
              <Input value={newVoucher.purpose} onChange={(e) => setNewVoucher({ ...newVoucher, purpose: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingVoucher(false)}>বাতিল</Button>
              <Button className="flex-1 bg-[#8B0000]" onClick={handleAddVoucher}>সংরক্ষণ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ CONTACT SECTION ============
function ContactSection() {
  const { foundationInfo, socialLinks } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook size={20} />;
      case 'instagram': return <Instagram size={20} />;
      case 'whatsapp': return <MessageCircle size={20} />;
      case 'tiktok': return <Music size={20} />;
      case 'youtube': return <Youtube size={20} />;
      default: return <Share2 size={20} />;
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#1B5E20] mb-8 text-center">📞 যোগাযোগ করুন</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <Card className="border-2 border-[#1B5E20]">
          <CardHeader className="bg-[#1B5E20] text-white">
            <CardTitle>যোগাযোগের তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                <span className="text-[#1B5E20] text-xl">📍</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">ঠিকানা</p>
                <p className="font-semibold">{foundationInfo.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                <span className="text-[#1B5E20] text-xl">📱</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-semibold">{foundationInfo.whatsapp}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                <span className="text-[#1B5E20] text-xl">📧</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">ইমেইল</p>
                <p className="font-semibold">{foundationInfo.email}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Social Links */}
            <div>
              <p className="font-semibold mb-3">সোশ্যাল মিডিয়া</p>
              <div className="flex gap-3">
                {socialLinks.filter(s => s.isVisible).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#1B5E20] text-white rounded-full flex items-center justify-center hover:bg-[#2e7d32] transition-colors"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="border-2 border-[#D4AF37]">
          <CardHeader className="bg-[#D4AF37] text-[#1B5E20]">
            <CardTitle>মেসেজ পাঠান</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
                <p className="text-lg text-green-600">আপনার মেসেজ পাঠানো হয়েছে!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>আপনার নাম</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>ইমেইল</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>মোবাইল নম্বর</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>আপনার মেসেজ</Label>
                  <Textarea 
                    value={formData.message} 
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#D4AF37] text-[#1B5E20] hover:bg-[#e5c158]">
                  <Save className="mr-2" size={18} /> পাঠান
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ============ SETTINGS SECTION ============
function SettingsSection() {
  const { 
    foundationInfo, updateFoundationInfo,
    members, constitution, notices, transactions, 
    gallery, socialLinks, receipts, vouchers,
    saveAllToServer, loadFromServer
  } = useStore();
  const { currentUser, addAdmin, updateAdminPermissions, deleteAdmin, getAdmins, hasPermission, isAuthenticated } = useAuthStore();
  
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  
  // Admin management
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    name: '',
    password: '',
    permissions: [] as string[],
  });
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  
  // Google Sync
  const [googleScriptUrl, setGoogleScriptUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Load Google Script URL from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('googleScriptUrl') || '';
    setGoogleScriptUrl(savedUrl);
  }, []);

  const canLogo = hasPermission('settings_logo' as Permission);
  const canBackup = hasPermission('settings_backup' as Permission);
  const canManageAdmin = hasPermission('settings_admin' as Permission);
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // ব্যাকআপ ডাউনলোড
  const handleBackup = () => {
    const backupData = {
      version: '1.0',
      backupDate: new Date().toISOString(),
      foundationInfo,
      members,
      constitution,
      notices,
      transactions,
      gallery,
      socialLinks,
      receipts,
      vouchers,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `apon-foundation-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupMessage({ type: 'success', text: 'ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!' });
    setTimeout(() => setBackupMessage(null), 3000);
  };

  // রিস্টোর
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!data.version || !data.backupDate) {
          throw new Error('অবৈধ ব্যাকআপ ফাইল');
        }

        // localStorage এ সেভ
        localStorage.setItem('apon-foundation-storage', JSON.stringify({
          state: {
            foundationInfo: data.foundationInfo || foundationInfo,
            members: data.members || [],
            constitution: data.constitution || null,
            notices: data.notices || [],
            transactions: data.transactions || [],
            gallery: data.gallery || [],
            socialLinks: data.socialLinks || [],
            receipts: data.receipts || [],
            vouchers: data.vouchers || [],
          },
          version: 0
        }));

        // সার্ভারেও সেভ
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullData: {
            foundationInfo: data.foundationInfo,
            members: data.members,
            constitution: data.constitution,
            notices: data.notices,
            transactions: data.transactions,
            gallery: data.gallery,
            socialLinks: data.socialLinks,
            receipts: data.receipts,
            vouchers: data.vouchers,
          }})
        });

        setBackupMessage({ type: 'success', text: 'ডাটা সফলভাবে রিস্টোর হয়েছে! পেজ রিফ্রেশ করুন।' });
        setTimeout(() => window.location.reload(), 2000);
      } catch {
        setBackupMessage({ type: 'error', text: 'ব্যাকআপ ফাইল পড়তে সমস্যা হয়েছে!' });
        setTimeout(() => setBackupMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // লোগো আপলোড
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setBackupMessage({ type: 'error', text: 'ফাইল সাইজ ২MB এর বেশি হতে পারবে না!' });
      setTimeout(() => setBackupMessage(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      updateFoundationInfo({ logo: base64 });
      setBackupMessage({ type: 'success', text: 'লোগো সফলভাবে আপলোড হয়েছে!' });
      setTimeout(() => setBackupMessage(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // এডমিন যুক্ত করা
  const handleAddAdmin = () => {
    try {
      if (!newAdminData.email || !newAdminData.name || !newAdminData.password) {
        setBackupMessage({ type: 'error', text: 'সব তথ্য পূরণ করুন!' });
        setTimeout(() => setBackupMessage(null), 3000);
        return;
      }
      
      const result = addAdmin(
        newAdminData.email,
        newAdminData.name,
        newAdminData.password,
        newAdminData.permissions as Permission[]
      );
      
      if (result.success) {
        setNewAdminData({ email: '', name: '', password: '', permissions: [] });
        setIsAddingAdmin(false);
        setBackupMessage({ type: 'success', text: result.message });
      } else {
        setBackupMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Add admin error:', error);
      setBackupMessage({ type: 'error', text: 'এডমিন যুক্ত করতে সমস্যা হয়েছে!' });
    }
    setTimeout(() => setBackupMessage(null), 3000);
  };

  // পারমিশন টগল
  const togglePermission = (permission: string, isNew: boolean = false) => {
    if (isNew) {
      setNewAdminData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else {
      setEditPermissions(prev =>
        prev.includes(permission)
          ? prev.filter(p => p !== permission)
          : [...prev, permission]
      );
    }
  };

  // পারমিশন সেভ
  const handleSavePermissions = (adminId: string) => {
    try {
      if (!adminId) {
        setBackupMessage({ type: 'error', text: 'অ্যাডমিন আইডি পাওয়া যায়নি!' });
        return;
      }
      updateAdminPermissions(adminId, editPermissions as Permission[]);
      setEditingAdminId(null);
      setEditPermissions([]);
      setBackupMessage({ type: 'success', text: 'অনুমতি আপডেট হয়েছে!' });
    } catch (error) {
      console.error('Permission save error:', error);
      setBackupMessage({ type: 'error', text: 'অনুমতি সেভ করতে সমস্যা হয়েছে!' });
    }
    setTimeout(() => setBackupMessage(null), 3000);
  };

  // ডাটা পরিসংখ্যান
  const dataStats = {
    members: members.length,
    notices: notices.length,
    transactions: transactions.length,
    gallery: gallery.length,
    receipts: receipts.length,
    vouchers: vouchers.length,
    chapters: constitution?.chapters.length || 0,
  };

  const admins = getAdmins();

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#1B5E20] mb-8">⚙️ সেটিংস</h2>

      {/* Message Alert */}
      {backupMessage && (
        <div className={`mb-6 p-4 rounded-lg ${backupMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {backupMessage.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* লোগো আপলোড */}
        {canLogo && (
          <Card className="border-2 border-[#1B5E20]">
            <CardHeader className="bg-[#1B5E20] text-white">
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} /> লোগো আপলোড
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full p-2 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <img 
                    src={logoPreview || foundationInfo.logo} 
                    alt="লোগো" 
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.svg';
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG বা SVG ফাইল (সর্বোচ্চ ২MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#1B5E20]"
                >
                  <Upload className="mr-2" size={18} /> লোগো আপলোড করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ডাটা ব্যাকআপ */}
        {canBackup && (
          <Card className="border-2 border-[#D4AF37]">
            <CardHeader className="bg-[#D4AF37] text-[#1B5E20]">
              <CardTitle className="flex items-center gap-2">
                <Database size={20} /> ডাটা ব্যাকআপ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>সদস্য</span>
                  <Badge className="bg-[#1B5E20]">{toBanglaNumber(dataStats.members)} জন</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>নোটিশ</span>
                  <Badge className="bg-[#8B0000]">{toBanglaNumber(dataStats.notices)} টি</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>লেনদেন</span>
                  <Badge className="bg-[#D4AF37] text-[#1B5E20]">{toBanglaNumber(dataStats.transactions)} টি</Badge>
                </div>
                
                <Separator />
                
                <Button onClick={handleBackup} className="w-full bg-[#1B5E20]">
                  <Download className="mr-2" size={18} /> ব্যাকআপ ডাউনলোড করুন
                </Button>
                
                {isSuperAdmin && (
                  <>
                    <Separator />
                    <input
                      ref={restoreInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => restoreInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="mr-2" size={18} /> ব্যাকআপ থেকে রিস্টোর করুন
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ☁️ অটো ক্লাউড ব্যাকআপ - সব এডমিন */}
        {isAuthenticated && (
          <Card className="border-2 border-[#4285f4] md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Cloud size={24} /> ☁️ অটো ক্লাউড ব্যাকআপ
              </CardTitle>
              <p className="text-white/80 text-sm mt-1">একবার সেটআপ করলে সব ডাটা অটোমেটিক সেভ হবে!</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* সিঙ্ক স্ট্যাটাস */}
                {syncStatus === 'success' ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Check size={40} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">✅ ক্লাউড সিঙ্ক সক্রিয়</h3>
                    <p className="text-green-600 mb-4">সব ডাটা অটোমেটিক Google Sheets-এ সেভ হচ্ছে</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>সর্বশেষ সিঙ্ক: এখনই</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CloudOff size={48} className="text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-blue-700 mb-2">ক্লাউড ব্যাকআপ সেটআপ করুন</h3>
                      <p className="text-blue-600 text-sm">নিচের বাটনে ক্লিক করে সহজে সেটআপ করুন</p>
                    </div>
                    
                    {/* বড় বাটন */}
                    <a 
                      href="https://script.google.com/home/projects/create" 
                      target="_blank"
                      className="block w-full bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-xl p-6 text-center transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-10 h-10">
                          <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-xl font-bold">Google Sheets এ সংযুক্ত করুন</div>
                          <div className="text-sm text-white/80">এক ক্লিকে সেটআপ শুরু করুন</div>
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                {/* URL ইনপুট - শুধু যখন সেটআপ করছে */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ExternalLink size={16} />
                    আপনার Google Script URL এখানে দিন:
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="url"
                      placeholder="https://script.google.com/macros/s/xxxxx/exec"
                      value={googleScriptUrl}
                      onChange={(e) => {
                        setGoogleScriptUrl(e.target.value);
                        localStorage.setItem('googleScriptUrl', e.target.value);
                      }}
                      className="flex-1"
                    />
                    <Button 
                      className="bg-[#34a853] hover:bg-[#2d8e47]"
                      disabled={syncStatus === 'testing' || !googleScriptUrl}
                      onClick={async () => {
                        if (!googleScriptUrl) return;
                        setSyncStatus('testing');
                        try {
                          const response = await fetch(`${googleScriptUrl}?action=load`);
                          const result = await response.json();
                          if (result.success) {
                            setSyncStatus('success');
                            setBackupMessage({ type: 'success', text: '✅ ক্লাউড সিঙ্ক সফল! এখন থেকে সব ডাটা অটো সেভ হবে।' });
                            await saveAllToServer();
                          } else {
                            setSyncStatus('error');
                            setBackupMessage({ type: 'error', text: '❌ সংযোগ ব্যর্থ! URL ঠিক আছে কিনা দেখুন।' });
                          }
                        } catch (e) {
                          setSyncStatus('error');
                          setBackupMessage({ type: 'error', text: '❌ সংযোগ ব্যর্থ! সঠিক URL দিন।' });
                        }
                        setTimeout(() => setBackupMessage(null), 5000);
                      }}
                    >
                      {syncStatus === 'testing' ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" /> যাচাই হচ্ছে...
                        </>
                      ) : (
                        <>সংযোগ করুন</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* সহজ সেটআপ গাইড */}
                <details className="bg-white border rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-700 flex items-center gap-2">
                    📋 কিভাবে সেটআপ করবেন? (৩টি সহজ ধাপ)
                  </summary>
                  <div className="p-4 pt-0 space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">১</div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Google Apps Script খুলুন</h4>
                        <p className="text-sm text-blue-600">উপরে নীল বাটনে ক্লিক করুন, Google এ লগইন করুন</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">২</div>
                      <div>
                        <h4 className="font-semibold text-green-800">কোড পেস্ট করুন</h4>
                        <p className="text-sm text-green-600 mb-2">নিচের কোড কপি করে পেস্ট করুন:</p>
                        <div className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto">
                          <pre>{`const SHEET_NAME = 'Data';
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    return ContentService.createTextOutput(JSON.stringify({success: true, data: {}}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const data = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      try { result[data[i][0]] = JSON.parse(data[i][1]); }
      catch(e) { result[data[i][0]] = data[i][1]; }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({success: true, data: result}))
    .setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'save') {
      let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      sheet.clear();
      sheet.appendRow(['Key', 'Value', 'Updated']);
      for (const [k, v] of Object.entries(body.data)) {
        sheet.appendRow([k, JSON.stringify(v), new Date().toISOString()]);
      }
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}</pre>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">৩</div>
                      <div>
                        <h4 className="font-semibold text-purple-800">Deploy করুন ও URL নিন</h4>
                        <ol className="text-sm text-purple-600 list-decimal list-inside space-y-1">
                          <li><strong>Deploy → New deployment</strong> ক্লিক করুন</li>
                          <li>গিয়ার আইকন থেকে <strong>Web app</strong> সিলেক্ট করুন</li>
                          <li><strong>Who has access: Anyone</strong> সেট করুন</li>
                          <li><strong>Deploy</strong> ক্লিক করুন ও URL কপি করুন</li>
                          <li>সেই URL উপরে বক্সে পেস্ট করুন</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </details>

                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">
                    💡 <strong>টিপস:</strong> একবার সেটআপ করলে সব ডাটা অটোমেটিক Google Sheets-এ সেভ হবে। 
                    ওয়েবসাইটে কোনো কিছু পরিবর্তন করলে ২ সেকেন্ডের মধ্যে ক্লাউডে আপডেট হবে।
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* এডমিন ব্যবস্থাপনা - শুধু সুপার এডমিন */}
        {canManageAdmin && isSuperAdmin && (
          <Card className="border-2 border-[#8B0000] md:col-span-2">
            <CardHeader className="bg-[#8B0000] text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus size={20} /> এডমিন ব্যবস্থাপনা
                </CardTitle>
                {admins.length < 5 && (
                  <Button 
                    onClick={() => setIsAddingAdmin(true)}
                    className="bg-white text-[#8B0000] hover:bg-gray-100"
                  >
                    <Plus size={18} className="mr-1" /> নতুন এডমিন
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {admins.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো এডমিন নেই</p>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-semibold">{admin.name}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingAdminId(admin.id);
                              setEditPermissions(Array.isArray(admin.permissions) ? [...admin.permissions] : []);
                            }}
                          >
                            <Eye size={14} className="mr-1" /> অনুমতি সম্পাদনা
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteAdmin(admin.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(admin.permissions) && admin.permissions.slice(0, 5).map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {p.split('_')[0]}
                          </Badge>
                        ))}
                        {Array.isArray(admin.permissions) && admin.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{admin.permissions.length - 5} আরো
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Edit Permissions Dialog */}
              <Dialog open={!!editingAdminId} onOpenChange={() => setEditingAdminId(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>অনুমতি সম্পাদনা</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {Object.entries(permissionGroups).map(([key, group]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{group.title}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {group.permissions.map((perm) => (
                            <label 
                              key={perm.key} 
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={editPermissions.includes(perm.key)}
                                onCheckedChange={(checked) => {
                                  if (checked !== 'indeterminate') {
                                    togglePermission(perm.key);
                                  }
                                }}
                              />
                              <span className="text-sm">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setEditingAdminId(null)}>
                        বাতিল
                      </Button>
                      <Button 
                        className="flex-1 bg-[#1B5E20]"
                        onClick={() => editingAdminId && handleSavePermissions(editingAdminId)}
                      >
                        সংরক্ষণ করুন
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন এডমিন যুক্ত করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>নাম</Label>
                <Input 
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>ইমেইল</Label>
                <Input 
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>পাসওয়ার্ড</Label>
              <Input 
                type="password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
              />
            </div>
            
            <Separator />
            
            <h4 className="font-semibold">অনুমতি নির্বাচন করুন:</h4>
            
            {Object.entries(permissionGroups).filter(([key]) => key !== 'settings').map(([key, group]) => (
              <div key={key} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">{group.title}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {group.permissions.map((perm) => (
                    <label 
                      key={perm.key} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={newAdminData.permissions.includes(perm.key)}
                        onCheckedChange={(checked) => {
                          if (checked !== 'indeterminate') {
                            togglePermission(perm.key, true);
                          }
                        }}
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingAdmin(false)}>
                বাতিল
              </Button>
              <Button className="flex-1 bg-[#1B5E20]" onClick={handleAddAdmin}>
                সংরক্ষণ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============ SEARCH SECTION ============
function SearchSection() {
  const { transactions, members, receipts, vouchers, notices, foundationInfo } = useStore();
  const [searchType, setSearchType] = useState<'member' | 'transaction' | 'date' | 'category'>('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({ month: '', year: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const COLORS = ['#1B5E20', '#8B0000', '#D4AF37', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];

  // সদস্য অনুযায়ী সার্চ
  const searchByMember = () => {
    if (!searchQuery.trim()) return;
    
    const memberResults: any[] = [];
    
    // রশিদ থেকে তথ্য
    receipts.forEach(r => {
      if (r.payerName.toLowerCase().includes(searchQuery.toLowerCase())) {
        memberResults.push({
          type: 'receipt',
          name: r.payerName,
          amount: r.amount,
          date: r.date,
          purpose: r.purpose || 'অনুদান',
          receiptNo: r.receiptNo,
        });
      }
    });
    
    // লেনদেন থেকে তথ্য
    transactions.filter(t => t.type === 'income').forEach(t => {
      if (t.memberName?.toLowerCase().includes(searchQuery.toLowerCase())) {
        memberResults.push({
          type: 'income',
          name: t.memberName,
          amount: t.amount,
          date: t.date,
          category: t.categoryLabel,
        });
      }
    });
    
    setSearchResults(memberResults);
    setHasSearched(true);
  };

  // তারিখ অনুযায়ী সার্চ
  const searchByDate = () => {
    const results: any[] = [];
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const matchMonth = !dateFilter.month || (date.getMonth() + 1) === parseInt(dateFilter.month);
      const matchYear = !dateFilter.year || date.getFullYear() === parseInt(dateFilter.year);
      
      if (matchMonth && matchYear) {
        results.push({
          type: t.type,
          amount: t.amount,
          date: t.date,
          category: t.categoryLabel,
          description: t.description,
        });
      }
    });
    
    setSearchResults(results);
    setHasSearched(true);
  };

  // খাত অনুযায়ী সার্চ
  const searchByCategory = () => {
    if (!categoryFilter) return;
    
    const results: any[] = [];
    
    transactions.forEach(t => {
      if (t.category === categoryFilter || t.categoryLabel?.includes(categoryFilter)) {
        results.push({
          type: t.type,
          amount: t.amount,
          date: t.date,
          category: t.categoryLabel,
          description: t.description,
        });
      }
    });
    
    setSearchResults(results);
    setHasSearched(true);
  };

  // সার্চ এক্সিকিউট
  const handleSearch = () => {
    switch (searchType) {
      case 'member':
        searchByMember();
        break;
      case 'date':
        searchByDate();
        break;
      case 'category':
        searchByCategory();
        break;
    }
  };

  // সার্চ রেজাল্টের সারসংক্ষেপ
  const getSummary = () => {
    if (searchResults.length === 0) return null;
    
    const totalIncome = searchResults
      .filter(r => r.type === 'income' || r.type === 'receipt')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const totalExpense = searchResults
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return { totalIncome, totalExpense, count: searchResults.length };
  };

  // চার্ট ডাটা
  const getChartData = () => {
    const categoryData: Record<string, number> = {};
    
    searchResults.forEach(r => {
      const cat = r.category || r.purpose || 'অন্যান্য';
      categoryData[cat] = (categoryData[cat] || 0) + r.amount;
    });
    
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
      amount: toBanglaNumber(value),
    }));
  };

  // মাসিক ডাটা
  const getMonthlyData = () => {
    const monthData: Record<string, { income: number; expense: number }> = {};
    
    searchResults.forEach(r => {
      const date = new Date(r.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = { income: 0, expense: 0 };
      }
      
      if (r.type === 'income' || r.type === 'receipt') {
        monthData[monthKey].income += r.amount;
      } else {
        monthData[monthKey].expense += r.amount;
      }
    });
    
    return Object.entries(monthData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: formatBanglaDate(`${month}-01`).split(',')[0]?.trim() || month,
        আয়: data.income,
        ব্যয়: data.expense,
      }));
  };

  const summary = getSummary();
  const chartData = getChartData();
  const monthlyData = getMonthlyData();

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#1B5E20] mb-8">🔍 সার্চ ও রিপোর্ট</h2>

      {/* সার্চ টাইপ সিলেক্ট */}
      <Tabs value={searchType} onValueChange={(v) => { setSearchType(v as any); setHasSearched(false); setSearchResults([]); }}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="member">সদস্য অনুযায়ী</TabsTrigger>
          <TabsTrigger value="date">তারিখ অনুযায়ী</TabsTrigger>
          <TabsTrigger value="category">খাত অনুযায়ী</TabsTrigger>
        </TabsList>

        {/* সদস্য সার্চ */}
        <TabsContent value="member">
          <Card className="border-2 border-[#1B5E20]">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সদস্যের নাম লিখুন..."
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="bg-[#1B5E20]">
                  <Search className="mr-2" size={18} /> সার্চ
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                উদাহরণ: মোহাম্মদ, রহিম, করিম
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* তারিখ সার্চ */}
        <TabsContent value="date">
          <Card className="border-2 border-[#D4AF37]">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>মাস</Label>
                  <Select value={dateFilter.month} onValueChange={(v) => setDateFilter({ ...dateFilter, month: v })}>
                    <SelectTrigger><SelectValue placeholder="মাস নির্বাচন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">জানুয়ারি</SelectItem>
                      <SelectItem value="2">ফেব্রুয়ারি</SelectItem>
                      <SelectItem value="3">মার্চ</SelectItem>
                      <SelectItem value="4">এপ্রিল</SelectItem>
                      <SelectItem value="5">মে</SelectItem>
                      <SelectItem value="6">জুন</SelectItem>
                      <SelectItem value="7">জুলাই</SelectItem>
                      <SelectItem value="8">আগস্ট</SelectItem>
                      <SelectItem value="9">সেপ্টেম্বর</SelectItem>
                      <SelectItem value="10">অক্টোবর</SelectItem>
                      <SelectItem value="11">নভেম্বর</SelectItem>
                      <SelectItem value="12">ডিসেম্বর</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>বছর</Label>
                  <Select value={dateFilter.year} onValueChange={(v) => setDateFilter({ ...dateFilter, year: v })}>
                    <SelectTrigger><SelectValue placeholder="বছর নির্বাচন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">২০২৫</SelectItem>
                      <SelectItem value="2024">২০২৪</SelectItem>
                      <SelectItem value="2023">২০২৩</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full bg-[#D4AF37] text-[#1B5E20]">
                    <Search className="mr-2" size={18} /> সার্চ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* খাত সার্চ */}
        <TabsContent value="category">
          <Card className="border-2 border-[#8B0000]">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="খাত নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donation">অনুদান</SelectItem>
                    <SelectItem value="monthly_subscription">মাসিক চাঁদা</SelectItem>
                    <SelectItem value="medical">চিকিৎসা</SelectItem>
                    <SelectItem value="winter_clothes">শীতবস্ত্র বিতরণ</SelectItem>
                    <SelectItem value="sports_equipment">ক্রীড়া উপকরণ</SelectItem>
                    <SelectItem value="educational_materials">শিক্ষা উপকরণ</SelectItem>
                    <SelectItem value="scholarship">শিক্ষাবৃত্তি</SelectItem>
                    <SelectItem value="relief">ত্রাণ বিতরণ</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} className="bg-[#8B0000]">
                  <Search className="mr-2" size={18} /> সার্চ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* সার্চ রেজাল্ট */}
      {hasSearched && (
        <div className="mt-8">
          {/* সারসংক্ষেপ */}
          {summary && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 border-[#1B5E20]">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-500">মোট আয়</p>
                  <p className="text-3xl font-bold text-[#1B5E20]">৳{toBanglaNumber(summary.totalIncome)}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#8B0000]">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-500">মোট ব্যয়</p>
                  <p className="text-3xl font-bold text-[#8B0000]">৳{toBanglaNumber(summary.totalExpense)}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#D4AF37]">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-500">মোট লেনদেন</p>
                  <p className="text-3xl font-bold text-[#D4AF37]">{toBanglaNumber(summary.count)} টি</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* চার্ট */}
          {searchResults.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* পাই চার্ট */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-[#1B5E20]">খাত অনুযায়ী বিতরণ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* বার চার্ট */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-[#1B5E20]">মাসিক আয়-ব্যয়</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="আয়" fill="#1B5E20" />
                      <Bar dataKey="ব্যয়" fill="#8B0000" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* রেজাল্ট টেবিল */}
          <Card>
            <CardContent className="pt-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>কোনো ফলাফল পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left">তারিখ</th>
                        <th className="px-4 py-3 text-left">ধরন</th>
                        <th className="px-4 py-3 text-left">নাম/খাত</th>
                        <th className="px-4 py-3 text-right">পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((r, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{formatBanglaDate(r.date)}</td>
                          <td className="px-4 py-3">
                            <Badge className={r.type === 'income' || r.type === 'receipt' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {r.type === 'income' || r.type === 'receipt' ? 'আয়' : 'ব্যয়'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{r.name || r.category || r.purpose}</td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: r.type === 'income' || r.type === 'receipt' ? '#1B5E20' : '#8B0000' }}>
                            ৳{toBanglaNumber(r.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}

// ============ SHARE SECTION (টেক্সট শেয়ার) ============
function ShareSection() {
  const { socialPosts, addSocialPost, deleteSocialPost, foundationInfo } = useStore();
  const { isAuthenticated, hasPermission } = useAuthStore();
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'announcement' | 'event' | 'achievement' | 'general'>('general');
  const [postAuthor, setPostAuthor] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewPost, setPreviewPost] = useState<any>(null);

  const canAdd = isAuthenticated && hasPermission('notice_general' as Permission);
  const canDelete = isAuthenticated && hasPermission('notice_delete' as Permission);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'announcement': return 'ঘোষণা';
      case 'event': return 'অনুষ্ঠান';
      case 'achievement': return 'অর্জন';
      default: return 'সাধারণ';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-blue-100 text-blue-700';
      case 'event': return 'bg-purple-100 text-purple-700';
      case 'achievement': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddPost = () => {
    if (postTitle && postContent) {
      addSocialPost({
        title: postTitle,
        content: postContent,
        category: postCategory,
        author: postAuthor || undefined,
        date: new Date().toISOString().split('T')[0],
      });
      setPostTitle('');
      setPostContent('');
      setPostAuthor('');
      setPostCategory('general');
    }
  };

  const handleShareWhatsApp = (post: any) => {
    const text = `*${foundationInfo.nameGreen} ${foundationInfo.nameRed}*

📰 ${post.title}

${post.content}

${post.author ? `✍️ ${post.author}` : ''}
📅 ${formatBanglaDate(post.date)}

---
${foundationInfo.address}
📞 ${foundationInfo.whatsapp}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = (post: any) => {
    const text = `${foundationInfo.nameGreen} ${foundationInfo.nameRed}\n\n📰 ${post.title}\n\n${post.content}\n\n${post.author ? `✍️ ${post.author}` : ''}\n📅 ${formatBanglaDate(post.date)}`;
    const url = window.location.origin;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePreview = (post: any) => {
    setPreviewPost(post);
    setShowPreview(true);
  };

  const generatePostPDF = (post: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${post.title} - আপন ফাউন্ডেশন</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Noto Sans Bengali', sans-serif; 
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            width: 300px;
            pointer-events: none;
            z-index: -1;
          }
          .bismillah { 
            text-align: center; 
            font-size: 28px; 
            margin-bottom: 15px; 
            direction: rtl; 
            font-family: 'Amiri', serif;
          }
          .header { 
            display: flex; 
            align-items: center; 
            gap: 20px; 
            border-bottom: 3px solid #1B5E20; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
          }
          .logo { width: 70px; height: 70px; object-fit: contain; }
          .org-name { font-size: 20px; font-weight: bold; }
          .gold { color: #D4AF37; }
          .red { color: #8B0000; }
          .address { font-size: 12px; color: #666; }
          .contact { font-size: 11px; color: #666; }
          .title { 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold; 
            color: #1B5E20; 
            margin: 20px 0;
          }
          .category-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #D4AF37;
            color: #1B5E20;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 15px;
          }
          .post-content {
            line-height: 1.8;
            text-align: justify;
            margin-bottom: 20px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 10px;
          }
          .post-meta {
            text-align: right;
            color: #666;
            font-size: 14px;
            margin-top: 20px;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 10px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
        
        <div class="bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
        
        <div class="header">
          <img src="${foundationInfo.logo}" class="logo" alt="Logo" onerror="this.style.display='none'">
          <div>
            <div class="org-name">
              <span class="gold">আপন</span>
              <span class="red"> ফাউন্ডেশন</span>
            </div>
            <div class="address">${foundationInfo.address}</div>
            <div class="contact">মোবাইল: ${foundationInfo.whatsapp} | ইমেইল: ${foundationInfo.email}</div>
          </div>
        </div>
        
        <div class="title">${post.title}</div>
        
        <div style="text-align: center;">
          <span class="category-badge">${getCategoryLabel(post.category)}</span>
        </div>
        
        <div class="post-content">
          ${post.content.replace(/\n/g, '<br>')}
        </div>
        
        <div class="post-meta">
          ${post.author ? `<p>✍️ লেখক: ${post.author}</p>` : ''}
          <p>📅 তারিখ: ${formatBanglaDate(post.date)}</p>
        </div>
        
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line">সভাপতি</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">সাধারণ সম্পাদক</div>
          </div>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#1B5E20] mb-8">📱 পোস্ট শেয়ার</h2>

      {/* ফটো কার্ড জেনারেটর - মূল ফিচার (সবার উপরে) */}
      <Card className="border-2 border-[#1B5E20] shadow-xl mb-8">
        <CardHeader className="bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] text-white">
          <CardTitle className="text-xl">
            🎴 সোশ্যাল মিডিয়া ফটো কার্ড তৈরি করুন
          </CardTitle>
          <p className="text-sm text-white/80 mt-1">
            ✨ আপনার টেক্সট লিখুন, অটোমেটিক্যালি সুন্দর ফটো কার্ড তৈরি হবে যা সোশ্যাল মিডিয়ায় পোস্ট করতে পারবেন!
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <QuickShareSection />
        </CardContent>
      </Card>

      {/* নতুন পোস্ট তৈরি */}
      {canAdd && (
        <Card className="border-2 border-[#1B5E20] mb-8">
          <CardHeader className="bg-[#1B5E20] text-white">
            <CardTitle>নতুন পোস্ট তৈরি করুন</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>শিরোনাম *</Label>
              <Input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="পোস্টের শিরোনাম লিখুন..."
              />
            </div>
            <div>
              <Label>বিষয়বস্তু *</Label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="আপনার পোস্টের বিষয়বস্তু লিখুন..."
                rows={6}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>ক্যাটেগরি</Label>
                <Select value={postCategory} onValueChange={(v) => setPostCategory(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">সাধারণ</SelectItem>
                    <SelectItem value="announcement">ঘোষণা</SelectItem>
                    <SelectItem value="event">অনুষ্ঠান</SelectItem>
                    <SelectItem value="achievement">অর্জন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>লেখক (ঐচ্ছিক)</Label>
                <Input
                  value={postAuthor}
                  onChange={(e) => setPostAuthor(e.target.value)}
                  placeholder="লেখকের নাম..."
                />
              </div>
            </div>
            <Button onClick={handleAddPost} className="w-full bg-[#1B5E20]">
              <Plus className="mr-2" size={18} /> পোস্ট সংরক্ষণ করুন
            </Button>
          </CardContent>
        </Card>
      )}

      {/* পোস্ট তালিকা */}
      {socialPosts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Share2 size={48} className="mx-auto mb-2 text-gray-300" />
            <p>কোনো পোস্ট নেই</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {socialPosts.slice().reverse().map((post) => (
            <Card key={post.id} className="border-l-4 border-l-[#D4AF37]">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className={getCategoryColor(post.category)}>
                      {getCategoryLabel(post.category)}
                    </Badge>
                    <h3 className="text-xl font-bold text-[#1B5E20] mt-2">{post.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{formatBanglaDate(post.date)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>
                {post.author && (
                  <p className="text-sm text-gray-500 mb-4">✍️ {post.author}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleShareWhatsApp(post)} className="text-green-600">
                    <MessageCircle size={14} className="mr-1" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleShareFacebook(post)} className="text-blue-600">
                    <Facebook size={14} className="mr-1" /> Facebook
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePreview(post)}>
                    <Eye size={14} className="mr-1" /> প্রিভিউ
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => generatePostPDF(post)}>
                    <Printer size={14} className="mr-1" /> প্রিন্ট
                  </Button>
                  {canDelete && (
                    <Button size="sm" variant="destructive" onClick={() => deleteSocialPost(post.id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* প্রিভিউ ডায়লগ */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">পোস্ট প্রিভিউ</DialogTitle>
          </DialogHeader>
          {previewPost && (
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="text-center mb-4">
                <Badge className={getCategoryColor(previewPost.category)}>
                  {getCategoryLabel(previewPost.category)}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#1B5E20] text-center mb-4">{previewPost.title}</h3>
              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="whitespace-pre-wrap">{previewPost.content}</p>
              </div>
              <div className="text-sm text-gray-500 text-right">
                {previewPost.author && <p>✍️ {previewPost.author}</p>}
                <p>📅 {formatBanglaDate(previewPost.date)}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleShareWhatsApp(previewPost)} className="flex-1 bg-green-600">
                  <MessageCircle size={16} className="mr-2" /> WhatsApp এ শেয়ার
                </Button>
                <Button onClick={() => handleShareFacebook(previewPost)} className="flex-1 bg-blue-600">
                  <Facebook size={16} className="mr-2" /> Facebook এ শেয়ার
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// দ্রুত শেয়ার কম্পোনেন্ট - ফটো কার্ড জেনারেটর সহ
function QuickShareSection() {
  const { foundationInfo } = useStore();
  const [quickText, setQuickText] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardSubtitle, setCardSubtitle] = useState('');
  const [cardTemplate, setCardTemplate] = useState<'notice' | 'event' | 'congrats' | 'invitation' | 'general'>('general');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const templates = {
    notice: { name: '📢 নোটিশ', bgColor: '#1B5E20', accentColor: '#D4AF37', icon: '📢' },
    event: { name: '🎉 অনুষ্ঠান', bgColor: '#7B1FA2', accentColor: '#E1BEE7', icon: '🎉' },
    congrats: { name: '🎊 অভিনন্দন', bgColor: '#F57C00', accentColor: '#FFE0B2', icon: '🎊' },
    invitation: { name: '📨 নিমন্ত্রণ', bgColor: '#0288D1', accentColor: '#B3E5FC', icon: '📨' },
    general: { name: '📝 সাধারণ', bgColor: '#1B5E20', accentColor: '#D4AF37', icon: '📝' },
  };

  // কার্ড জেনারেট করার ফাংশন
  const generateCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const template = templates[cardTemplate];
    const width = 1080;
    const height = 1080;

    canvas.width = width;
    canvas.height = height;

    // ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, template.bgColor);
    gradient.addColorStop(1, shadeColor(template.bgColor, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ডেকোরেটিভ প্যাটার্ন
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 100 + 20,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = template.accentColor;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // টপ বর্ডার
    ctx.fillStyle = template.accentColor;
    ctx.fillRect(0, 0, width, 15);

    // লোগো এরিয়া (সার্কেল)
    const logoSize = 160;
    const logoX = width / 2;
    const logoY = 140;

    ctx.beginPath();
    ctx.arc(logoX, logoY, logoSize / 2 + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // লোগো লোড করা
    try {
      const logoImg = new window.Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, logoX - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
          ctx.restore();
          resolve();
        };
        logoImg.onerror = () => resolve();
        logoImg.src = foundationInfo.logo;
      });
    } catch (e) {
      // লোগো লোড না হলে ফাঁকা রাখবে
    }

    // প্রতিষ্ঠানের নাম
    ctx.textAlign = 'center';
    ctx.font = 'bold 52px Noto Sans Bengali, sans-serif';
    
    // পূরো নামের মেজারমেন্ট
    const fullName = 'আপন ফাউন্ডেশন';
    const nameWidth = ctx.measureText(fullName).width;
    const startX = logoX - nameWidth / 2;
    
    // "আপন" অংশ
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText('আপন', startX, 260);
    
    // "ফাউন্ডেশন" অংশ
    const uponWidth = ctx.measureText('আপন ').width;
    ctx.fillStyle = '#FFB6C1';
    ctx.fillText('ফাউন্ডেশন', startX + uponWidth, 260);

    // স্লোগান
    ctx.textAlign = 'center';
    ctx.font = '28px Noto Sans Bengali, sans-serif';
    ctx.fillStyle = template.accentColor;
    ctx.fillText('মানব সেবায় আমরা', logoX, 305);

    // বিভাজক লাইন
    ctx.beginPath();
    ctx.moveTo(100, 340);
    ctx.lineTo(width - 100, 340);
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // টেমপ্লেট আইকন ও টাইটেল
    ctx.font = '36px Noto Sans Bengali, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${template.icon} ${cardTitle || templates[cardTemplate].name}`, logoX, 410);

    // সাবটাইটেল (যদি থাকে)
    if (cardSubtitle) {
      ctx.font = '28px Noto Sans Bengali, sans-serif';
      ctx.fillStyle = template.accentColor;
      ctx.fillText(cardSubtitle, logoX, 460);
    }

    // মূল টেক্সট এরিয়া
    const textStartY = cardSubtitle ? 520 : 480;
    const maxWidth = width - 160;
    const lineHeight = 45;
    
    ctx.font = '32px Noto Sans Bengali, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    // টেক্সট র‍্যাপ করা
    const lines = wrapText(ctx, quickText, maxWidth);
    lines.forEach((line, index) => {
      ctx.fillText(line, logoX, textStartY + index * lineHeight);
    });

    // তারিখ ও ঠিকানা
    const footerY = height - 150;
    ctx.font = '24px Noto Sans Bengali, sans-serif';
    ctx.fillStyle = template.accentColor;
    
    const today = new Date();
    const banglaDate = `${toBanglaNumber(today.getDate())}/${toBanglaNumber(today.getMonth() + 1)}/${toBanglaNumber(today.getFullYear())}`;
    ctx.fillText(`📅 ${banglaDate}`, logoX, footerY);

    ctx.font = '22px Noto Sans Bengali, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(foundationInfo.address, logoX, footerY + 40);

    ctx.font = '20px Noto Sans Bengali, sans-serif';
    ctx.fillText(`📞 ${foundationInfo.whatsapp}`, logoX, footerY + 75);

    // বটম বর্ডার
    ctx.fillStyle = template.accentColor;
    ctx.fillRect(0, height - 15, width, 15);

    // ইমেজ সেট করা
    setGeneratedImage(canvas.toDataURL('image/png'));
    setShowCardPreview(true);
  };

  // টেক্সট র‍্যাপ হেল্পার ফাংশন
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 10); // সর্বোচ্চ ১০ লাইন
  };

  // কালার শেড হেল্পার
  const shadeColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  // ডাউনলোড ফাংশন
  const downloadCard = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `apon-foundation-post-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  // WhatsApp এ শেয়ার
  const shareToWhatsApp = () => {
    if (!generatedImage) return;
    downloadCard();
    const text = `*${foundationInfo.nameGreen} ${foundationInfo.nameRed}*

${cardTitle || 'পোস্ট'}${cardSubtitle ? ` - ${cardSubtitle}` : ''}

${quickText}

---
${foundationInfo.address}
📞 ${foundationInfo.whatsapp}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Facebook এ শেয়ার
  const shareToFacebook = () => {
    if (!generatedImage) return;
    downloadCard();
    const text = `${foundationInfo.nameGreen} ${foundationInfo.nameRed}\n\n${cardTitle || ''}\n${quickText}`;
    const url = window.location.origin;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* হিডেন ক্যানভাস */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* টেমপ্লেট সিলেকশন */}
      <div>
        <Label className="text-base font-semibold mb-3 block">🎨 টেমপ্লেট নির্বাচন করুন</Label>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(templates).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setCardTemplate(key as any)}
              className={`p-3 rounded-lg border-2 transition-all ${
                cardTemplate === key
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-gray-200 hover:border-[#1B5E20]'
              }`}
            >
              <div className="text-2xl mb-1">{value.icon}</div>
              <div className="text-xs">{value.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* শিরোনাম */}
      <div>
        <Label>📰 শিরোনাম</Label>
        <Input
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          placeholder="যেমন: গুরুত্বপূর্ণ ঘোষণা, বার্ষিক সাধারণ সভা..."
        />
      </div>

      {/* সাবটাইটেল */}
      <div>
        <Label>📋 উপশিরোনাম (ঐচ্ছিক)</Label>
        <Input
          value={cardSubtitle}
          onChange={(e) => setCardSubtitle(e.target.value)}
          placeholder="যেমন: তারিখ, স্থান..."
        />
      </div>

      {/* মূল টেক্সট */}
      <div>
        <Label>✍️ বিস্তারিত লিখুন</Label>
        <Textarea
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder="আপনার পোস্টের বিষয়বস্তু লিখুন... যেমন: ঘোষণা, নিমন্ত্রণ, অভিনন্দন ইত্যাদি"
          rows={6}
        />
      </div>

      {/* কার্ড জেনারেট বাটন */}
      <Button 
        onClick={generateCard} 
        className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] hover:from-[#2e7d32] hover:to-[#1B5E20] py-6 text-lg"
        disabled={!quickText.trim()}
      >
        <ImageIcon size={24} className="mr-2" />
        🎴 ফটো কার্ড তৈরি করুন
      </Button>

      {/* প্রিভিউ ডায়ালগ */}
      <Dialog open={showCardPreview} onOpenChange={setShowCardPreview}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20] text-xl">🎴 আপনার ফটো কার্ড প্রস্তুত!</DialogTitle>
          </DialogHeader>
          
          {generatedImage && (
            <div className="space-y-4">
              {/* প্রিভিউ ইমেজ */}
              <div className="border-4 border-[#D4AF37] rounded-lg overflow-hidden shadow-xl">
                <img 
                  src={generatedImage} 
                  alt="Generated Card" 
                  className="w-full h-auto"
                />
              </div>

              {/* একশন বাটন */}
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={downloadCard} className="bg-[#1B5E20] hover:bg-[#2e7d32] py-4">
                  <Download size={20} className="mr-2" />
                  ডাউনলোড
                </Button>
                <Button onClick={shareToWhatsApp} className="bg-green-600 hover:bg-green-700 py-4">
                  <MessageCircle size={20} className="mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={shareToFacebook} className="bg-blue-600 hover:bg-blue-700 py-4">
                  <Facebook size={20} className="mr-2" />
                  Facebook
                </Button>
              </div>

              {/* টিপস */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  💡 <strong>টিপস:</strong> ফটো কার্ডটি ডাউনলোড করে সরাসরি সোশ্যাল মিডিয়ায় আপলোড করতে পারবেন। WhatsApp বা Facebook বাটনে ক্লিক করলে অটোমেটিক্যালি ডাউনলোড হবে এবং শেয়ার উইন্ডো খুলবে।
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ FOOTER COMPONENT ============
function Footer() {
  const { foundationInfo, socialLinks } = useStore();

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook size={24} />;
      case 'instagram': return <Instagram size={24} />;
      case 'whatsapp': return <MessageCircle size={24} />;
      case 'tiktok': return <Music size={24} />;
      case 'youtube': return <Youtube size={24} />;
      default: return <Share2 size={24} />;
    }
  };

  return (
    <footer className="bg-[#1B5E20] text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full p-2">
              <img 
                src={foundationInfo.logo} 
                alt="লোগো" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold">
            <span className="text-[#FFD700] drop-shadow-lg">আপন</span>
            <span className="text-[#FFB6C1]"> ফাউন্ডেশন</span>
          </h3>
          <p className="text-[#D4AF37] mt-2">মানব সেবায় আমরা</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          <div>
            <h4 className="font-bold text-lg mb-3">ঠিকানা</h4>
            <p className="text-white/80">{foundationInfo.address}</p>
            <p className="text-white/80 mt-2">প্রতিষ্ঠা: {foundationInfo.established}</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">যোগাযোগ</h4>
            <p className="text-white/80">📧 {foundationInfo.email}</p>
            <p className="text-white/80">📱 {foundationInfo.whatsapp}</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">সোশ্যাল মিডিয়া</h4>
            <div className="flex justify-center md:justify-start gap-3">
              {socialLinks.filter(s => s.isVisible).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-white/20" />

        <div className="text-center text-white/60 text-sm">
          <p>© {toBanglaNumber(new Date().getFullYear())} আপন ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
