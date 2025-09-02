'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { uploadFile } from '@/lib/firebase-storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, fileName: string) => void;
  currentUserId: string;
  className?: string;
  disabled?: boolean;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export const ImageUpload = ({
  onImageUpload,
  currentUserId,
  className,
  disabled = false,
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate secure file path
  const generateSecureFilePath = (file: File, userId: string): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    return `chat-images/${userId}/${timestamp}_${randomId}.${fileExtension}`;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${allowedTypes
        .map((type) => type.split('/')[1])
        .join(', ')}`;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return `File size too large. Maximum size is ${maxSizeInMB}MB`;
    }

    return null;
  };

  // Handle file selection from native file picker
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Make sure we have a valid user ID
    if (!currentUserId) {
      toast.error('Authentication error: User ID is missing');
      return;
    }

    // Show upload progress
    setIsUploading(true);
    const uploadToast = toast.loading('Uploading image...');

    try {
      const filePath = generateSecureFilePath(file, currentUserId);
      const downloadUrl = await uploadFile(filePath, file);

      // Call the callback with the uploaded image URL
      onImageUpload(downloadUrl, file.name);

      toast.dismiss(uploadToast);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss(uploadToast);

      // Show specific Firebase Storage permission error
      if (error.code === 'storage/unauthorized') {
        toast.error(
          'Permission denied: You do not have access to upload images. Please contact support.'
        );
      } else {
        toast.error(`Failed to upload image: ${error.message || 'Please try again'}`);
      }
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle button click - open file picker
  const handleButtonClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        className={cn(className)}
        disabled={disabled || isUploading}
        type="button"
        onClick={handleButtonClick}
      >
        <ImageIcon className="h-6 w-6" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        multiple={false}
      />
    </>
  );
};

export default ImageUpload;
