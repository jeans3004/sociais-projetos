"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  readExcelFile,
  validateStudentData,
  convertToStudentFormData,
} from "@/lib/utils/excelImport";
import { importStudents } from "@/lib/firebase/students";
import { StudentImportData } from "@/types";

interface ImportStudentsDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function ImportStudentsDialog({
  open,
  onClose,
  onImportComplete,
}: ImportStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validData, setValidData] = useState<StudentImportData[]>([]);
  const [invalidData, setInvalidData] = useState<
    Array<{ row: number; error: string }>
  >([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ student: string; error: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file extension
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
      });
      return;
    }

    setFile(selectedFile);
    setValidData([]);
    setInvalidData([]);
    setImportResult(null);

    // Read and validate file
    const result = await readExcelFile(selectedFile);

    if (!result.success || !result.data) {
      toast({
        variant: "destructive",
        title: "Erro ao ler arquivo",
        description: result.error,
      });
      setFile(null);
      return;
    }

    // Validate data
    const { valid, invalid } = validateStudentData(result.data);
    setValidData(valid);
    setInvalidData(invalid);

    if (valid.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum dado válido",
        description: "Todos os registros do arquivo contêm erros.",
      });
    }
  };

  const handleImport = async () => {
    if (validData.length === 0) return;

    setImporting(true);
    setProgress(0);

    try {
      // Convert to StudentFormData
      const studentsToImport = validData.map(convertToStudentFormData);

      // Import students
      const result = await importStudents(studentsToImport);
      setImportResult(result);

      if (result.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${result.success} aluno(s) importado(s) com sucesso.`,
        });
        onImportComplete();
      }

      if (result.failed > 0) {
        toast({
          variant: "destructive",
          title: "Alguns alunos não foram importados",
          description: `${result.failed} aluno(s) falharam na importação.`,
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os alunos.",
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidData([]);
    setInvalidData([]);
    setImportResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Alunos via Excel</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel (.xlsx ou .xls) com os dados dos
            alunos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload area */}
          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!file ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Selecione um arquivo Excel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: .xlsx, .xls
                    </p>
                  </div>
                  <Button onClick={handleSelectFile} variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    onClick={handleSelectFile}
                    variant="outline"
                    size="sm"
                  >
                    Alterar Arquivo
                  </Button>
                </div>
              )}
            </div>

            {/* Required columns info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Colunas obrigatórias:</strong> Estudante, Série/Ano,
                Turma, Turno, Coordenação, Matrícula, E-mail
              </AlertDescription>
            </Alert>
          </div>

          {/* Validation results */}
          {validData.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong className="text-green-600">
                  {validData.length} registro(s) válido(s)
                </strong>{" "}
                pronto(s) para importação
              </AlertDescription>
            </Alert>
          )}

          {invalidData.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{invalidData.length} registro(s) com erro(s):</strong>
                <div className="mt-2 max-h-32 overflow-y-auto text-xs space-y-1">
                  {invalidData.slice(0, 10).map((item, index) => (
                    <div key={index}>
                      Linha {item.row}: {item.error}
                    </div>
                  ))}
                  {invalidData.length > 10 && (
                    <div className="font-medium">
                      ... e mais {invalidData.length - 10} erro(s)
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Import result */}
          {importResult && (
            <div className="space-y-2">
              {importResult.success > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    <strong>{importResult.success} aluno(s)</strong> importado(s)
                    com sucesso
                  </AlertDescription>
                </Alert>
              )}
              {importResult.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{importResult.failed} aluno(s)</strong> falharam na
                    importação
                    {importResult.errors.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto text-xs space-y-1">
                        {importResult.errors.slice(0, 5).map((item, index) => (
                          <div key={index}>
                            {item.student}: {item.error}
                          </div>
                        ))}
                        {importResult.errors.length > 5 && (
                          <div className="font-medium">
                            ... e mais {importResult.errors.length - 5} erro(s)
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Progress bar */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importando alunos...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              Fechar
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || validData.length === 0}
            >
              {importing ? "Importando..." : `Importar ${validData.length} Aluno(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
