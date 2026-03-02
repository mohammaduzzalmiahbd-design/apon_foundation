'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Use queueMicrotask to defer setState outside of the effect
        queueMicrotask(() => {
          setStoredValue(JSON.parse(item));
        });
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    queueMicrotask(() => {
      setIsLoading(false);
    });
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading];
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format date to Bengali
export function formatDateBangla(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const day = convertToBanglaNumber(d.getDate());
  const month = months[d.getMonth()];
  const year = convertToBanglaNumber(d.getFullYear());
  
  return `${day} ${month}, ${year}`;
}

// Convert number to Bengali
export function convertToBanglaNumber(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)]);
}

// Convert Bengali number to English
export function convertToEnglishNumber(str: string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)));
}

// Format currency
export function formatCurrency(amount: number): string {
  return `৳${convertToBanglaNumber(amount.toFixed(2))}`;
}
