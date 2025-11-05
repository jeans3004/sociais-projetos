import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Settings } from "@/types";

const COLLECTION_NAME = "settings";
const SETTINGS_DOC_ID = "general";

/**
 * Get settings
 */
export async function getSettings(): Promise<Settings | null> {
  try {
    const settingsRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const snapshot = await getDoc(settingsRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Settings;
    }
    return null;
  } catch (error) {
    console.error("Error getting settings:", error);
    throw error;
  }
}

/**
 * Get settings or create default if not exists
 */
export async function getOrCreateSettings(): Promise<Settings> {
  try {
    let settings = await getSettings();

    if (!settings) {
      // Create default settings
      const defaultSettings: Omit<Settings, "id"> = {
        schoolName: process.env.NEXT_PUBLIC_SCHOOL_NAME || "Escola",
        monthlyGoal: 10000,
        yearlyGoal: 120000,
        academicYear: new Date().getFullYear().toString(),
        updatedAt: Timestamp.now(),
        updatedBy: "system",
      };

      await setDoc(doc(db, COLLECTION_NAME, SETTINGS_DOC_ID), defaultSettings);
      settings = { id: SETTINGS_DOC_ID, ...defaultSettings };
    }

    return settings;
  } catch (error) {
    console.error("Error getting or creating settings:", error);
    throw error;
  }
}

/**
 * Update settings
 */
export async function updateSettings(
  data: Partial<Omit<Settings, "id">>,
  userId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    await updateDoc(settingsRef, {
      ...data,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}
