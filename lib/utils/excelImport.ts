import * as XLSX from "xlsx";
import { StudentImportData, TeacherImportData } from "@/types";

export interface ImportResult {
  success: boolean;
  data?: StudentImportData[];
  error?: string;
}

export interface TeacherImportResult {
  success: boolean;
  data?: TeacherImportData[];
  error?: string;
}

/**
 * Read Excel file and parse student data
 */
export async function readExcelFile(file: File): Promise<ImportResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json<StudentImportData>(sheet);

    if (!jsonData || jsonData.length === 0) {
      return {
        success: false,
        error: "O arquivo está vazio ou não contém dados válidos.",
      };
    }

    // Validate required columns
    const requiredColumns = [
      "Estudante",
      "Série/Ano",
      "Turma",
      "Turno",
      "Coordenação",
      "Matrícula",
      "E-mail",
    ];

    const firstRow = jsonData[0];
    const missingColumns = requiredColumns.filter(
      (col) => !(col in firstRow)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Colunas ausentes: ${missingColumns.join(", ")}`,
      };
    }

    return {
      success: true,
      data: jsonData,
    };
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return {
      success: false,
      error: "Erro ao ler o arquivo. Verifique se é um arquivo Excel válido.",
    };
  }
}

/**
 * Validate student data
 */
export function validateStudentData(
  data: StudentImportData[]
): { valid: StudentImportData[]; invalid: Array<{ row: number; error: string }> } {
  const valid: StudentImportData[] = [];
  const invalid: Array<{ row: number; error: string }> = [];

  data.forEach((row, index) => {
    const errors: string[] = [];

    // Validate Estudante
    if (!row["Estudante"] || row["Estudante"].toString().trim() === "") {
      errors.push("Nome do estudante é obrigatório");
    }

    // Validate Série/Ano
    if (!row["Série/Ano"]) {
      errors.push("Série/Ano é obrigatório");
    }

    // Validate Turma
    if (!row["Turma"] || row["Turma"].toString().trim() === "") {
      errors.push("Turma é obrigatória");
    }

    // Validate E-mail
    if (!row["E-mail"] || row["E-mail"].toString().trim() === "") {
      errors.push("E-mail é obrigatório");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row["E-mail"].toString())) {
        errors.push("E-mail inválido");
      }
    }

    // Validate Matrícula
    if (!row["Matrícula"] || row["Matrícula"].toString().trim() === "") {
      errors.push("Matrícula é obrigatória");
    }

    if (errors.length > 0) {
      invalid.push({
        row: index + 2, // +2 because index starts at 0 and Excel has header row
        error: errors.join(", "),
      });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

/**
 * Convert imported data to StudentFormData
 */
export function convertToStudentFormData(data: StudentImportData) {
  // Parse grade from "Série/Ano" - extract number
  let grade = 0;
  const gradeStr = data["Série/Ano"].toString();
  const gradeMatch = gradeStr.match(/\d+/);
  if (gradeMatch) {
    grade = parseInt(gradeMatch[0]);
  }

  return {
    fullName: data["Estudante"].toString().trim(),
    parentEmail: data["E-mail"].toString().trim(),
    email: data["E-mail"].toString().trim(),
    class: data["Turma"].toString().trim(),
    grade: grade,
    shift: data["Turno"] ? data["Turno"].toString().trim() : undefined,
    coordination: data["Coordenação"]
      ? data["Coordenação"].toString().trim()
      : undefined,
    registrationNumber: data["Matrícula"]
      ? data["Matrícula"].toString().trim()
      : undefined,
    status: "active" as const,
  };
}

/**
 * Read Excel file and parse teacher data
 */
export async function readTeacherExcelFile(file: File): Promise<TeacherImportResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json<TeacherImportData>(sheet);

    if (!jsonData || jsonData.length === 0) {
      return {
        success: false,
        error: "O arquivo está vazio ou não contém dados válidos.",
      };
    }

    // Validate required columns
    const requiredColumns = [
      "Professor",
      "E-mail",
      "Departamento",
      "Matrícula",
      "Telefone",
    ];

    const firstRow = jsonData[0];
    const missingColumns = requiredColumns.filter(
      (col) => !(col in firstRow)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Colunas ausentes: ${missingColumns.join(", ")}`,
      };
    }

    return {
      success: true,
      data: jsonData,
    };
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return {
      success: false,
      error: "Erro ao ler o arquivo. Verifique se é um arquivo Excel válido.",
    };
  }
}

/**
 * Validate teacher data
 */
export function validateTeacherData(
  data: TeacherImportData[]
): { valid: TeacherImportData[]; invalid: Array<{ row: number; error: string }> } {
  const valid: TeacherImportData[] = [];
  const invalid: Array<{ row: number; error: string }> = [];

  data.forEach((row, index) => {
    const errors: string[] = [];

    // Validate Professor
    if (!row["Professor"] || row["Professor"].toString().trim() === "") {
      errors.push("Nome do professor é obrigatório");
    }

    // Validate E-mail
    if (!row["E-mail"] || row["E-mail"].toString().trim() === "") {
      errors.push("E-mail é obrigatório");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row["E-mail"].toString())) {
        errors.push("E-mail inválido");
      }
    }

    if (errors.length > 0) {
      invalid.push({
        row: index + 2, // +2 because index starts at 0 and Excel has header row
        error: errors.join(", "),
      });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

/**
 * Convert imported data to TeacherFormData
 */
export function convertToTeacherFormData(data: TeacherImportData) {
  return {
    fullName: data["Professor"].toString().trim(),
    email: data["E-mail"].toString().trim(),
    department: data["Departamento"] ? data["Departamento"].toString().trim() : undefined,
    registrationNumber: data["Matrícula"]
      ? data["Matrícula"].toString().trim()
      : undefined,
    phone: data["Telefone"] ? data["Telefone"].toString().trim() : undefined,
    status: "active" as const,
  };
}
