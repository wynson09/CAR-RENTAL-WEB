import { uploadFile } from '@/lib/firebase-storage';

// Generate secure file path for vehicle images
export const generateVehicleImagePath = (file: File): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  return `fleet-images/${timestamp}_${randomId}.${fileExtension}`;
};

// Upload vehicle image to Firebase Storage
export const uploadVehicleImage = async (file: File): Promise<string> => {
  const filePath = generateVehicleImagePath(file);
  const downloadUrl = await uploadFile(filePath, file);
  return downloadUrl;
};
