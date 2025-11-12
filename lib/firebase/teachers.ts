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
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { Teacher, TeacherFormData } from "@/types";

const COLLECTION_NAME = "teachers";

/**
 * Get all teachers
 */
export async function getTeachers(): Promise<Teacher[]> {
  try {
    const teachersRef = collection(db, COLLECTION_NAME);
    const q = query(teachersRef, orderBy("fullName", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Teacher[];
  } catch (error) {
    console.error("Error getting teachers:", error);
    throw error;
  }
}

/**
 * Get teachers with pagination
 */
export async function getTeachersPaginated(
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ teachers: Teacher[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const teachersRef = collection(db, COLLECTION_NAME);
    let q = query(teachersRef, orderBy("fullName", "asc"), limit(pageSize));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const teachers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Teacher[];

    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { teachers, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error getting paginated teachers:", error);
    throw error;
  }
}

/**
 * Get teacher by ID
 */
export async function getTeacher(id: string): Promise<Teacher | null> {
  try {
    const teacherRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(teacherRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Teacher;
    }
    return null;
  } catch (error) {
    console.error("Error getting teacher:", error);
    throw error;
  }
}

/**
 * Create new teacher
 */
export async function createTeacher(data: TeacherFormData): Promise<Teacher> {
  try {
    const now = Timestamp.now();
    const teacherData = {
      ...data,
      totalDonations: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), teacherData);
    return { id: docRef.id, ...teacherData } as Teacher;
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
}

/**
 * Update teacher
 */
export async function updateTeacher(
  id: string,
  data: Partial<TeacherFormData>
): Promise<void> {
  try {
    const teacherRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(teacherRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
}

/**
 * Delete teacher
 */
export async function deleteTeacher(id: string): Promise<void> {
  try {
    const teacherRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(teacherRef);
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
}

/**
 * Search teachers by name
 */
export async function searchTeachers(searchTerm: string): Promise<Teacher[]> {
  try {
    const teachersRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(teachersRef);

    const teachers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Teacher[];

    // Client-side filtering (Firestore doesn't support full-text search natively)
    return teachers.filter((teacher) =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching teachers:", error);
    throw error;
  }
}

/**
 * Get teachers by department
 */
export async function getTeachersByDepartment(department: string): Promise<Teacher[]> {
  try {
    const teachersRef = collection(db, COLLECTION_NAME);
    const q = query(
      teachersRef,
      where("department", "==", department),
      orderBy("fullName", "asc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Teacher[];
  } catch (error) {
    console.error("Error getting teachers by department:", error);
    throw error;
  }
}

/**
 * Update teacher's total donations count
 */
export async function updateTeacherTotalDonations(
  teacherId: string,
  itemsCount: number
): Promise<void> {
  try {
    const teacherRef = doc(db, COLLECTION_NAME, teacherId);
    const teacher = await getDoc(teacherRef);

    if (teacher.exists()) {
      const currentTotal = teacher.data().totalDonations || 0;
      await updateDoc(teacherRef, {
        totalDonations: currentTotal + itemsCount,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error updating teacher total donations:", error);
    throw error;
  }
}

/**
 * Import multiple teachers in batch
 */
export async function importTeachers(
  teachers: TeacherFormData[]
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ teacher: string; error: string }>;
}> {
  let success = 0;
  let failed = 0;
  const errors: Array<{ teacher: string; error: string }> = [];

  for (const teacherData of teachers) {
    try {
      await createTeacher(teacherData);
      success++;
    } catch (error) {
      failed++;
      errors.push({
        teacher: teacherData.fullName,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return { success, failed, errors };
}

/**
 * Delete multiple teachers by IDs
 */
export async function deleteMultipleTeachers(
  teacherIds: string[]
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ teacherId: string; error: string }>;
}> {
  let success = 0;
  let failed = 0;
  const errors: Array<{ teacherId: string; error: string }> = [];

  for (const id of teacherIds) {
    try {
      await deleteTeacher(id);
      success++;
    } catch (error) {
      failed++;
      errors.push({
        teacherId: id,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return { success, failed, errors };
}
