import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "./config";
import { Donation, DonationFormData } from "@/types";
import { updateStudentTotalDonations, getStudent } from "./students";

const COLLECTION_NAME = "donations";

/**
 * Get all donations
 */
export async function getDonations(): Promise<Donation[]> {
  try {
    const donationsRef = collection(db, COLLECTION_NAME);
    const q = query(donationsRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Donation[];
  } catch (error) {
    console.error("Error getting donations:", error);
    throw error;
  }
}

/**
 * Get recent donations
 */
export async function getRecentDonations(limitCount: number = 10): Promise<Donation[]> {
  try {
    const donationsRef = collection(db, COLLECTION_NAME);
    const q = query(donationsRef, orderBy("date", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Donation[];
  } catch (error) {
    console.error("Error getting recent donations:", error);
    throw error;
  }
}

/**
 * Get donation by ID
 */
export async function getDonation(id: string): Promise<Donation | null> {
  try {
    const donationRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(donationRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Donation;
    }
    return null;
  } catch (error) {
    console.error("Error getting donation:", error);
    throw error;
  }
}

/**
 * Create new donation
 */
export async function createDonation(
  data: DonationFormData,
  userId: string,
  userName: string
): Promise<Donation> {
  try {
    // Get student info
    const student = await getStudent(data.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const donationData = {
      ...data,
      date: Timestamp.fromDate(data.date),
      studentName: student.fullName,
      studentClass: student.class,
      registeredBy: userId,
      registeredByName: userName,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), donationData);

    // Calculate total items donated
    const totalItems = data.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // Update student's total donations count
    await updateStudentTotalDonations(data.studentId, totalItems);

    return { id: docRef.id, ...donationData } as Donation;
  } catch (error) {
    console.error("Error creating donation:", error);
    throw error;
  }
}

/**
 * Update donation
 */
export async function updateDonation(
  id: string,
  data: Partial<DonationFormData>
): Promise<void> {
  try {
    const donationRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = { ...data };

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }

    await updateDoc(donationRef, updateData);
  } catch (error) {
    console.error("Error updating donation:", error);
    throw error;
  }
}

/**
 * Delete donation
 */
export async function deleteDonation(id: string): Promise<void> {
  try {
    const donationRef = doc(db, COLLECTION_NAME, id);

    // Get donation data to update student total
    const donation = await getDonation(id);
    if (donation) {
      const totalItems = donation.products.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      await updateStudentTotalDonations(donation.studentId, -totalItems);
    }

    await deleteDoc(donationRef);
  } catch (error) {
    console.error("Error deleting donation:", error);
    throw error;
  }
}

/**
 * Get donations by student
 */
export async function getDonationsByStudent(studentId: string): Promise<Donation[]> {
  try {
    const donationsRef = collection(db, COLLECTION_NAME);
    const q = query(
      donationsRef,
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Donation[];
  } catch (error) {
    console.error("Error getting donations by student:", error);
    throw error;
  }
}

/**
 * Get donations by date range
 */
export async function getDonationsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Donation[]> {
  try {
    const donationsRef = collection(db, COLLECTION_NAME);
    const q = query(
      donationsRef,
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Donation[];
  } catch (error) {
    console.error("Error getting donations by date range:", error);
    throw error;
  }
}

/**
 * Get total donations items count
 */
export async function getTotalDonationsAmount(): Promise<number> {
  try {
    const donations = await getDonations();
    return donations.reduce(
      (total, donation) =>
        total + donation.products.reduce((sum, p) => sum + p.quantity, 0),
      0
    );
  } catch (error) {
    console.error("Error getting total donations items:", error);
    throw error;
  }
}

/**
 * Get monthly donations total items
 */
export async function getMonthlyDonationsTotal(year: number, month: number): Promise<number> {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const donations = await getDonationsByDateRange(startDate, endDate);
    return donations.reduce(
      (total, donation) =>
        total + donation.products.reduce((sum, p) => sum + p.quantity, 0),
      0
    );
  } catch (error) {
    console.error("Error getting monthly donations total:", error);
    throw error;
  }
}
