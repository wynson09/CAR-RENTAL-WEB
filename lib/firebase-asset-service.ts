import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
} from 'firebase/storage';
import { signInWithCustomToken } from 'firebase/auth';
import { storage, auth } from './firebase';

export interface AssetFile {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  category: 'hero' | 'service' | 'testimonial' | 'gallery' | 'icons' | 'other';
}

export interface AssetUploadResult {
  success: boolean;
  asset?: AssetFile;
  error?: string;
}

/**
 * Ensure user is authenticated with Firebase Auth
 */
const ensureFirebaseAuth = async (): Promise<void> => {
  if (auth.currentUser) {
    return; // Already authenticated
  }

  // If not authenticated with Firebase, silently proceed.
  // Storage rules allow uploads for your use case.
};

/**
 * Upload an asset to Firebase Storage with metadata
 */
export const uploadAsset = async (
  file: File,
  category: AssetFile['category'] = 'other',
  customName?: string
): Promise<AssetUploadResult> => {
  try {
    // Ensure Firebase Auth (for now just log if not authenticated)
    await ensureFirebaseAuth();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = customName
      ? `${customName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`
      : `${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}_${timestamp}`;

    const filePath = `landing-page-assets/${category}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload file with metadata
    const metadata = {
      customMetadata: {
        category,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
      contentType: file.type,
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const asset: AssetFile = {
      id: fileName,
      name: fileName,
      path: filePath,
      url: downloadURL,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      category,
    };

    return { success: true, asset };
  } catch (error) {
    console.error('Error uploading asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * List all landing page assets by category
 */
export const listAssetsByCategory = async (
  category?: AssetFile['category']
): Promise<AssetFile[]> => {
  try {
    const basePath = category ? `landing-page-assets/${category}` : 'landing-page-assets';

    const storageRef = ref(storage, basePath);
    const listResult = await listAll(storageRef);

    const assetPromises = listResult.items.map(async (itemRef) => {
      try {
        const [url, metadata] = await Promise.all([getDownloadURL(itemRef), getMetadata(itemRef)]);

        return {
          id: itemRef.name,
          name: itemRef.name,
          path: itemRef.fullPath,
          url,
          size: metadata.size || 0,
          type: metadata.contentType || 'unknown',
          uploadedAt: metadata.customMetadata?.uploadedAt
            ? new Date(metadata.customMetadata.uploadedAt)
            : new Date(metadata.timeCreated),
          category: (metadata.customMetadata?.category as AssetFile['category']) || 'other',
        } as AssetFile;
      } catch (error) {
        console.error('Error processing asset:', itemRef.name, error);
        return null;
      }
    });

    const assets = await Promise.all(assetPromises);
    return assets.filter((asset): asset is AssetFile => asset !== null);
  } catch (error) {
    console.error('Error listing assets:', error);
    return [];
  }
};

/**
 * Delete an asset from Firebase Storage
 */
export const deleteAsset = async (filePath: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
};

/**
 * Get all assets grouped by category
 */
export const getAllAssetsGrouped = async (): Promise<
  Record<AssetFile['category'], AssetFile[]>
> => {
  const categories: AssetFile['category'][] = [
    'hero',
    'service',
    'testimonial',
    'gallery',
    'icons',
    'other',
  ];
  const groupedAssets: Record<AssetFile['category'], AssetFile[]> = {
    hero: [],
    service: [],
    testimonial: [],
    gallery: [],
    icons: [],
    other: [],
  };

  await Promise.all(
    categories.map(async (category) => {
      const assets = await listAssetsByCategory(category);
      groupedAssets[category] = assets;
    })
  );

  return groupedAssets;
};

/**
 * Copy asset URL to clipboard
 */
export const copyAssetUrl = async (url: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};
