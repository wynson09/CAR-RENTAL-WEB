'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface ImageViewerProps {
  viewingImage: string | null;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ viewingImage, onClose }) => {
  if (!viewingImage) return null;

  return (
    <Dialog open={!!viewingImage} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Document View</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[70vh]">
          <Image src={viewingImage} alt="Document" fill className="object-contain" />
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={viewingImage} download target="_blank">
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
