'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AssetFile,
  uploadAsset,
  listAssetsByCategory,
  deleteAsset,
  copyAssetUrl,
  getAllAssetsGrouped,
} from '@/lib/firebase-asset-service';

const LandingPageAssetsManagement = () => {
  const { data: session, status } = useSession();

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'moderator';

  // Redirect non-admin users
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      redirect('/auth/login');
      return;
    }
    if (!isAdmin) {
      redirect('/dashboard'); // Redirect to regular dashboard
      return;
    }
  }, [session, status, isAdmin]);

  const [assets, setAssets] = useState<Record<AssetFile['category'], AssetFile[]>>({
    hero: [],
    service: [],
    testimonial: [],
    gallery: [],
    icons: [],
    other: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<AssetFile['category']>('other');
  const [customName, setCustomName] = useState('');
  const [activeTab, setActiveTab] = useState<AssetFile['category']>('hero');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Load assets on component mount
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const groupedAssets = await getAllAssetsGrouped();
      setAssets(groupedAssets);
    } catch (error) {
      toast.error('Failed to load assets');
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const result = await uploadAsset(selectedFile, uploadCategory, customName);

      if (result.success && result.asset) {
        toast.success('Asset uploaded successfully!');
        setAssets((prev) => ({
          ...prev,
          [uploadCategory]: [...prev[uploadCategory], result.asset!],
        }));

        // Reset form
        setSelectedFile(null);
        setCustomName('');
        setIsUploadDialogOpen(false);

        // Reset file input
        const fileInput = document.getElementById('asset-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (asset: AssetFile) => {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;

    try {
      const success = await deleteAsset(asset.path);
      if (success) {
        toast.success('Asset deleted successfully');
        setAssets((prev) => ({
          ...prev,
          [asset.category]: prev[asset.category].filter((a) => a.id !== asset.id),
        }));
      } else {
        toast.error('Failed to delete asset');
      }
    } catch (error) {
      toast.error('Failed to delete asset');
      console.error('Delete error:', error);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      const success = await copyAssetUrl(url);
      if (success) {
        toast.success('URL copied to clipboard!');
      } else {
        toast.error('Failed to copy URL');
      }
    } catch (error) {
      toast.error('Failed to copy URL');
      console.error('Copy error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: AssetFile['category']): string => {
    const iconMap = {
      hero: 'heroicons:photo',
      service: 'heroicons:cog-6-tooth',
      testimonial: 'heroicons:chat-bubble-left-right',
      gallery: 'heroicons:squares-2x2',
      icons: 'heroicons:star',
      other: 'heroicons:folder',
    };
    return iconMap[category];
  };

  const getCategoryColor = (category: AssetFile['category']): string => {
    const colorMap = {
      hero: 'bg-blue-500',
      service: 'bg-green-500',
      testimonial: 'bg-purple-500',
      gallery: 'bg-orange-500',
      icons: 'bg-yellow-500',
      other: 'bg-gray-500',
    };
    return colorMap[category];
  };

  const totalAssets = Object.values(assets).flat().length;

  // Show loading while checking authentication
  if (status === 'loading' || !session || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Icon icon="heroicons:arrow-path" className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg text-default-600">
            {status === 'loading' ? 'Loading...' : 'Checking permissions...'}
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Icon icon="heroicons:arrow-path" className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg text-default-600">Loading assets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Landing Page Asset Management</h1>
          <p className="text-default-600 mt-1">
            Upload and manage images for your landing page components
          </p>
        </div>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
              Upload Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">
                  Select Image File
                </label>
                <Input
                  id="asset-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-xs text-default-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">Category</label>
                <Select
                  value={uploadCategory}
                  onValueChange={(value) => setUploadCategory(value as AssetFile['category'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                    <SelectItem value="testimonial">Testimonials</SelectItem>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="icons">Icons</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">
                  Custom Name (Optional)
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter custom name"
                />
              </div>

              {selectedFile && (
                <Alert>
                  <Icon icon="heroicons:information-circle" className="h-4 w-4" />
                  <AlertDescription>
                    Ready to upload: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons:cloud-arrow-up" className="w-4 h-4 mr-2" />
                      Upload Asset
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Assets</p>
                <p className="text-2xl font-bold text-default-900">{totalAssets}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon icon="heroicons:photo" className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(assets)
          .slice(0, 3)
          .map(([category, categoryAssets]) => (
            <Card key={category} className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-600 capitalize">{category}</p>
                    <p className="text-2xl font-bold text-default-900">{categoryAssets.length}</p>
                  </div>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      getCategoryColor(category as AssetFile['category'])
                    )}
                  >
                    <Icon
                      icon={getCategoryIcon(category as AssetFile['category'])}
                      className="w-6 h-6 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Asset Tabs */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:squares-2x2" className="w-6 h-6 mr-2 text-primary" />
            Asset Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AssetFile['category'])}
          >
            <TabsList className="grid w-full grid-cols-6">
              {Object.keys(assets).map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  <Icon
                    icon={getCategoryIcon(category as AssetFile['category'])}
                    className="w-4 h-4 mr-2"
                  />
                  {category}
                  <Badge variant="secondary" className="ml-2">
                    {assets[category as AssetFile['category']].length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(assets).map(([category, categoryAssets]) => (
              <TabsContent key={category} value={category} className="mt-6">
                {categoryAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon
                      icon={getCategoryIcon(category as AssetFile['category'])}
                      className="w-16 h-16 mx-auto text-default-300 mb-4"
                    />
                    <h3 className="text-lg font-semibold text-default-600 mb-2">
                      No {category} assets yet
                    </h3>
                    <p className="text-default-500 mb-4">
                      Upload your first {category} image to get started
                    </p>
                    <Button
                      onClick={() => {
                        setUploadCategory(category as AssetFile['category']);
                        setIsUploadDialogOpen(true);
                      }}
                    >
                      <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                      Upload {category} Asset
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {categoryAssets.map((asset) => (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="group hover:shadow-lg transition-all duration-200 border-primary/20">
                            <CardContent className="p-4">
                              <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
                                <Image
                                  src={asset.url}
                                  alt={asset.name}
                                  width={300}
                                  height={200}
                                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleCopyUrl(asset.url)}
                                      className="bg-white/90 hover:bg-white text-black"
                                    >
                                      <Icon icon="heroicons:clipboard" className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDelete(asset)}
                                      className="bg-red-500/90 hover:bg-red-500"
                                    >
                                      <Icon icon="heroicons:trash" className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4
                                  className="font-medium text-default-900 truncate"
                                  title={asset.name}
                                >
                                  {asset.name}
                                </h4>
                                <div className="flex items-center justify-between text-sm text-default-600">
                                  <span>{formatFileSize(asset.size)}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {asset.type.split('/')[1]?.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-xs text-default-500">
                                  {asset.uploadedAt.toLocaleDateString()}
                                </p>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyUrl(asset.url)}
                                  className="w-full text-xs"
                                >
                                  <Icon icon="heroicons:link" className="w-3 h-3 mr-1" />
                                  Copy URL
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPageAssetsManagement;
