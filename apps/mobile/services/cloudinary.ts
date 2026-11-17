/**
 * Cloudinary unsigned upload service
 * Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 * in your .env file (use an unsigned upload preset from your Cloudinary dashboard).
 */
import { Platform } from 'react-native';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

/**
 * Upload an image to Cloudinary via unsigned upload.
 * @param uri  - local file URI (from expo-image-picker) or a web File object URL
 * @param onProgress - optional progress callback (0–100)
 */
export async function uploadToCloudinary(
  uri: string,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and ' +
      'EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in apps/mobile/.env'
    );
  }

  const formData = new FormData();
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'roomie/profiles');

  if (Platform.OS === 'web') {
    // On web the uri is a blob: URL from the file input
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `photo_${Date.now()}.jpg`;
    formData.append('file', blob, filename);
  } else {
    // On native (iOS/Android) the uri is a local file path
    const filename = uri.split('/').pop() || `photo_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    // React Native supports appending { uri, name, type } as a file
    formData.append('file', { uri, name: filename, type } as any);
  }

  onProgress?.(10);

  const res = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  onProgress?.(90);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Cloudinary upload failed');
  }

  const data = await res.json();
  onProgress?.(100);

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
  };
}
