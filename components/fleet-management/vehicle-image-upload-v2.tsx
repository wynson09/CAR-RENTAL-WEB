'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';

interface VehicleImageUploadProps {
  value?: string; // Current image URL (for existing vehicles)
  file?: File | null; // Selected file (not uploaded yet)
  onChange: (url: string) => void;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  className?: string;
  disabled?: boolean;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export const VehicleImageUpload = ({
  value,
  file,
  onChange,
  onFileSelect,
  onRemove,
  className,
  disabled = false,
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: VehicleImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create preview URL when file changes
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Cleanup function to revoke object URL
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Pass the file to parent component
    onFileSelect(selectedFile);
    toast.success('Image selected! It will be uploaded when you save the vehicle.');
  };

  // Handle button click - open file picker
  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Handle remove
  const handleRemove = () => {
    onFileSelect(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine what to display
  const displayUrl = previewUrl || value;

  if (displayUrl) {
    return (
      <div className={cn('relative w-full h-48 rounded-lg overflow-hidden group', className)}>
        <Image
          src={displayUrl}
          alt="Vehicle Image"
          fill
          className="object-cover transition-transform group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%239ca3af'%3ECar%3C/text%3E%3C/svg%3E"
        />

        {/* Show badge if it's a selected file (not uploaded yet) */}
        {previewUrl && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Selected
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            color="secondary"
            className="bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleButtonClick}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4 mr-2" /> Replace
          </Button>
          <Button
            type="button"
            size="sm"
            color="destructive"
            className="backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-2" /> Remove
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          multiple={false}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:border-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleButtonClick}
    >
      <div className="flex flex-col items-center gap-2">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-default-600">Upload Vehicle Image</p>
        <p className="text-xs text-muted-foreground">Click to select image</p>
        <p className="text-xs text-gray-400">Will be uploaded when you save</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        multiple={false}
        disabled={disabled}
      />
    </div>
  );
};
