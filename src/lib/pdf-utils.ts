'use client';

import jsPDF from 'jspdf';
import { FoundationInfo, Receipt, Voucher, Transaction, Notice, Constitution } from './types';
import { toBanglaNumber, formatBanglaDate, numberToBanglaWords, incomeCategoriesBn, expenseCategoriesBn } from './store';

// PDF কনফিগারেশন
export const PDF_CONFIG = {
  // A4 সাইজ (mm)
  A4_WIDTH: 210,
  A4_HEIGHT: 297,
  
  // মার্জিন
  MARGIN_TOP: 20,
  MARGIN_BOTTOM: 20,
  MARGIN_LEFT: 20,
  MARGIN_RIGHT: 20,
  
  // রঙ
  COLORS: {
    GREEN: '#1B5E20',
    RED: '#8B0000',
    GOLD: '#D4AF37',
    BLACK: '#000000',
    GRAY: '#666666',
  },
  
  // ফন্ট সাইজ
  FONT_SIZE: {
    TITLE: 24,
    HEADER: 16,
    SUBHEADER: 14,
    BODY: 12,
    SMALL: 10,
  }
};

// বিসমিল্লাহ আরবি টেক্সট
const BISMILLAH = 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ';

// পিক্সেল থেকে mm রূপান্তর
export const pxToMm = (px: number): number => px * 0.264583;

// mm থেকে পিক্সেল রূপান্তর
export const mmToPx = (mm: number): number => mm * 3.779528;

// ইমেজ লোড করার ফাংশন
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// ============ কমন হেডার HTML ============
const generateCommonHeader = (foundationInfo: FoundationInfo): string => `
  <div class="bismillah">${BISMILLAH}</div>
  
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
`;

// ============ কমন CSS স্টাইল ============
const getCommonStyles = (): string => `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Amiri:wght@400;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body { 
    font-family: 'Noto Sans Bengali', sans-serif; 
    padding: 40px;
    position: relative;
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
  
  .logo { 
    width: 70px; 
    height: 70px; 
    object-fit: contain; 
  }
  
  .org-name { 
    font-size: 20px; 
    font-weight: bold; 
  }
  
  .gold { color: #D4AF37; }
  .red { color: #8B0000; }
  .green { color: #1B5E20; }
  
  .address { 
    font-size: 12px; 
    color: #666; 
  }
  
  .contact {
    font-size: 11px;
    color: #666;
  }
  
  .title { 
    text-align: center; 
    font-size: 24px; 
    font-weight: bold; 
    color: #1B5E20; 
    margin: 20px 0;
    text-decoration: underline;
  }
  
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 60px;
  }
  
  .signature-box {
    text-align: center;
    width: 150px;
  }
  
  .signature-line {
    border-top: 1px solid #333;
    margin-top: 40px;
    padding-top: 5px;
    font-size: 12px;
  }
  
  .signature-name {
    font-size: 11px;
    color: #666;
    margin-top: 3px;
  }
  
  @media print {
    body { padding: 20px; }
  }
`;

// ============ অনুদান রিসিট PDF ============
export const generateDonationReceiptPDF = async (receipt: Receipt, foundationInfo: FoundationInfo) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>অনুদান রিসিট - ${receipt.receiptNo || 'Auto'}</title>
      <style>
        ${getCommonStyles()}
        
        body { 
          padding: 30px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .receipt-container {
          border: 3px double #1B5E20;
          padding: 20px;
          position: relative;
        }
        
        .title { 
          text-align: center; 
          font-size: 22px; 
          font-weight: bold; 
          color: #1B5E20; 
          margin: 10px 0 15px;
          border: 2px solid #D4AF37;
          padding: 5px;
        }
        
        .info-row { 
          display: flex; 
          margin: 8px 0;
          font-size: 13px;
        }
        
        .label { 
          width: 120px; 
          font-weight: 600;
          color: #1B5E20;
        }
        
        .value { flex: 1; }
        
        .divider {
          border-bottom: 1px dashed #999;
          margin: 10px 0;
        }
        
        .amount-box {
          border: 3px solid #D4AF37;
          padding: 15px;
          text-align: center;
          margin: 15px 0;
          background: linear-gradient(to right, #fff9e6, #fff, #fff9e6);
        }
        
        .amount { 
          font-size: 32px; 
          font-weight: bold; 
          color: #1B5E20;
        }
        
        .amount-words {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        
        .signature-box {
          text-align: center;
          width: 180px;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 30px;
          padding-top: 5px;
          font-size: 12px;
        }
        
        .footer {
          text-align: center;
          font-size: 10px;
          color: #999;
          margin-top: 15px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.05;
          width: 200px;
          pointer-events: none;
        }
        
        @media print {
          body { padding: 0; }
          .receipt-container { border: 3px double #1B5E20; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
        
        <div class="bismillah">${BISMILLAH}</div>
        
        <div class="header">
          <img src="${foundationInfo.logo}" class="logo" alt="Logo" onerror="this.style.display='none'">
          <div>
            <div class="org-name">
              <span class="gold">আপন</span>
              <span class="red"> ফাউন্ডেশন</span>
            </div>
            <div class="address">${foundationInfo.address}</div>
            <div class="contact">মোবাইল: ${foundationInfo.whatsapp}</div>
          </div>
        </div>
        
        <div class="title">অনুদান রিসিট</div>
        
        <div class="info-row">
          <span class="label">রিসিট নম্বর:</span>
          <span class="value">${receipt.receiptNo || 'স্বয়ংক্রিয়'}</span>
        </div>
        <div class="info-row">
          <span class="label">তারিখ:</span>
          <span class="value">${formatBanglaDate(receipt.date)}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row">
          <span class="label">দাতার নাম:</span>
          <span class="value">${receipt.payerName}</span>
        </div>
        <div class="info-row">
          <span class="label">ঠিকানা:</span>
          <span class="value">${receipt.payerAddress || '-'}</span>
        </div>
        <div class="info-row">
          <span class="label">মোবাইল:</span>
          <span class="value">${receipt.payerMobile || '-'}</span>
        </div>
        <div class="info-row">
          <span class="label">উদ্দেশ্য:</span>
          <span class="value">${receipt.purpose || receipt.type === 'donation' ? 'অনুদান' : 'চাঁদা'}</span>
        </div>
        
        <div class="amount-box">
          <div class="amount">৳ ${toBanglaNumber(receipt.amount)}</div>
          <div class="amount-words">${receipt.amountInWords || numberToBanglaWords(receipt.amount)}</div>
        </div>
        
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line">প্রাপক</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">অর্থ সম্পাদক</div>
          </div>
        </div>
        
        <div class="footer">
          ${foundationInfo.email} | ${foundationInfo.whatsapp}
        </div>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// ============ খরচের ভাউচার PDF ============
export const generateExpenseVoucherPDF = async (voucher: Voucher, foundationInfo: FoundationInfo) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>খরচের ভাউচার - ${voucher.voucherNo || 'Auto'}</title>
      <style>
        ${getCommonStyles()}
        
        body { 
          padding: 30px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .voucher-container {
          border: 3px double #8B0000;
          padding: 20px;
          position: relative;
        }
        
        .title { 
          text-align: center; 
          font-size: 22px; 
          font-weight: bold; 
          color: #8B0000; 
          margin: 10px 0 15px;
          border: 2px solid #D4AF37;
          padding: 5px;
        }
        
        .info-row { 
          display: flex; 
          margin: 8px 0;
          font-size: 13px;
        }
        
        .label { 
          width: 120px; 
          font-weight: 600;
          color: #8B0000;
        }
        
        .value { flex: 1; }
        
        .divider {
          border-bottom: 1px dashed #999;
          margin: 10px 0;
        }
        
        .amount-box {
          border: 3px solid #8B0000;
          padding: 15px;
          text-align: center;
          margin: 15px 0;
          background: linear-gradient(to right, #fff0f0, #fff, #fff0f0);
        }
        
        .amount { 
          font-size: 32px; 
          font-weight: bold; 
          color: #8B0000;
        }
        
        .amount-words {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        
        .signature-box {
          text-align: center;
          width: 140px;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 30px;
          padding-top: 5px;
          font-size: 11px;
        }
        
        .footer {
          text-align: center;
          font-size: 10px;
          color: #999;
          margin-top: 15px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.05;
          width: 200px;
          pointer-events: none;
        }
        
        @media print {
          body { padding: 0; }
          .voucher-container { border: 3px double #8B0000; }
        }
      </style>
    </head>
    <body>
      <div class="voucher-container">
        <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
        
        <div class="bismillah">${BISMILLAH}</div>
        
        <div class="header">
          <img src="${foundationInfo.logo}" class="logo" alt="Logo" onerror="this.style.display='none'">
          <div>
            <div class="org-name">
              <span class="gold">আপন</span>
              <span class="red"> ফাউন্ডেশন</span>
            </div>
            <div class="address">${foundationInfo.address}</div>
            <div class="contact">মোবাইল: ${foundationInfo.whatsapp}</div>
          </div>
        </div>
        
        <div class="title">খরচের ভাউচার</div>
        
        <div class="info-row">
          <span class="label">ভাউচার নম্বর:</span>
          <span class="value">${voucher.voucherNo || 'স্বয়ংক্রিয়'}</span>
        </div>
        <div class="info-row">
          <span class="label">তারিখ:</span>
          <span class="value">${formatBanglaDate(voucher.date)}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row">
          <span class="label">প্রাপকের নাম:</span>
          <span class="value">${voucher.recipientName}</span>
        </div>
        <div class="info-row">
          <span class="label">ঠিকানা:</span>
          <span class="value">${voucher.recipientAddress || '-'}</span>
        </div>
        <div class="info-row">
          <span class="label">মোবাইল:</span>
          <span class="value">${voucher.recipientMobile || '-'}</span>
        </div>
        <div class="info-row">
          <span class="label">খরচের বিবরণ:</span>
          <span class="value">${voucher.purpose || '-'}</span>
        </div>
        
        <div class="amount-box">
          <div class="amount">৳ ${toBanglaNumber(voucher.amount)}</div>
          <div class="amount-words">${voucher.amountInWords || numberToBanglaWords(voucher.amount)}</div>
        </div>
        
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line">প্রস্তুতকারক</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">অনুমোদনকারী</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">প্রাপক</div>
          </div>
        </div>
        
        <div class="footer">
          ${foundationInfo.email} | ${foundationInfo.whatsapp}
        </div>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// ============ আয়-ব্যয় রিপোর্ট PDF ============
export const generateIncomeExpenseReportPDF = async (
  transactions: Transaction[],
  foundationInfo: FoundationInfo,
  fromDate?: string,
  toDate?: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // ফিল্টার করা লেনদেন
  const filteredTransactions = transactions.filter(t => {
    if (fromDate && new Date(t.date) < new Date(fromDate)) return false;
    if (toDate && new Date(t.date) > new Date(toDate)) return false;
    return true;
  });

  // আয়ের হিসাব
  const incomes = filteredTransactions.filter(t => t.type === 'income');
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  // ব্যয়ের হিসাব
  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // ব্যালেন্স
  const balance = totalIncome - totalExpense;

  // আয়ের খাত অনুযায়ী গ্রুপ
  const incomeByCategory = incomes.reduce((acc, t) => {
    const cat = t.categoryLabel || incomeCategoriesBn[t.category] || t.category;
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // ব্যয়ের খাত অনুযায়ী গ্রুপ
  const expenseByCategory = expenses.reduce((acc, t) => {
    const cat = t.categoryLabel || expenseCategoriesBn[t.category] || t.category;
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>আয়-ব্যয় রিপোর্ট - আপন ফাউন্ডেশন</title>
      <style>
        ${getCommonStyles()}
        
        body { 
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .period {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        
        th {
          background-color: #1B5E20;
          color: white;
          font-weight: 600;
        }
        
        .income-table th {
          background-color: #1B5E20;
        }
        
        .expense-table th {
          background-color: #8B0000;
        }
        
        .text-right { text-align: right; }
        
        .total-row {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        
        .summary-box {
          border: 3px solid #D4AF37;
          padding: 20px;
          margin: 20px 0;
          background: linear-gradient(to right, #fff9e6, #fff, #fff9e6);
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
          border-bottom: 1px solid #eee;
        }
        
        .summary-row:last-child {
          border-bottom: none;
        }
        
        .balance {
          font-size: 20px;
          font-weight: bold;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
        }
        
        .signature-box {
          text-align: center;
          width: 150px;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
          padding-top: 5px;
          font-size: 12px;
        }
        
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
      
      ${generateCommonHeader(foundationInfo)}
      
      <div class="title">আয়-ব্যয় রিপোর্ট</div>
      
      <div class="period">
        সময়কাল: ${fromDate ? formatBanglaDate(fromDate) : 'শুরু থেকে'} হতে ${toDate ? formatBanglaDate(toDate) : 'এখন পর্যন্ত'}
      </div>
      
      <!-- আয়ের টেবিল -->
      <h3 class="green" style="margin: 20px 0 10px;">আয়ের বিবরণ</h3>
      <table class="income-table">
        <thead>
          <tr>
            <th>ক্রমিক</th>
            <th>আয়ের খাত</th>
            <th class="text-right">পরিমাণ (টাকা)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(incomeByCategory).map(([cat, amount], i) => `
            <tr>
              <td>${toBanglaNumber(i + 1)}</td>
              <td>${cat}</td>
              <td class="text-right">${toBanglaNumber(amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">মোট আয়</td>
            <td class="text-right">${toBanglaNumber(totalIncome)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- ব্যয়ের টেবিল -->
      <h3 style="color: #8B0000; margin: 20px 0 10px;">ব্যয়ের বিবরণ</h3>
      <table class="expense-table">
        <thead>
          <tr>
            <th>ক্রমিক</th>
            <th>ব্যয়ের খাত</th>
            <th class="text-right">পরিমাণ (টাকা)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(expenseByCategory).map(([cat, amount], i) => `
            <tr>
              <td>${toBanglaNumber(i + 1)}</td>
              <td>${cat}</td>
              <td class="text-right">${toBanglaNumber(amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">মোট ব্যয়</td>
            <td class="text-right">${toBanglaNumber(totalExpense)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- সারসংক্ষেপ -->
      <div class="summary-box">
        <div class="summary-row">
          <span>মোট আয়:</span>
          <span class="green">৳ ${toBanglaNumber(totalIncome)}</span>
        </div>
        <div class="summary-row">
          <span>মোট ব্যয়:</span>
          <span style="color: #8B0000;">৳ ${toBanglaNumber(totalExpense)}</span>
        </div>
        <div class="summary-row balance">
          <span>বর্তমান ব্যালেন্স:</span>
          <span style="color: ${balance >= 0 ? '#1B5E20' : '#8B0000'};">৳ ${toBanglaNumber(balance)}</span>
        </div>
      </div>
      
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line">অর্থ সম্পাদক</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">সাধারণ সম্পাদক</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">সভাপতি</div>
        </div>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// ============ সাধারণ প্যাড PDF ============
export const generateGeneralPadPDF = async (foundationInfo: FoundationInfo, content?: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>সাধারণ প্যাড - আপন ফাউন্ডেশন</title>
      <style>
        ${getCommonStyles()}
        
        body { 
          padding: 40px;
          min-height: 100vh;
        }
        
        .content {
          min-height: 600px;
          line-height: 1.8;
        }
        
        .signatures {
          margin-top: 80px;
        }
        
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
      
      ${generateCommonHeader(foundationInfo)}
      
      <div class="content">
        ${content || ''}
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
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// ============ নোটিশ PDF ============
export const generateNoticeDocumentPDF = async (notice: Notice, foundationInfo: FoundationInfo) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>নোটিশ - ${notice.referenceNumber}</title>
      <style>
        ${getCommonStyles()}
        
        body { 
          padding: 60px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .title { 
          text-align: center; 
          font-size: 32px; 
          font-weight: bold; 
          color: #1B5E20; 
          text-decoration: underline; 
          margin: 30px 0;
        }
        
        .notice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .subject {
          font-size: 18px;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-left: 4px solid #1B5E20;
        }
        
        .content {
          text-align: justify;
          line-height: 1.8;
          margin-bottom: 30px;
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
          body { padding: 40px; }
        }
      </style>
    </head>
    <body>
      <img src="${foundationInfo.logo}" class="watermark" alt="Watermark" onerror="this.style.display='none'">
      
      ${generateCommonHeader(foundationInfo)}
      
      <div class="title">নোটিশ</div>
      
      <div class="notice-info">
        <div><strong>রেফারেন্স:</strong> ${notice.referenceNumber}</div>
        <div><strong>তারিখ:</strong> ${formatBanglaDate(notice.date)}</div>
      </div>
      
      <div class="subject">
        <strong>বিষয়:</strong> ${notice.subject}
      </div>
      
      <div class="content">
        ${notice.content.replace(/\n/g, '<br>')}
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
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// ============ সোশ্যাল মিডিয়া শেয়ার ============
export const shareViaWhatsApp = (text: string, url?: string) => {
  const fullText = url ? `${text}\n\n${url}` : text;
  window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
};

export const shareViaFacebook = (url: string) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};

// রিসিট শেয়ার টেক্সট
export const generateReceiptShareText = (receipt: Receipt): string => {
  return `*আপন ফাউন্ডেশন - অনুদান রিসিট*

রিসিট নম্বর: ${receipt.receiptNo || 'স্বয়ংক্রিয়'}
তারিখ: ${formatBanglaDate(receipt.date)}
দাতার নাম: ${receipt.payerName}
পরিমাণ: ৳${toBanglaNumber(receipt.amount)} (${receipt.amountInWords || numberToBanglaWords(receipt.amount)})
উদ্দেশ্য: ${receipt.purpose || 'অনুদান'}

আপন ফাউন্ডেশন
${formatBanglaDate(new Date().toISOString())}`;
};

// ভাউচার শেয়ার টেক্সট
export const generateVoucherShareText = (voucher: Voucher): string => {
  return `*আপন ফাউন্ডেশন - খরচের ভাউচার*

ভাউচার নম্বর: ${voucher.voucherNo || 'স্বয়ংক্রিয়'}
তারিখ: ${formatBanglaDate(voucher.date)}
প্রাপকের নাম: ${voucher.recipientName}
পরিমাণ: ৳${toBanglaNumber(voucher.amount)}
খরচের বিবরণ: ${voucher.purpose}

আপন ফাউন্ডেশন`;
};

// ডকুমেন্ট হেডার তৈরি (প্রিন্ট উইন্ডোর জন্য)
export const generateDocumentHeader = (foundationInfo: FoundationInfo, title?: string): string => {
  return `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1B5E20; padding-bottom: 15px;">
      <div style="font-size: 28px; margin-bottom: 15px; direction: rtl; font-family: 'Amiri', 'Noto Sans Arabic', serif;">${BISMILLAH}</div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
        <img src="${foundationInfo.logo}" style="width: 70px; height: 70px; object-fit: contain;" onerror="this.style.display='none'">
        <div style="text-align: left;">
          <div style="font-size: 22px; font-weight: bold;">
            <span style="color: #D4AF37;">আপন</span>
            <span style="color: #8B0000;"> ফাউন্ডেশন</span>
          </div>
          <div style="font-size: 12px; color: #666;">${foundationInfo.address}</div>
          <div style="font-size: 11px; color: #666;">মোবাইল: ${foundationInfo.whatsapp} | ইমেইল: ${foundationInfo.email}</div>
        </div>
      </div>
      ${title ? `<div style="font-size: 20px; font-weight: bold; color: #1B5E20; margin-top: 15px; text-decoration: underline;">${title}</div>` : ''}
    </div>
  `;
};

// ওয়াটারমার্ক
export const generateWatermark = (logoUrl: string): string => {
  return `<img src="${logoUrl}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 300px; pointer-events: none;" onerror="this.style.display='none'">`;
};

// স্বাক্ষর বক্স
export const generateSignatureBoxes = (leftTitle: string = 'সভাপতি', rightTitle: string = 'সাধারণ সম্পাদক'): string => {
  return `
    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="text-align: center; width: 200px;">
        <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 10px;">${leftTitle}</div>
      </div>
      <div style="text-align: center; width: 200px;">
        <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 10px;">${rightTitle}</div>
      </div>
    </div>
  `;
};
