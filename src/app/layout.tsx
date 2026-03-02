import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "আপন ফাউন্ডেশন - মানব সেবায় আমরা",
  description: "আপন ফাউন্ডেশন - বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ। মানব সেবায় নিবেদিত একটি অলাভজনক প্রতিষ্ঠান।",
  keywords: ["আপন ফাউন্ডেশন", "Apon Foundation", "বালিগাঁও", "কিশোরগঞ্জ", "অলাভজনক", "মানব সেবা", "দাতব্য সংস্থা"],
  authors: [{ name: "আপন ফাউন্ডেশন" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "আপন ফাউন্ডেশন",
    description: "মানব সেবায় আমরা - বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ",
    url: "https://aponfoundation.org",
    siteName: "আপন ফাউন্ডেশন",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
