import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const IMAGES_FILE = path.join(DATA_DIR, 'images.json');

export interface StoredImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  createdAt: string;
}

// ডিরেক্টরি নিশ্চিত করা
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// সব ইমেজ পড়া
export function getAllImages(): StoredImage[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(IMAGES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(IMAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// ইমেজ সেভ করা
export function saveImage(image: StoredImage): void {
  try {
    ensureDataDir();
    const images = getAllImages();
    const existingIndex = images.findIndex(img => img.id === image.id);
    
    if (existingIndex >= 0) {
      images[existingIndex] = image;
    } else {
      images.push(image);
    }
    
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
  } catch (error) {
    console.error('Error saving image:', error);
  }
}

// ইমেজ ডিলিট করা
export function deleteImage(id: string): void {
  try {
    ensureDataDir();
    const images = getAllImages();
    const filtered = images.filter(img => img.id !== id);
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(filtered, null, 2));
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// নির্দিষ্ট ইমেজ পড়া
export function getImage(id: string): StoredImage | null {
  const images = getAllImages();
  return images.find(img => img.id === id) || null;
}
