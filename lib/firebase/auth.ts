import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { User } from "@/types";

const provider = new GoogleAuthProvider();

// Authorized admin emails
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

/**
 * Check if user email is authorized as admin
 */
export function isAuthorizedAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // Check if user exists in Firestore
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user automatically with status "pending"
      // ALL new users need admin approval, regardless of email
      const userData: Omit<User, "id"> = {
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        role: "user", // All new users start as "user"
        status: "pending", // All new users need approval
        photoURL: firebaseUser.photoURL || undefined,
        lastLogin: Timestamp.now(),
        createdAt: Timestamp.now(),
      };
      await setDoc(userRef, userData);
      return { id: firebaseUser.uid, ...userData };
    } else {
      // User exists, update last login
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
      });
      return { id: firebaseUser.uid, ...userSnap.data() } as User;
    }
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Get current user data from Firestore
 */
export async function getCurrentUser(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // Compatibilidade retroativa: adiciona status aos usuários antigos
      if (!userData.status) {
        await updateDoc(userRef, {
          status: "approved",
        });
        return { id: uid, ...userData, status: "approved" } as User;
      }

      return { id: uid, ...userData } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
