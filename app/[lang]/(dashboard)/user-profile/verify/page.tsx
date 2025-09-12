'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store';
import Card from '@/components/ui/card-snippet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stepper, Step, StepLabel } from '@/components/ui/steps';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from '@/components/ui/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Eye, Download, RotateCcw, ZoomIn, ImageIcon } from 'lucide-react';

const PH_ID_TYPES = [
  'Philippine Passport',
  'Driver’s License',
  'UMID (Unified Multi-Purpose ID)',
  'PhilSys National ID',
  'SSS ID',
  'GSIS eCard',
  'PRC ID',
  'Postal ID',
  'Voter’s ID',
  'Barangay ID',
  'Senior Citizen ID',
  'PWD ID',
  'TIN ID',
  'OWWA ID',
  'Seaman’s Book',
];

export default function VerifyKycPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [activeStep, setActiveStep] = useState(0); // 0-based like template

  const steps = [
    {
      label: 'Personal Information',
      content: 'Provide your details',
    },
    {
      label: 'Identification',
      content: 'Upload your IDs',
    },
    {
      label: 'Confirmation',
      content: 'Review & submit',
    },
  ];

  // Step 1: Personal / KYC basics
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [birthDate, setBirthDate] = useState(user?.kycRecord?.birthDate || '');
  const [gender, setGender] = useState(user?.kycRecord?.gender || '');
  const [nationality, setNationality] = useState(user?.kycRecord?.nationality || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.kycRecord?.phoneNumber || '');
  const [address, setAddress] = useState(user?.kycRecord?.address || '');
  const [city, setCity] = useState(user?.kycRecord?.city || '');
  const [state, setState] = useState(user?.kycRecord?.state || '');
  const [zipCode, setZipCode] = useState(user?.kycRecord?.zipCode || '');

  // Step 2: IDs & proof
  const [governmentIdType, setGovernmentIdType] = useState(user?.kycRecord?.governmentIdType || '');
  const [governmentId, setGovernmentId] = useState(user?.kycRecord?.governmentId || '');

  // Store files locally until form submission
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [proofOfBillingFile, setProofOfBillingFile] = useState<File | null>(null);
  const [selfieWithIdFile, setSelfieWithIdFile] = useState<File | null>(null);

  // Preview URLs for display (created from File objects)
  const [frontImageUrl, setFrontImageUrl] = useState(user?.kycRecord?.governmentIdFrontImage || '');
  const [backImageUrl, setBackImageUrl] = useState(user?.kycRecord?.governmentIdBackImage || '');
  const [proofOfBillingUrl, setProofOfBillingUrl] = useState('');
  const [selfieWithIdUrl, setSelfieWithIdUrl] = useState('');

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Validation state to show red borders
  const [showValidation, setShowValidation] = useState(false);

  const validateStep1 = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !birthDate.trim() ||
      !gender.trim() ||
      !nationality.trim() ||
      !phoneNumber.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zipCode.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields in Step 1',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !governmentIdType ||
      !governmentId.trim() ||
      (!frontImageFile && !frontImageUrl) ||
      (!backImageFile && !backImageUrl) ||
      (!proofOfBillingFile && !proofOfBillingUrl) ||
      (!selfieWithIdFile && !selfieWithIdUrl)
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields in Step 2',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) {
      setShowValidation(true);
      return;
    }
    if (activeStep === 1 && !validateStep2()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      toast({
        title: 'Authentication Error',
        description: 'You must be signed in to submit verification.',
      });
      return;
    }
    if (!validateStep1() || !validateStep2()) return;

    // Show loading toast
    const loadingToast = toast({
      title: 'Uploading documents...',
      description: 'Please wait while we upload your documents.',
    });

    try {
      // Upload new files to Firebase Storage
      const uploadPromises = [];
      let frontImageFinalUrl = frontImageUrl;
      let backImageFinalUrl = backImageUrl;
      let proofOfBillingFinalUrl = proofOfBillingUrl;
      let selfieWithIdFinalUrl = selfieWithIdUrl;

      // Generate file paths with timestamp and random ID
      const timestamp = Date.now();
      const generatePath = (fileName: string) => {
        const randomId = Math.random().toString(36).substr(2, 9);
        const fileExtension = fileName.split('.').pop() || 'jpg';
        return `kyc-images/${user.uid}/${timestamp}_${randomId}.${fileExtension}`;
      };

      // Upload front image if new file selected
      if (frontImageFile) {
        const path = generatePath(frontImageFile.name);
        uploadPromises.push(
          uploadFile(frontImageFile, path).then((url) => {
            frontImageFinalUrl = url;
          })
        );
      }

      // Upload back image if new file selected
      if (backImageFile) {
        const path = generatePath(backImageFile.name);
        uploadPromises.push(
          uploadFile(backImageFile, path).then((url) => {
            backImageFinalUrl = url;
          })
        );
      }

      // Upload proof of billing if new file selected
      if (proofOfBillingFile) {
        const path = generatePath(proofOfBillingFile.name);
        uploadPromises.push(
          uploadFile(proofOfBillingFile, path).then((url) => {
            proofOfBillingFinalUrl = url;
          })
        );
      }

      // Upload selfie with ID if new file selected
      if (selfieWithIdFile) {
        const path = generatePath(selfieWithIdFile.name);
        uploadPromises.push(
          uploadFile(selfieWithIdFile, path).then((url) => {
            selfieWithIdFinalUrl = url;
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        email,
        updatedAt: serverTimestamp(),
        kycRecord: {
          ...(user?.kycRecord || {}),
          birthDate,
          gender,
          nationality,
          phoneNumber,
          address,
          city,
          state,
          zipCode,
          governmentIdType,
          governmentId,
          governmentIdFrontImage: frontImageFinalUrl,
          governmentIdBackImage: backImageFinalUrl,
          proofOfBillingImage: proofOfBillingFinalUrl,
          selfieWithIdImage: selfieWithIdFinalUrl,
          status: 'pending',
          statusMessage: 'Submitted for review',
          updatedAt: serverTimestamp(),
        },
      } as any);

      // Dismiss loading toast
      loadingToast.dismiss();

      toast({
        title: 'Success',
        description: 'Verification submitted successfully. We will review your information.',
      });

      // Redirect to My Account page after successful submission
      setTimeout(() => {
        router.push('/my-account');
      }, 2000); // Wait 2 seconds to show the success message
    } catch (e: any) {
      console.error(e);
      loadingToast.dismiss();
      toast({
        title: 'Submission Error',
        description: 'Failed to submit verification. Please try again.',
      });
    }
  };

  const isTablet = useMediaQuery('(max-width: 1024px)');

  // File handling functions
  const handleFileSelect = (
    file: File,
    setFile: (file: File) => void,
    setUrl: (url: string) => void
  ) => {
    setFile(file);
    const previewUrl = URL.createObjectURL(file);
    setUrl(previewUrl);
  };

  const removeFile = (
    setFile: (file: File | null) => void,
    setUrl: (url: string) => void,
    currentUrl: string
  ) => {
    setFile(null);
    setUrl('');
    // Clean up preview URL
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
  };

  // Upload files to Firebase Storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { uploadFile: firebaseUpload } = await import('@/lib/firebase-storage');
    return await firebaseUpload(path, file);
  };

  // Local File Upload Component (no auto-upload)
  const LocalFileUpload = ({
    onFileSelect,
    accept = 'image/*',
    className = '',
  }: {
    onFileSelect: (file: File) => void;
    accept?: string;
    className?: string;
  }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: 'Please select an image under 5MB',
          });
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: 'Please select an image file',
          });
          return;
        }

        onFileSelect(file);
      }
    };

    return (
      <>
        <div
          className={cn('cursor-pointer', className)}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm text-default-600">Click to upload</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </>
    );
  };

  // Enhanced Image Display Component
  const ImagePreview = ({
    imageUrl,
    onRemove,
    title,
    placeholder,
    onFileSelect,
    aspectRatio = '3/2',
    showValidation = false,
  }: {
    imageUrl: string;
    onRemove: () => void;
    title: string;
    placeholder: string;
    onFileSelect: (file: File) => void;
    aspectRatio?: string;
    showValidation?: boolean;
  }) => {
    if (imageUrl) {
      return (
        <div className="relative group">
          <div
            className="relative w-full border-2 border-solid border-green-300 rounded-lg overflow-hidden bg-white shadow-sm"
            style={{ aspectRatio }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => setViewingImage(imageUrl)}
            />

            {/* Overlay with actions - appears on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm"
                  onClick={() => setViewingImage(imageUrl)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm"
                  onClick={onRemove}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Remove button - always visible */}
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          </div>

          {/* Image quality indicator */}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {title} uploaded
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setViewingImage(imageUrl)}
            >
              View full size
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div
          className={cn(
            'relative w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50',
            showValidation && !imageUrl
              ? 'border-red-500 hover:border-red-600'
              : 'border-default-300 hover:border-primary'
          )}
          style={{ aspectRatio }}
        >
          <LocalFileUpload
            onFileSelect={onFileSelect}
            className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-default-600">{title}</p>
            <p className="text-xs text-default-500 mt-1">{placeholder}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>
            <div className="p-4">
              <img
                src={viewingImage}
                alt="Document preview"
                className="max-w-full max-h-[70vh] object-contain mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = viewingImage;
                  link.download = 'document.jpg';
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewingImage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card title="Validation">
        <div className="mt-4">
          <Stepper
            current={activeStep}
            content="right"
            direction={isTablet ? 'vertical' : 'horizontal'}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <div className="flex flex-col">
                    <span>{step.label}</span>
                    <span>{step.content}</span>
                  </div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <React.Fragment>
              <div className="mt-2 mb-2 font-semibold text-center">
                All steps completed - you&apos;re finished
              </div>
              <div className="flex pt-2">
                <div className=" flex-1" />
                <Button
                  size="xs"
                  variant="outline"
                  color="destructive"
                  className="cursor-pointer"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <form>
                <div className="grid grid-cols-12 gap-4">
                  {activeStep === 0 && (
                    <>
                      <div className="col-span-12 mb-4 mt-6">
                        <h4 className="text-sm font-medium text-default-600">
                          Enter Your Personal Information
                        </h4>
                        <p className="text-xs text-default-600 mt-1">
                          Fill in the box with correct data
                        </p>
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (e.target.value.trim()) setShowValidation(false);
                            }}
                            className={cn(
                              showValidation &&
                                !firstName.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={cn(
                              showValidation &&
                                !lastName.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={cn(
                              showValidation &&
                                !email.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="tel"
                            placeholder="e.g. +63 912 345 6789"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={cn(
                              showValidation &&
                                !phoneNumber.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                          <p className="text-xs text-default-500">
                            Include country code (e.g. +63 for Philippines)
                          </p>
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Birth Date <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className={cn(
                              showValidation &&
                                !birthDate.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                          <p className="text-xs text-default-500">Select your date of birth</p>
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger
                              size="md"
                              className={cn(
                                showValidation && !gender && 'border-red-500 focus:border-red-500'
                              )}
                            >
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Nationality <span className="text-red-500">*</span>
                          </label>
                          <Select value={nationality} onValueChange={setNationality}>
                            <SelectTrigger
                              size="md"
                              className={cn(
                                showValidation &&
                                  !nationality &&
                                  'border-red-500 focus:border-red-500'
                              )}
                            >
                              <SelectValue placeholder="Select your nationality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="filipino">Filipino</SelectItem>
                              <SelectItem value="american">American</SelectItem>
                              <SelectItem value="british">British</SelectItem>
                              <SelectItem value="canadian">Canadian</SelectItem>
                              <SelectItem value="australian">Australian</SelectItem>
                              <SelectItem value="japanese">Japanese</SelectItem>
                              <SelectItem value="korean">Korean</SelectItem>
                              <SelectItem value="chinese">Chinese</SelectItem>
                              <SelectItem value="indian">Indian</SelectItem>
                              <SelectItem value="malaysian">Malaysian</SelectItem>
                              <SelectItem value="singaporean">Singaporean</SelectItem>
                              <SelectItem value="thai">Thai</SelectItem>
                              <SelectItem value="vietnamese">Vietnamese</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="col-span-12">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your complete address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={cn(
                              showValidation &&
                                !address.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            City <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={cn(
                              showValidation &&
                                !city.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            State/Province <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your state or province"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className={cn(
                              showValidation &&
                                !state.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Zip Code <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your zip code"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className={cn(
                              showValidation &&
                                !zipCode.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {activeStep === 1 && (
                    <>
                      <div className="col-span-12 mt-6 mb-4">
                        <h4 className="text-sm font-medium text-default-600">
                          Upload Your Identification Documents
                        </h4>
                        <p className="text-xs text-default-600 mt-1">
                          Upload clear photos of your government ID and proof of billing
                        </p>
                      </div>
                      <div className="col-span-12">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            Government ID Type <span className="text-red-500">*</span>
                          </label>
                          <Select value={governmentIdType} onValueChange={setGovernmentIdType}>
                            <SelectTrigger
                              size="md"
                              className={cn(
                                showValidation &&
                                  !governmentIdType &&
                                  'border-red-500 focus:border-red-500'
                              )}
                            >
                              <SelectValue placeholder="Select your government ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              {PH_ID_TYPES.map((idType) => (
                                <SelectItem key={idType} value={idType}>
                                  {idType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-default-500">
                            Choose the type of ID you will upload
                          </p>
                        </div>
                      </div>
                      <div className="col-span-12">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-default-700">
                            ID Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your ID number"
                            value={governmentId}
                            onChange={(e) => setGovernmentId(e.target.value)}
                            className={cn(
                              showValidation &&
                                !governmentId.trim() &&
                                'border-red-500 focus:border-red-500'
                            )}
                          />
                          <p className="text-xs text-default-500">
                            Enter the ID number exactly as it appears on your document
                          </p>
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <ImagePreview
                          imageUrl={frontImageUrl}
                          onRemove={() =>
                            removeFile(setFrontImageFile, setFrontImageUrl, frontImageUrl)
                          }
                          title="ID Front Image"
                          placeholder="Upload clear photo of the front of your ID"
                          onFileSelect={(file) =>
                            handleFileSelect(file, setFrontImageFile, setFrontImageUrl)
                          }
                          aspectRatio="16/10"
                          showValidation={showValidation}
                        />
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <ImagePreview
                          imageUrl={backImageUrl}
                          onRemove={() =>
                            removeFile(setBackImageFile, setBackImageUrl, backImageUrl)
                          }
                          title="ID Back Image"
                          placeholder="Upload clear photo of the back of your ID"
                          onFileSelect={(file) =>
                            handleFileSelect(file, setBackImageFile, setBackImageUrl)
                          }
                          aspectRatio="16/10"
                          showValidation={showValidation}
                        />
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <ImagePreview
                          imageUrl={selfieWithIdUrl}
                          onRemove={() =>
                            removeFile(setSelfieWithIdFile, setSelfieWithIdUrl, selfieWithIdUrl)
                          }
                          title="Selfie with ID"
                          placeholder="Upload a clear selfie of yourself holding your ID next to your face"
                          onFileSelect={(file) =>
                            handleFileSelect(file, setSelfieWithIdFile, setSelfieWithIdUrl)
                          }
                          aspectRatio="16/10"
                          showValidation={showValidation}
                        />
                      </div>
                      <div className="col-span-12 lg:col-span-6">
                        <ImagePreview
                          imageUrl={proofOfBillingUrl}
                          onRemove={() =>
                            removeFile(
                              setProofOfBillingFile,
                              setProofOfBillingUrl,
                              proofOfBillingUrl
                            )
                          }
                          title="Proof of Billing"
                          placeholder="Upload utility bill, bank statement, or other proof of billing"
                          onFileSelect={(file) =>
                            handleFileSelect(file, setProofOfBillingFile, setProofOfBillingUrl)
                          }
                          aspectRatio="16/10"
                          showValidation={showValidation}
                        />
                      </div>
                    </>
                  )}
                  {activeStep === 2 && (
                    <>
                      <div className="col-span-12 mt-6 mb-4">
                        <h4 className="text-sm font-medium text-default-600">
                          Review Your Information
                        </h4>
                        <p className="text-xs text-default-600 mt-1">
                          Please review all information before submitting
                        </p>
                      </div>
                      <div className="col-span-12">
                        <div className="bg-default-50 p-4 rounded-lg space-y-4">
                          {/* Personal Information */}
                          <div className="space-y-2">
                            <h5 className="font-medium text-default-800">Personal Information</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <strong>First Name:</strong> {firstName}
                              </div>
                              <div>
                                <strong>Last Name:</strong> {lastName}
                              </div>
                              <div>
                                <strong>Email:</strong> {email}
                              </div>
                              <div>
                                <strong>Birth Date:</strong> {birthDate}
                              </div>
                              <div>
                                <strong>Gender:</strong> {gender}
                              </div>
                              <div>
                                <strong>Nationality:</strong> {nationality}
                              </div>
                              <div>
                                <strong>Phone:</strong> {phoneNumber}
                              </div>
                              <div>
                                <strong>Address:</strong> {address}
                              </div>
                              <div>
                                <strong>City:</strong> {city}
                              </div>
                              <div>
                                <strong>State:</strong> {state}
                              </div>
                              <div>
                                <strong>Zip Code:</strong> {zipCode}
                              </div>
                              <div>
                                <strong>ID Type:</strong> {governmentIdType}
                              </div>
                              <div>
                                <strong>ID Number:</strong> {governmentId}
                              </div>
                            </div>
                          </div>

                          {/* Document Images */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-default-800">Uploaded Documents</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* ID Front */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-default-600">ID Front</p>
                                {frontImageUrl ? (
                                  <div className="w-full h-24 border border-green-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                    <img
                                      src={frontImageUrl}
                                      alt="ID Front"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-24 border border-red-300 rounded-lg bg-red-50 flex items-center justify-center text-xs text-red-600">
                                    Missing
                                  </div>
                                )}
                              </div>

                              {/* ID Back */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-default-600">ID Back</p>
                                {backImageUrl ? (
                                  <div className="w-full h-24 border border-green-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                    <img
                                      src={backImageUrl}
                                      alt="ID Back"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-24 border border-red-300 rounded-lg bg-red-50 flex items-center justify-center text-xs text-red-600">
                                    Missing
                                  </div>
                                )}
                              </div>

                              {/* Proof of Billing */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-default-600">
                                  Proof of Billing
                                </p>
                                {proofOfBillingUrl ? (
                                  <div className="w-full h-24 border border-green-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                    <img
                                      src={proofOfBillingUrl}
                                      alt="Proof of Billing"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-24 border border-red-300 rounded-lg bg-red-50 flex items-center justify-center text-xs text-red-600">
                                    Missing
                                  </div>
                                )}
                              </div>

                              {/* Selfie with ID */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-default-600">
                                  Selfie with ID
                                </p>
                                {selfieWithIdUrl ? (
                                  <div className="w-full h-24 border border-green-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                    <img
                                      src={selfieWithIdUrl}
                                      alt="Selfie with ID"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-24 border border-red-300 rounded-lg bg-red-50 flex items-center justify-center text-xs text-red-600">
                                    Missing
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </form>

              <div className="flex pt-2">
                <Button
                  size="xs"
                  variant="outline"
                  color="secondary"
                  className={cn('cursor-pointer', {
                    hidden: activeStep === 0,
                  })}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <div className="flex-1 gap-4" />
                <div className="flex gap-2">
                  {activeStep === steps.length - 1 ? (
                    <Button
                      size="xs"
                      variant="outline"
                      color="success"
                      className="cursor-pointer"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      color="secondary"
                      className="cursor-pointer"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </Card>
    </div>
  );
}
