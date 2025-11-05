"use client";

import { useState } from "react";
import { AlertCircle, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  findDuplicateStudents,
  deleteMultipleStudents,
} from "@/lib/firebase/students";
import { Student } from "@/types";

interface RemoveDuplicatesDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function RemoveDuplicatesDialog({
  open,
  onClose,
  onComplete,
}: RemoveDuplicatesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<
    Array<{ key: string; students: Student[] }>
  >([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  const handleScanDuplicates = async () => {
    setScanning(true);
    try {
      const found = await findDuplicateStudents();
      setDuplicates(found);
      if (found.length === 0) {
        toast({
          title: "Nenhuma duplicata encontrada",
          description: "Não foram encontrados alunos duplicados no sistema.",
        });
      }
    } catch (error) {
      console.error("Error scanning duplicates:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar duplicatas",
        description: "Não foi possível buscar duplicatas.",
      });
    } finally {
      setScanning(false);
    }
  };

  const toggleSelection = (studentId: string) => {
    const newSelection = new Set(selectedForDeletion);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedForDeletion(newSelection);
  };

  const handleRemoveDuplicates = async () => {
    if (selectedForDeletion.size === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum aluno selecionado",
        description: "Selecione os alunos que deseja remover.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await deleteMultipleStudents(
        Array.from(selectedForDeletion)
      );

      if (result.success > 0) {
        toast({
          title: "Duplicatas removidas",
          description: `${result.success} aluno(s) removido(s) com sucesso.`,
        });
        setSelectedForDeletion(new Set());
        await handleScanDuplicates();
        onComplete();
      }

      if (result.failed > 0) {
        toast({
          variant: "destructive",
          title: "Alguns alunos não foram removidos",
          description: `${result.failed} aluno(s) falharam na remoção.`,
        });
      }
    } catch (error) {
      console.error("Error removing duplicates:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover duplicatas",
        description: "Não foi possível remover os alunos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDuplicates([]);
    setSelectedForDeletion(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Duplicatas</DialogTitle>
          <DialogDescription>
            Busque e remova alunos duplicados do sistema. Alunos são
            considerados duplicados quando possuem o mesmo nome e email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {duplicates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para buscar duplicatas
              </p>
              <Button onClick={handleScanDuplicates} disabled={scanning}>
                {scanning ? "Buscando..." : "Buscar Duplicatas"}
              </Button>
            </div>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{duplicates.length} grupo(s) de duplicatas</strong>{" "}
                  encontrado(s). Selecione os alunos que deseja remover.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {duplicates.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      Grupo {groupIndex + 1} ({group.students.length} alunos)
                    </h4>
                    <div className="space-y-2">
                      {group.students.map((student) => (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                            selectedForDeletion.has(student.id)
                              ? "bg-destructive/10 border-destructive"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleSelection(student.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{student.fullName}</p>
                              <Badge variant="outline">{student.class}</Badge>
                              {student.registrationNumber && (
                                <Badge variant="secondary">
                                  Mat: {student.registrationNumber}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {student.parentEmail}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                              {student.coordination && (
                                <span>Coord: {student.coordination}</span>
                              )}
                              {student.shift && <span>{student.shift}</span>}
                              <span>
                                Doações: {student.totalDonations || 0} itens
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedForDeletion.has(student.id)}
                            onChange={() => toggleSelection(student.id)}
                            className="h-5 w-5"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedForDeletion.size} aluno(s) selecionado(s) para remoção
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleScanDuplicates}>
                    Buscar Novamente
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRemoveDuplicates}
                    disabled={loading || selectedForDeletion.size === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {loading ? "Removendo..." : "Remover Selecionados"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
