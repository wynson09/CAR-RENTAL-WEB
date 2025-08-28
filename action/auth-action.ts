'use server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { createUserData, removeUndefinedFields } from '@/lib/user-utils';

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const addUser = async (data: RegisterUserData) => {
  try {
    // Create user with Firebase Auths
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    // Create full name from first and last name
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    // Update the user's display name
    await updateProfile(user, {
      displayName: fullName,
    });

    // Create consistent user data structure
    const userData = createUserData(user.uid, data.email, 'credentials', {
      firstName: data.firstName,
      lastName: data.lastName,
      name: fullName,
      isVerified: false,
    });

    // Clean and save user data to Firestore (remove undefined fields)
    const cleanUserData = removeUndefinedFields(userData);
    await setDoc(doc(db, 'users', user.uid), cleanUserData);

    return {
      status: 'success',
      message: 'Account created successfully! Please sign in.',
      user: {
        id: user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        name: fullName,
        email: data.email,
      },
    };
  } catch (error: any) {
    console.error('Registration error:', error);

    let errorMessage = 'Registration failed. Please try again.';

    // Handle Firebase Auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email is already registered. Please use a different email.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      default:
        errorMessage = error.message || 'Registration failed. Please try again.';
    }

    return {
      status: 'error',
      message: errorMessage,
    };
  }
};
