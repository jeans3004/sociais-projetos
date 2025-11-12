"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Users2, Upload } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { TeacherForm } from "@/components/forms/TeacherForm";
import { ImportTeachersDialog } from "@/components/ImportTeachersDialog";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/lib/firebase/teachers";
import { Teacher, TeacherFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ProfessoresPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar professores",
        description: "Não foi possível carregar a lista de professores.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Filtering with useMemo
  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return teachers;

    const searchLower = searchTerm.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.fullName.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower) ||
        (teacher.department?.toLowerCase().includes(searchLower)) ||
        (teacher.registrationNumber?.toLowerCase().includes(searchLower))
    );
  }, [searchTerm, teachers]);

  const activeTeachers = useMemo(
    () => filteredTeachers.filter((t) => t.status === "active"),
    [filteredTeachers]
  );

  const inactiveTeachers = useMemo(
    () => filteredTeachers.filter((t) => t.status === "inactive"),
    [filteredTeachers]
  );

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      await deleteTeacher(teacherToDelete.id);
      toast({
        title: "Professor excluído",
        description: "Professor removido com sucesso.",
      });
      loadTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir professor",
        description: "Não foi possível excluir o professor.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleSubmit = async (data: TeacherFormData) => {
    try {
      if (selectedTeacher) {
        await updateTeacher(selectedTeacher.id, data);
        toast({
          title: "Professor atualizado",
          description: "Dados do professor atualizados com sucesso.",
        });
      } else {
        await createTeacher(data);
        toast({
          title: "Professor cadastrado",
          description: "Professor adicionado com sucesso.",
        });
      }
      loadTeachers();
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving teacher:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar professor",
        description: "Não foi possível salvar os dados do professor.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando professores...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Professores</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie o corpo docente da escola
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setImportDialogOpen(true)}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button onClick={handleAddTeacher}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Professor
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Total
                </span>
              </div>
              <p className="text-3xl font-bold mt-2">{teachers.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Ativos
                </span>
              </div>
              <p className="text-3xl font-bold mt-2">{activeTeachers.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Inativos
                </span>
              </div>
              <p className="text-3xl font-bold mt-2">{inactiveTeachers.length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, departamento ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Doações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "Nenhum professor encontrado com os critérios de busca."
                        : "Nenhum professor cadastrado. Clique em 'Novo Professor' para começar."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.fullName}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.department || "-"}</TableCell>
                      <TableCell>{teacher.registrationNumber || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                          {teacher.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{teacher.totalDonations || 0} itens</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(teacher)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Forms and Dialogs */}
        <TeacherForm
          teacher={selectedTeacher}
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedTeacher(null);
          }}
          onSubmit={handleSubmit}
        />

        <ImportTeachersDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImportComplete={loadTeachers}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o professor{" "}
                <strong>{teacherToDelete?.fullName}</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}
