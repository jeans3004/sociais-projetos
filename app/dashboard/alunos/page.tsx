"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Upload, Edit, Trash2, Users2, AlertTriangle } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StudentForm } from "@/components/forms/StudentForm";
import { ImportStudentsDialog } from "@/components/ImportStudentsDialog";
import { RemoveDuplicatesDialog } from "@/components/RemoveDuplicatesDialog";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/firebase/students";
import { Student, StudentFormData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  groupStudentsHierarchically,
  getSortedCoordinations,
  getSortedGrades,
  getSortedClasses,
  countStudentsInCoordination,
  countStudentsInGrade,
} from "@/lib/utils/groupStudents";

export default function AlunosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [duplicatesDialogOpen, setDuplicatesDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar alunos",
        description: "Não foi possível carregar a lista de alunos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.coordination &&
          student.coordination
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (student.registrationNumber &&
          student.registrationNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
    setFilteredStudents(filtered);
  };

  const handleCreateStudent = async (data: StudentFormData) => {
    try {
      await createStudent(data);
      await loadStudents();
      toast({
        title: "Aluno criado",
        description: "O aluno foi criado com sucesso.",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar aluno",
        description: "Não foi possível criar o aluno.",
      });
      throw error;
    }
  };

  const handleUpdateStudent = async (data: StudentFormData) => {
    if (!selectedStudent) return;

    try {
      await updateStudent(selectedStudent.id, data);
      await loadStudents();
      toast({
        title: "Aluno atualizado",
        description: "O aluno foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar aluno",
        description: "Não foi possível atualizar o aluno.",
      });
      throw error;
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id);
      await loadStudents();
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir aluno",
        description: "Não foi possível excluir o aluno.",
      });
    }
  };

  const openCreateForm = () => {
    setSelectedStudent(null);
    setFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  // Group students hierarchically
  const groupedStudents = groupStudentsHierarchically(filteredStudents);
  const coordinations = getSortedCoordinations(groupedStudents);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie os alunos cadastrados no sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDuplicatesDialogOpen(true)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Remover Duplicatas
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Excel
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, turma, coordenação, matrícula ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4" />
          <span>
            Exibindo {filteredStudents.length} de {students.length} aluno(s)
          </span>
        </div>
        {coordinations.length > 0 && (
          <span>
            {coordinations.length} coordenação(ões)
          </span>
        )}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum aluno encontrado."
              : "Nenhum aluno cadastrado."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Accordion type="multiple" className="w-full">
            {coordinations.map((coordination) => {
              const grades = groupedStudents[coordination];
              const totalStudents = countStudentsInCoordination(grades);

              return (
                <AccordionItem key={coordination} value={coordination}>
                  <AccordionTrigger className="px-6 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg">
                        {coordination}
                      </span>
                      <Badge variant="secondary">{totalStudents} alunos</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="multiple" className="w-full px-6">
                      {getSortedGrades(grades).map((grade) => {
                        const classes = grades[grade];
                        const gradeTotal = countStudentsInGrade(classes);

                        return (
                          <AccordionItem key={`${coordination}-${grade}`} value={grade}>
                            <AccordionTrigger className="hover:bg-muted/30 px-4">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{grade}</span>
                                <Badge variant="outline">
                                  {gradeTotal} alunos
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <Accordion type="multiple" className="w-full px-4">
                                {getSortedClasses(classes).map((className) => {
                                  const studentsInClass = classes[className];

                                  return (
                                    <AccordionItem
                                      key={`${coordination}-${grade}-${className}`}
                                      value={className}
                                    >
                                      <AccordionTrigger className="hover:bg-muted/20 px-4">
                                        <div className="flex items-center gap-3">
                                          <span className="font-medium">
                                            Turma {className}
                                          </span>
                                          <Badge>
                                            {studentsInClass.length} alunos
                                          </Badge>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="px-4">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Nome</TableHead>
                                              <TableHead>Matrícula</TableHead>
                                              <TableHead>Email</TableHead>
                                              <TableHead>Turno</TableHead>
                                              <TableHead>Itens Doados</TableHead>
                                              <TableHead>Status</TableHead>
                                              <TableHead className="text-right">
                                                Ações
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {studentsInClass.map((student) => (
                                              <TableRow key={student.id}>
                                                <TableCell className="font-medium">
                                                  {student.fullName}
                                                </TableCell>
                                                <TableCell>
                                                  {student.registrationNumber ||
                                                    "-"}
                                                </TableCell>
                                                <TableCell>
                                                  {student.parentEmail}
                                                </TableCell>
                                                <TableCell>
                                                  {student.shift || "-"}
                                                </TableCell>
                                                <TableCell>
                                                  {student.totalDonations || 0} itens
                                                </TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant={
                                                      student.status === "active"
                                                        ? "default"
                                                        : "secondary"
                                                    }
                                                  >
                                                    {student.status === "active"
                                                      ? "Ativo"
                                                      : "Inativo"}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  <div className="flex justify-end gap-2">
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() =>
                                                        openEditForm(student)
                                                      }
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() =>
                                                        openDeleteDialog(student)
                                                      }
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      <StudentForm
        student={selectedStudent}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno{" "}
              <strong>{studentToDelete?.fullName}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportStudentsDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImportComplete={loadStudents}
      />

      <RemoveDuplicatesDialog
        open={duplicatesDialogOpen}
        onClose={() => setDuplicatesDialogOpen(false)}
        onComplete={loadStudents}
      />
        </div>
      )}
    </RoleGuard>
  );
}
