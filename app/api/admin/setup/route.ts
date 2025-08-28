import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { createUserData, removeUndefinedFields } from '@/lib/user-utils';

export async function POST(request: NextRequest) {
  try {
    // For security, only allow this in development or with specific env var
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_SETUP !== 'true') {
      return NextResponse.json({ error: 'Admin setup is disabled in production' }, { status: 403 });
    }

    const adminEmail = 'admin@nacscarrental.com';
    const adminPassword = 'password';
    const firstName = 'Admin';
    const lastName = 'User';

    console.log(`Setting up admin account: ${adminEmail}`);

    let userId;
    let userExists = false;

    try {
      // Try to create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      userId = userCredential.user.uid;

      // Update the user's display name
      const fullName = `${firstName} ${lastName}`.trim();
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        userExists = true;
        console.log(`Firebase Auth user already exists for ${adminEmail}`);

        // We can't easily get the UID of existing user, so we'll rely on the login flow
        // to sync the data when admin logs in
        return NextResponse.json({
          success: true,
          message:
            'Admin account already exists in Firebase Auth. Please login to sync Firestore data.',
          userExists: true,
        });
      } else {
        throw authError;
      }
    }

    // Create or update Firestore document if we have the userId
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const fullName = `${firstName} ${lastName}`.trim();

      if (!userDoc.exists()) {
        // Create new Firestore document
        const userData = createUserData(userId, adminEmail, 'credentials', {
          firstName,
          lastName,
          name: fullName,
          role: 'admin',
          isVerified: true,
        });

        const cleanUserData = removeUndefinedFields(userData);
        await setDoc(userRef, cleanUserData);
      } else {
        // Update existing Firestore document to ensure admin role
        const updateData = {
          firstName,
          lastName,
          name: fullName,
          role: 'admin' as const,
          isVerified: true,
          updatedAt: new Date(),
        };

        const cleanUpdateData = removeUndefinedFields(updateData);
        await setDoc(userRef, cleanUpdateData, { merge: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account setup completed successfully',
      userExists: false,
      userId,
    });
  } catch (error) {
    console.error('Error setting up admin account:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin account', details: error },
      { status: 500 }
    );
  }
}
