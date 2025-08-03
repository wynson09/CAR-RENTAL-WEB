import { UserData, KycRecord } from "@/store";

// Create default KYC record
export const createDefaultKycRecord = (): KycRecord => ({
  birthDate: '',
  gender: '',
  nationality: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phoneNumber: '',
  governmentId: '',
  governmentIdType: '',
  governmentIdFrontImage: '',
  governmentIdBackImage: '',
  status: 'pending',
  statusMessage: '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create user data with consistent structure
export const createUserData = (
  uid: string,
  email: string,
  provider: 'credentials' | 'google' | 'facebook' | 'github',
  options: {
    firstName?: string;
    lastName?: string;
    name?: string;
    image?: string;
    role?: 'user' | 'admin' | 'moderator';
    isVerified?: boolean;
  } = {}
): UserData => {
  // Parse name if not provided separately
  let firstName = options.firstName || '';
  let lastName = options.lastName || '';
  
  if (!firstName && !lastName && options.name) {
    const nameParts = options.name.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }
  
  const fullName = options.name || `${firstName} ${lastName}`.trim() || email.split('@')[0];

  const userData: UserData = {
    uid,
    firstName,
    lastName,
    name: fullName,
    email,
    role: options.role || 'user',
    userViolation: [],
    isVerified: options.isVerified || false,
    kycRecord: createDefaultKycRecord(),
    provider,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Only add image field if it has a value (avoid undefined)
  if (options.image) {
    userData.image = options.image;
  }

  return userData;
};

// Remove undefined values from object (Firestore doesn't allow undefined)
export const removeUndefinedFields = (obj: any): any => {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        cleaned[key] = removeUndefinedFields(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};

// Convert Firestore timestamp to Date
export const convertFirestoreTimestamps = (userData: any): UserData => {
  return {
    ...userData,
    createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
    updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(userData.updatedAt),
    kycRecord: {
      ...userData.kycRecord,
      createdAt: userData.kycRecord?.createdAt?.toDate ? userData.kycRecord.createdAt.toDate() : new Date(userData.kycRecord?.createdAt || Date.now()),
      updatedAt: userData.kycRecord?.updatedAt?.toDate ? userData.kycRecord.updatedAt.toDate() : new Date(userData.kycRecord?.updatedAt || Date.now()),
    }
  };
};