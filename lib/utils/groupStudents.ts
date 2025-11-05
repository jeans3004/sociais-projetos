import { Student } from "@/types";

export interface StudentsByClass {
  [className: string]: Student[];
}

export interface StudentsByGrade {
  [grade: string]: StudentsByClass;
}

export interface StudentsByCoordination {
  [coordination: string]: StudentsByGrade;
}

/**
 * Group students hierarchically by coordination > grade > class
 */
export function groupStudentsHierarchically(
  students: Student[]
): StudentsByCoordination {
  const grouped: StudentsByCoordination = {};

  students.forEach((student) => {
    const coordination = student.coordination || "Sem Coordenação";
    const grade = `${student.grade}º Ano`;
    const className = student.class || "Sem Turma";

    // Initialize coordination if doesn't exist
    if (!grouped[coordination]) {
      grouped[coordination] = {};
    }

    // Initialize grade if doesn't exist
    if (!grouped[coordination][grade]) {
      grouped[coordination][grade] = {};
    }

    // Initialize class if doesn't exist
    if (!grouped[coordination][grade][className]) {
      grouped[coordination][grade][className] = [];
    }

    // Add student to class
    grouped[coordination][grade][className].push(student);
  });

  return grouped;
}

/**
 * Get sorted coordination names
 */
export function getSortedCoordinations(
  grouped: StudentsByCoordination
): string[] {
  return Object.keys(grouped).sort((a, b) => {
    if (a === "Sem Coordenação") return 1;
    if (b === "Sem Coordenação") return -1;
    return a.localeCompare(b);
  });
}

/**
 * Get sorted grade names
 */
export function getSortedGrades(grades: StudentsByGrade): string[] {
  return Object.keys(grades).sort((a, b) => {
    const gradeA = parseInt(a.match(/\d+/)?.[0] || "0");
    const gradeB = parseInt(b.match(/\d+/)?.[0] || "0");
    return gradeA - gradeB;
  });
}

/**
 * Get sorted class names
 */
export function getSortedClasses(classes: StudentsByClass): string[] {
  return Object.keys(classes).sort((a, b) => {
    if (a === "Sem Turma") return 1;
    if (b === "Sem Turma") return -1;
    return a.localeCompare(b);
  });
}

/**
 * Count total students in a coordination
 */
export function countStudentsInCoordination(grades: StudentsByGrade): number {
  let total = 0;
  Object.values(grades).forEach((classes) => {
    Object.values(classes).forEach((students) => {
      total += students.length;
    });
  });
  return total;
}

/**
 * Count total students in a grade
 */
export function countStudentsInGrade(classes: StudentsByClass): number {
  let total = 0;
  Object.values(classes).forEach((students) => {
    total += students.length;
  });
  return total;
}
