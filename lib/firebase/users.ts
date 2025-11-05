import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db, auth } from "./config";
import { User, UserFormData } from "@/types";

const COLLECTION_NAME = "users";

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string): Promise<User | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as User;
    }

    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

/**
 * Create a new user in Firestore (called after Firebase Auth user creation)
 */
export async function createUserRecord(
  userId: string,
  data: Omit<UserFormData, "password">
): Promise<User> {
  try {
    const userData = {
      email: data.email,
      name: data.name,
      role: data.role,
      status: data.role === "admin" ? "approved" : "pending" as "pending" | "approved",
      lastLogin: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, COLLECTION_NAME, userId), userData);

    return {
      id: userId,
      ...userData,
    };
  } catch (error) {
    console.error("Error creating user record:", error);
    throw error;
  }
}

/**
 * Update user data
 */
export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Update last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as User;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

/**
 * Approve user access
 */
export async function approveUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      status: "approved",
    });
  } catch (error) {
    console.error("Error approving user:", error);
    throw error;
  }
}

/**
 * Reject user access
 */
export async function rejectUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      status: "rejected",
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw error;
  }
}

/**
 * Get pending users
 */
export async function getPendingUsers(): Promise<User[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting pending users:", error);
    throw error;
  }
}
