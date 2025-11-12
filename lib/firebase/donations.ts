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
import { updateTeacherTotalDonations, getTeacher, getTeachers } from "./teachers";
import { formatGradeLabel } from "@/lib/utils";

const COLLECTION_NAME = "donations";

/**
 * Remove undefined fields from an object
 * Firebase doesn't accept undefined values
 */
function removeUndefinedFields(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

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
    let donationData: Record<string, any> = {
      donorType: data.donorType,
      date: Timestamp.fromDate(data.date),
      products: data.products,
      notes: data.notes,
      receiptUrl: data.receiptUrl,
      registeredBy: userId,
      registeredByName: userName,
      createdAt: Timestamp.now(),
    };

    // Calculate total items donated
    const totalItems = data.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    if (data.donorType === "student") {
      // Suporta seleção múltipla (studentIds) ou única (studentId)
      const studentIds = data.studentIds && data.studentIds.length > 0
        ? data.studentIds
        : (data.studentId ? [data.studentId] : []);

      if (studentIds.length === 0) {
        throw new Error("Student ID(s) required");
      }

      // Buscar todos os alunos selecionados
      const studentsPromises = studentIds.map(id => getStudent(id));
      const students = await Promise.all(studentsPromises);

      // Verificar se todos foram encontrados
      const missingStudents = students.filter(s => !s);
      if (missingStudents.length > 0) {
        throw new Error("One or more students not found");
      }

      const validStudents = students.filter(s => s !== null) as any[];

      // Determinar o nome do doador
      let donorName: string;
      let isMultipleStudents = false;

      if (validStudents.length === 1) {
        donorName = validStudents[0].fullName;
      } else {
        donorName = `${validStudents.length} alunos`;
        isMultipleStudents = true;
      }

      donationData = {
        ...donationData,
        studentIds: studentIds,
        donorName: donorName,
        isMultipleStudents: isMultipleStudents,
        // Manter studentId para compatibilidade (primeiro da lista)
        studentId: studentIds[0],
        studentName: validStudents[0].fullName, // Legacy field
        studentClass: validStudents.length === 1 ? validStudents[0].class : undefined,
        studentGrade: validStudents.length === 1 ? formatGradeLabel(validStudents[0].grade, validStudents[0].coordination) : undefined,
      };

      // Update total donations count for all selected students
      for (const studentId of studentIds) {
        await updateStudentTotalDonations(studentId, totalItems);
      }
    } else if (data.donorType === "teacher") {
      // Suporta seleção múltipla (teacherIds) ou única (teacherId)
      const teacherIds = data.teacherIds && data.teacherIds.length > 0
        ? data.teacherIds
        : (data.teacherId ? [data.teacherId] : []);

      if (teacherIds.length === 0) {
        throw new Error("Teacher ID(s) required");
      }

      // Buscar todos os professores selecionados
      const teachersPromises = teacherIds.map(id => getTeacher(id));
      const teachers = await Promise.all(teachersPromises);

      // Verificar se todos foram encontrados
      const missingTeachers = teachers.filter(t => !t);
      if (missingTeachers.length > 0) {
        throw new Error("One or more teachers not found");
      }

      const validTeachers = teachers.filter(t => t !== null) as any[];

      // Determinar o nome do doador
      let donorName: string;
      let isCorpoDocente = false;

      // Buscar total de professores ativos para comparar
      const allTeachers = await getTeachers();
      const activeTeachers = allTeachers.filter(t => t.status === "active");

      if (teacherIds.length === activeTeachers.length && activeTeachers.length > 0) {
        // Todos os professores ativos foram selecionados
        donorName = "Corpo Docente";
        isCorpoDocente = true;
      } else if (validTeachers.length === 1) {
        donorName = validTeachers[0].fullName;
      } else {
        donorName = `${validTeachers.length} professores`;
      }

      donationData = {
        ...donationData,
        teacherIds: teacherIds,
        donorName: donorName,
        isCorpoDocente: isCorpoDocente,
        // Manter teacherId para compatibilidade (primeiro da lista)
        teacherId: teacherIds[0],
        teacherDepartment: validTeachers.length === 1 ? validTeachers[0].department : undefined,
      };

      // Update total donations count for all selected teachers
      for (const teacherId of teacherIds) {
        await updateTeacherTotalDonations(teacherId, totalItems);
      }
    }

    // Remove undefined fields before saving to Firebase
    const cleanedData = removeUndefinedFields(donationData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);

    return { id: docRef.id, ...cleanedData } as Donation;
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
  data: DonationFormData,
  userId: string,
  userName: string
): Promise<void> {
  try {
    const donationRef = doc(db, COLLECTION_NAME, id);
    const existingDonation = await getDonation(id);

    if (!existingDonation) {
      throw new Error("Donation not found");
    }

    const previousTotal = existingDonation.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    const newTotal = data.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    let updateData: Record<string, any> = {
      donorType: data.donorType,
      date: Timestamp.fromDate(data.date),
      products: data.products,
      notes: data.notes,
      receiptUrl: data.receiptUrl,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
      updatedByName: userName,
    };

    if (data.donorType === "student") {
      // Suporta seleção múltipla (studentIds) ou única (studentId)
      const studentIds = data.studentIds && data.studentIds.length > 0
        ? data.studentIds
        : (data.studentId ? [data.studentId] : []);

      if (studentIds.length === 0) {
        throw new Error("Student ID(s) required");
      }

      // Buscar todos os alunos selecionados
      const studentsPromises = studentIds.map(id => getStudent(id));
      const students = await Promise.all(studentsPromises);

      // Verificar se todos foram encontrados
      const missingStudents = students.filter(s => !s);
      if (missingStudents.length > 0) {
        throw new Error("One or more students not found");
      }

      const validStudents = students.filter(s => s !== null) as any[];

      // Determinar o nome do doador
      let donorName: string;
      let isMultipleStudents = false;

      if (validStudents.length === 1) {
        donorName = validStudents[0].fullName;
      } else {
        donorName = `${validStudents.length} alunos`;
        isMultipleStudents = true;
      }

      updateData = {
        ...updateData,
        studentIds: studentIds,
        donorName: donorName,
        isMultipleStudents: isMultipleStudents,
        // Manter studentId para compatibilidade (primeiro da lista)
        studentId: studentIds[0],
        studentName: validStudents[0].fullName, // Legacy field
        studentClass: validStudents.length === 1 ? validStudents[0].class : undefined,
        studentGrade: validStudents.length === 1 ? formatGradeLabel(validStudents[0].grade, validStudents[0].coordination) : undefined,
      };

      // Handle donor change or total change
      const existingDonorType = existingDonation.donorType || "student";
      const existingStudentIds = existingDonation.studentIds || (existingDonation.studentId ? [existingDonation.studentId] : []);

      if (existingDonorType === "teacher") {
        // Changed from teacher to student - remove from all teachers, add to all students
        const existingTeacherIds = existingDonation.teacherIds || (existingDonation.teacherId ? [existingDonation.teacherId] : []);
        for (const teacherId of existingTeacherIds) {
          await updateTeacherTotalDonations(teacherId, -previousTotal);
        }
        for (const studentId of studentIds) {
          await updateStudentTotalDonations(studentId, newTotal);
        }
      } else {
        // Handle student changes
        const removedStudents = existingStudentIds.filter(id => !studentIds.includes(id));
        const addedStudents = studentIds.filter(id => !existingStudentIds.includes(id));
        const unchangedStudents = studentIds.filter(id => existingStudentIds.includes(id));

        // Remove from students that are no longer selected
        for (const studentId of removedStudents) {
          await updateStudentTotalDonations(studentId, -previousTotal);
        }

        // Add to newly selected students
        for (const studentId of addedStudents) {
          await updateStudentTotalDonations(studentId, newTotal);
        }

        // Update unchanged students if total changed
        const difference = newTotal - previousTotal;
        if (difference !== 0) {
          for (const studentId of unchangedStudents) {
            await updateStudentTotalDonations(studentId, difference);
          }
        }
      }
    } else if (data.donorType === "teacher") {
      // Suporta seleção múltipla (teacherIds) ou única (teacherId)
      const teacherIds = data.teacherIds && data.teacherIds.length > 0
        ? data.teacherIds
        : (data.teacherId ? [data.teacherId] : []);

      if (teacherIds.length === 0) {
        throw new Error("Teacher ID(s) required");
      }

      // Buscar todos os professores selecionados
      const teachersPromises = teacherIds.map(id => getTeacher(id));
      const teachers = await Promise.all(teachersPromises);

      // Verificar se todos foram encontrados
      const missingTeachers = teachers.filter(t => !t);
      if (missingTeachers.length > 0) {
        throw new Error("One or more teachers not found");
      }

      const validTeachers = teachers.filter(t => t !== null) as any[];

      // Determinar o nome do doador
      let donorName: string;
      let isCorpoDocente = false;

      // Buscar total de professores ativos para comparar
      const allTeachers = await getTeachers();
      const activeTeachers = allTeachers.filter(t => t.status === "active");

      if (teacherIds.length === activeTeachers.length && activeTeachers.length > 0) {
        // Todos os professores ativos foram selecionados
        donorName = "Corpo Docente";
        isCorpoDocente = true;
      } else if (validTeachers.length === 1) {
        donorName = validTeachers[0].fullName;
      } else {
        donorName = `${validTeachers.length} professores`;
      }

      updateData = {
        ...updateData,
        teacherIds: teacherIds,
        donorName: donorName,
        isCorpoDocente: isCorpoDocente,
        // Manter teacherId para compatibilidade (primeiro da lista)
        teacherId: teacherIds[0],
        teacherDepartment: validTeachers.length === 1 ? validTeachers[0].department : undefined,
      };

      // Handle donor change or total change
      const existingDonorType = existingDonation.donorType || "student";
      const existingTeacherIds = existingDonation.teacherIds || (existingDonation.teacherId ? [existingDonation.teacherId] : []);

      if (existingDonorType === "student") {
        // Changed from student to teacher - remove from all students, add to all teachers
        const existingStudentIds = existingDonation.studentIds || (existingDonation.studentId ? [existingDonation.studentId] : []);
        for (const studentId of existingStudentIds) {
          await updateStudentTotalDonations(studentId, -previousTotal);
        }
        for (const teacherId of teacherIds) {
          await updateTeacherTotalDonations(teacherId, newTotal);
        }
      } else {
        // Handle teacher changes
        const removedTeachers = existingTeacherIds.filter(id => !teacherIds.includes(id));
        const addedTeachers = teacherIds.filter(id => !existingTeacherIds.includes(id));
        const unchangedTeachers = teacherIds.filter(id => existingTeacherIds.includes(id));

        // Remove from teachers that are no longer selected
        for (const teacherId of removedTeachers) {
          await updateTeacherTotalDonations(teacherId, -previousTotal);
        }

        // Add to newly selected teachers
        for (const teacherId of addedTeachers) {
          await updateTeacherTotalDonations(teacherId, newTotal);
        }

        // Update unchanged teachers if total changed
        const difference = newTotal - previousTotal;
        if (difference !== 0) {
          for (const teacherId of unchangedTeachers) {
            await updateTeacherTotalDonations(teacherId, difference);
          }
        }
      }
    }

    // Remove undefined fields before updating Firebase
    const cleanedUpdateData = removeUndefinedFields(updateData);
    await updateDoc(donationRef, cleanedUpdateData);
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

    // Get donation data to update donor total
    const donation = await getDonation(id);
    if (donation) {
      const totalItems = donation.products.reduce(
        (sum, product) => sum + product.quantity,
        0
      );

      const donorType = donation.donorType || "student";

      if (donorType === "student") {
        // Suporta múltiplos alunos
        const studentIds = donation.studentIds || (donation.studentId ? [donation.studentId] : []);
        for (const studentId of studentIds) {
          await updateStudentTotalDonations(studentId, -totalItems);
        }
      } else if (donorType === "teacher") {
        // Suporta múltiplos professores
        const teacherIds = donation.teacherIds || (donation.teacherId ? [donation.teacherId] : []);
        for (const teacherId of teacherIds) {
          await updateTeacherTotalDonations(teacherId, -totalItems);
        }
      }
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
 * Get donations by teacher
 */
export async function getDonationsByTeacher(teacherId: string): Promise<Donation[]> {
  try {
    const donationsRef = collection(db, COLLECTION_NAME);
    const q = query(
      donationsRef,
      where("teacherId", "==", teacherId),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Donation[];
  } catch (error) {
    console.error("Error getting donations by teacher:", error);
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
