"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Shield, User as UserIcon, Check, X } from "lucide-react";
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
import { UserForm } from "@/components/forms/UserForm";
import {
  getUsers,
  createUserRecord,
  deleteUser,
  updateUser,
  approveUser,
  rejectUser,
} from "@/lib/firebase/users";
import { User, UserFormData } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard/dashboard");
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Apenas administradores podem acessar esta página.",
      });
    }
  }, [currentUser, router, toast]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterUsers = useCallback(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleCreateUser = async (data: UserFormData) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Create user record in Firestore
      await createUserRecord(userCredential.user.uid, {
        email: data.email,
        name: data.name,
        role: data.role,
      });

      await loadUsers();
      setFormOpen(false);
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description:
          error.message || "Não foi possível criar o usuário.",
      });
      throw error;
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, {
        name: data.name,
        role: data.role,
      });

      await loadUsers();
      setFormOpen(false);
      setEditingUser(null);
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas.",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário.",
      });
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "Você não pode excluir seu próprio usuário.",
      });
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await deleteUser(userToDelete.id);
      await loadUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
      });
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      await loadUsers();
      toast({
        title: "Usuário aprovado",
        description: "O usuário agora pode acessar o sistema.",
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aprovar usuário",
        description: "Não foi possível aprovar o usuário.",
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId);
      await loadUsers();
      toast({
        title: "Usuário rejeitado",
        description: "O acesso do usuário foi negado.",
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar usuário",
        description: "Não foi possível rejeitar o usuário.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if user is not admin
  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
          {users.filter((u) => u.status === "pending").length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {users.filter((u) => u.status === "pending").length} usuário(s) aguardando aprovação
              </Badge>
            </div>
          )}
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchTerm
                    ? "Nenhum usuário encontrado."
                    : "Nenhum usuário cadastrado."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {user.role === "admin" ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <UserIcon className="h-3 w-3" />
                      )}
                      {user.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "approved"
                          ? "default"
                          : user.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {user.status === "approved"
                        ? "Aprovado"
                        : user.status === "pending"
                        ? "Pendente"
                        : "Rejeitado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.lastLogin.toDate())}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveUser(user.id)}
                            title="Aprovar usuário"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectUser(user.id)}
                            title="Rejeitar usuário"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {user.status === "rejected" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproveUser(user.id)}
                          title="Aprovar usuário"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(user)}
                        disabled={user.id === currentUser?.id}
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Mostrando {filteredUsers.length} de {users.length} usuário(s)
        </p>
        <div className="flex gap-4">
          <p className="font-semibold">
            Administradores: {users.filter((u) => u.role === "admin").length}
          </p>
          <p className="font-semibold">
            Usuários: {users.filter((u) => u.role === "user").length}
          </p>
          <p className="font-semibold text-yellow-600">
            Pendentes: {users.filter((u) => u.status === "pending").length}
          </p>
        </div>
      </div>

      <UserForm
        user={editingUser}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {userToDelete?.name}? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
