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
import { Student, StudentFormData } from "@/types";

const COLLECTION_NAME = "students";

/**
 * Get all students
 */
export async function getStudents(): Promise<Student[]> {
  try {
    const studentsRef = collection(db, COLLECTION_NAME);
    const q = query(studentsRef, orderBy("fullName", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];
  } catch (error) {
    console.error("Error getting students:", error);
    throw error;
  }
}

/**
 * Get students with pagination
 */
export async function getStudentsPaginated(
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ students: Student[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const studentsRef = collection(db, COLLECTION_NAME);
    let q = query(studentsRef, orderBy("fullName", "asc"), limit(pageSize));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];

    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { students, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error getting paginated students:", error);
    throw error;
  }
}

/**
 * Get student by ID
 */
export async function getStudent(id: string): Promise<Student | null> {
  try {
    const studentRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(studentRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Student;
    }
    return null;
  } catch (error) {
    console.error("Error getting student:", error);
    throw error;
  }
}

/**
 * Create new student
 */
export async function createStudent(data: StudentFormData): Promise<Student> {
  try {
    const now = Timestamp.now();
    const studentData = {
      ...data,
      totalDonations: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), studentData);
    return { id: docRef.id, ...studentData } as Student;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
}

/**
 * Update student
 */
export async function updateStudent(
  id: string,
  data: Partial<StudentFormData>
): Promise<void> {
  try {
    const studentRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(studentRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
}

/**
 * Delete student
 */
export async function deleteStudent(id: string): Promise<void> {
  try {
    const studentRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(studentRef);
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}

/**
 * Search students by name
 */
export async function searchStudents(searchTerm: string): Promise<Student[]> {
  try {
    const studentsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(studentsRef);

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];

    // Client-side filtering (Firestore doesn't support full-text search natively)
    return students.filter((student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
}

/**
 * Get students by class
 */
export async function getStudentsByClass(className: string): Promise<Student[]> {
  try {
    const studentsRef = collection(db, COLLECTION_NAME);
    const q = query(
      studentsRef,
      where("class", "==", className),
      orderBy("fullName", "asc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];
  } catch (error) {
    console.error("Error getting students by class:", error);
    throw error;
  }
}

/**
 * Update student's total donations count
 */
export async function updateStudentTotalDonations(
  studentId: string,
  itemsCount: number
): Promise<void> {
  try {
    const studentRef = doc(db, COLLECTION_NAME, studentId);
    const student = await getDoc(studentRef);

    if (student.exists()) {
      const currentTotal = student.data().totalDonations || 0;
      await updateDoc(studentRef, {
        totalDonations: currentTotal + itemsCount,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error updating student total donations:", error);
    throw error;
  }
}

/**
 * @deprecated Use updateStudentTotalDonations instead
 */
export async function updateStudentTotalDonated(
  studentId: string,
  amount: number
): Promise<void> {
  return updateStudentTotalDonations(studentId, amount);
}

/**
 * Import multiple students in batch
 */
export async function importStudents(
  students: StudentFormData[]
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ student: string; error: string }>;
}> {
  let success = 0;
  let failed = 0;
  const errors: Array<{ student: string; error: string }> = [];

  for (const studentData of students) {
    try {
      await createStudent(studentData);
      success++;
    } catch (error) {
      failed++;
      errors.push({
        student: studentData.fullName,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return { success, failed, errors };
}

/**
 * Find duplicate students
 */
export async function findDuplicateStudents(): Promise<
  Array<{
    key: string;
    students: Student[];
  }>
> {
  try {
    const students = await getStudents();
    const duplicates = new Map<string, Student[]>();

    students.forEach((student) => {
      // Create a key based on name + email or name + registration number
      const key = `${student.fullName.toLowerCase().trim()}_${(
        student.parentEmail || student.registrationNumber || ""
      )
        .toLowerCase()
        .trim()}`;

      if (!duplicates.has(key)) {
        duplicates.set(key, []);
      }
      duplicates.get(key)!.push(student);
    });

    // Filter only groups with more than one student
    const result: Array<{ key: string; students: Student[] }> = [];
    duplicates.forEach((studentList, key) => {
      if (studentList.length > 1) {
        result.push({ key, students: studentList });
      }
    });

    return result;
  } catch (error) {
    console.error("Error finding duplicates:", error);
    throw error;
  }
}

/**
 * Delete multiple students by IDs
 */
export async function deleteMultipleStudents(
  studentIds: string[]
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ studentId: string; error: string }>;
}> {
  let success = 0;
  let failed = 0;
  const errors: Array<{ studentId: string; error: string }> = [];

  for (const id of studentIds) {
    try {
      await deleteStudent(id);
      success++;
    } catch (error) {
      failed++;
      errors.push({
        studentId: id,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return { success, failed, errors };
}
