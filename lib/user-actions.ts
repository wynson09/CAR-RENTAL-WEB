"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserData } from "@/store";
import { convertFirestoreTimestamps } from "./user-utils";

// Fetch user data from Firestore
export const fetchUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return convertFirestoreTimestamps(userData);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};