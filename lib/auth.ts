import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserData, removeUndefinedFields } from './user-utils';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Account, Profile, User } from 'next-auth';

// Extend the Session type to include user ID
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Helper function to sync user data to Firestore
const syncUserToFirestore = async (user: any) => {
  try {
    const userRef = doc(db, 'users', user.id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Parse first and last name from full name for OAuth users
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create consistent user data structure
      const userData = createUserData(user.id, user.email, user.provider, {
        firstName,
        lastName,
        name: user.name,
        image: user.image,
        isVerified: false,
      });

      // Clean and save user data (remove undefined fields)
      const cleanUserData = removeUndefinedFields(userData);
      await setDoc(userRef, cleanUserData);
    } else {
      // Update existing user data (only update specific fields, avoid undefined)
      const updateData: any = {
        name: user.name,
        email: user.email,
        updatedAt: new Date(),
      };

      // Only add image field if it has a value
      if (user.image) {
        updateData.image = user.image;
      }

      // Clean and save update data (remove undefined fields)
      const cleanUpdateData = removeUndefinedFields(updateData);
      await setDoc(userRef, cleanUpdateData, { merge: true });
    }
  } catch (error) {
    console.error('Error syncing user to Firestore:', error);
  }
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID as string,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        try {
          // Use Firebase authentication for email/password
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          if (user) {
            const userData = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0],
              email: user.email,
              image: user.photoURL,
              provider: 'credentials',
            };

            // Sync user to Firestore
            await syncUserToFirestore(userData);

            return userData;
          }

          return null;
        } catch (error) {
          console.error('Firebase auth error:', error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null; profile?: Profile }) {
      if (
        account?.provider === 'google' ||
        account?.provider === 'facebook' ||
        account?.provider === 'github'
      ) {
        try {
          // For OAuth providers, sync user data to Firestore
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
          };

          await syncUserToFirestore(userData);
          return true;
        } catch (error) {
          console.error('Error during OAuth sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
      if (user) {
        token.provider = account?.provider;
      }
      return token;
    },
  },

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },

  debug: process.env.NODE_ENV !== 'production',
};
