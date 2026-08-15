/**
 * Utility to convert Google Drive share links, file IDs, or raw URLs
 * into reliable direct image URLs via the backend image proxy service.
 */

/**
 * Direct Google Drive links provided for Pangilatan & Random Memories.
 * Works seamlessly in client-side static deployments (e.g. Vercel) and local environments.
 */

export const PANGILATAN_DIRECT_LINKS = [
  'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
  'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
  'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
  'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
];

export const PANGILATAN_DIRECT_FILE_IDS = [
  '10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_',
  '1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB',
  '1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz',
  '16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ',
];

export const PANGILATAN_FOLDER_ID = '1Qn4bXppLRV_u8HymuBJZh6zzseKm6GdT';
export const RANDOM_MEMORIES_FOLDER_ID = '1bmxqSuz-w8dmYPBi0SARQcG7pO7g2b5r';

export const PANGILATAN_FOLDER_URL =
  'https://drive.google.com/drive/folders/1Qn4bXppLRV_u8HymuBJZh6zzseKm6GdT?usp=drive_link';

export const RANDOM_MEMORIES_FOLDER_URL =
  'https://drive.google.com/drive/folders/1bmxqSuz-w8dmYPBi0SARQcG7pO7g2b5r?usp=drive_link';

export interface DriveFolderFile {
  id: string;
  title: string;
  proxyUrl: string;
  thumbnailUrl: string;
  directUrl: string;
}

export interface DriveFolderResponse {
  folderId: string;
  count: number;
  files: DriveFolderFile[];
  error?: string;
}

/**
 * Extracts Google Drive Folder ID from link formats like:
 * - https://drive.google.com/drive/folders/1Qn4bXpp...
 */
export function extractDriveFolderId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's just raw folder ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Extracts Google Drive File ID from various link formats:
 * - https://drive.google.com/file/d/1A2B3C4D.../view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D...
 * - https://drive.google.com/uc?id=1A2B3C4D...
 * - https://drive.google.com/thumbnail?id=1A2B3C4D...
 * - https://lh3.googleusercontent.com/d/1A2B3C4D...
 * - /api/drive/image/1A2B3C4D...
 * - Or raw alphanumeric ID (25-45 chars)
 */
export function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If it's a folder URL, we can't extract a single file ID
  if (trimmed.includes('/folders/')) {
    return null;
  }

  // Already our proxy endpoint
  const proxyMatch = trimmed.match(/\/api\/drive\/image\/([a-zA-Z0-9_-]+)/);
  if (proxyMatch && proxyMatch[1]) {
    return proxyMatch[1];
  }

  // Regex patterns for file links
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's just a raw Google Drive ID (20-50 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns a reliable direct image URL for Google Drive files.
 * Works natively on static hosting like Vercel as well as full-stack environments.
 */
export function getDriveThumbnailUrl(input: string, size = 1200): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If it's a data URL, blob, or local public path
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/photos/') ||
    trimmed.startsWith('/music/')
  ) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // Primary: Google Drive Direct Thumbnail CDN (works universally on client-side)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  // If it's already an http link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Returns alternate fallback CDN endpoints for a Google Drive file in case one CDN throttles.
 */
export function getDriveFallbackUrl(input: string, size = 1200, currentUrl = ''): string {
  const fileId = extractDriveFileId(input) || extractDriveFileId(currentUrl);
  if (!fileId) return '';

  if (currentUrl.includes('drive.google.com/thumbnail')) {
    return `https://lh3.googleusercontent.com/d/${fileId}=s${size}`;
  }
  if (currentUrl.includes('lh3.googleusercontent.com')) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Fetches all images from a Google Drive public folder via our server-side parser.
 */
export async function fetchDriveFolderFiles(folderId: string): Promise<DriveFolderFile[]> {
  if (!folderId) return [];
  try {
    const res = await fetch(`/api/drive/folder/${encodeURIComponent(folderId)}`);
    if (!res.ok) {
      console.warn(`Drive folder fetch responded with status ${res.status}`);
      return [];
    }
    const data: DriveFolderResponse = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to fetch Google Drive folder files', err);
    return [];
  }
}

// Local Storage Keys for custom user photos & cached drive folder files
export const CUSTOM_PHOTOS_STORAGE_KEY = 'universe_custom_photos_v2';
export const DRIVE_FOLDER_CACHE_KEY = 'universe_drive_folder_cache_v2';

export interface CustomPhotoMapping {
  [memoryId: string]: string; // memory ID -> proxyUrl or file ID
}

export function loadCustomPhotos(): CustomPhotoMapping {
  try {
    const data = localStorage.getItem(CUSTOM_PHOTOS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.warn('Failed to load custom photos from localStorage', err);
    return {};
  }
}

export function saveCustomPhoto(memoryId: string, src: string): void {
  try {
    const current = loadCustomPhotos();
    current[memoryId] = src;
    localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('universe_custom_photos_updated'));
  } catch (err) {
    console.warn('Failed to save custom photo', err);
  }
}

export function saveAllCustomPhotos(mapping: CustomPhotoMapping): void {
  try {
    localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(mapping));
    window.dispatchEvent(new Event('universe_custom_photos_updated'));
  } catch (err) {
    console.warn('Failed to save custom photos', err);
  }
}

export function clearCustomPhotos(): void {
  try {
    localStorage.removeItem(CUSTOM_PHOTOS_STORAGE_KEY);
    window.dispatchEvent(new Event('universe_custom_photos_updated'));
  } catch (err) {
    console.warn('Failed to clear custom photos', err);
  }
}

export function getCachedFolderFiles(folderId: string): DriveFolderFile[] {
  try {
    const raw = localStorage.getItem(`${DRIVE_FOLDER_CACHE_KEY}_${folderId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedFolderFiles(folderId: string, files: DriveFolderFile[]): void {
  try {
    localStorage.setItem(`${DRIVE_FOLDER_CACHE_KEY}_${folderId}`, JSON.stringify(files));
    window.dispatchEvent(new Event('universe_drive_folder_cache_updated'));
  } catch (e) {
    console.warn('Could not cache folder files', e);
  }
}
