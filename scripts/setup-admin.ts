/**
 * Admin Setup Script
 *
 * This script ensures that admin accounts exist in both Firebase Auth and Firestore.
 * Run this script to initialize admin accounts for your application.
 *
 * Usage: npx ts-node scripts/setup-admin.ts
 */

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createUserData, removeUndefinedFields } from '../lib/user-utils';

interface AdminConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator';
}

const adminAccounts: AdminConfig[] = [
  {
    email: 'admin@nacscarrental.com',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  // Add more admin accounts as needed
];

async function createAdminAccount(adminConfig: AdminConfig) {
  try {
    console.log(`Setting up admin account: ${adminConfig.email}`);

    let userCredential;
    let userId;

    try {
      // Try to create the user in Firebase Auth
      userCredential = await createUserWithEmailAndPassword(
        auth,
        adminConfig.email,
        adminConfig.password
      );
      userId = userCredential.user.uid;
      console.log(`✓ Created Firebase Auth user: ${userId}`);

      // Update the user's display name
      const fullName = `${adminConfig.firstName} ${adminConfig.lastName}`.trim();
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
      console.log(`✓ Updated display name: ${fullName}`);
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log(`→ Firebase Auth user already exists for ${adminConfig.email}`);
        // We'll need the UID to update Firestore, but we can't easily get it
        // The admin will need to login once to sync data
        return;
      } else {
        throw authError;
      }
    }

    // Create or update Firestore document
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const fullName = `${adminConfig.firstName} ${adminConfig.lastName}`.trim();

      if (!userDoc.exists()) {
        // Create new Firestore document
        const userData = createUserData(userId, adminConfig.email, 'credentials', {
          firstName: adminConfig.firstName,
          lastName: adminConfig.lastName,
          name: fullName,
          role: adminConfig.role,
          isVerified: true,
        });

        const cleanUserData = removeUndefinedFields(userData);
        await setDoc(userRef, cleanUserData);
        console.log(`✓ Created Firestore document for admin`);
      } else {
        // Update existing Firestore document to ensure admin role
        const updateData = {
          firstName: adminConfig.firstName,
          lastName: adminConfig.lastName,
          name: fullName,
          role: adminConfig.role,
          isVerified: true,
          updatedAt: new Date(),
        };

        const cleanUpdateData = removeUndefinedFields(updateData);
        await setDoc(userRef, cleanUpdateData, { merge: true });
        console.log(`✓ Updated Firestore document for admin`);
      }
    }

    console.log(`✅ Admin account setup complete: ${adminConfig.email}\n`);
  } catch (error) {
    console.error(`❌ Error setting up admin account ${adminConfig.email}:`, error);
    console.error('');
  }
}

async function setupAllAdmins() {
  console.log('🚀 Starting admin account setup...\n');

  try {
    for (const adminConfig of adminAccounts) {
      await createAdminAccount(adminConfig);
    }

    console.log('✅ All admin accounts have been processed!');
    console.log('\n📝 Notes:');
    console.log(
      '- If Firebase Auth users already existed, they need to login once to sync Firestore data'
    );
    console.log('- Admin accounts are automatically verified and have admin role');
    console.log('- Check Firebase Console to verify the accounts were created properly');
  } catch (error) {
    console.error('❌ Error during admin setup:', error);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupAllAdmins()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { setupAllAdmins, createAdminAccount };
