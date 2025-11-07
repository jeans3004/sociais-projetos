"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DonationForm } from "@/components/forms/DonationForm";
import {
  getDonations,
  createDonation,
  deleteDonation,
  updateDonation,
} from "@/lib/firebase/donations";
import { getStudents } from "@/lib/firebase/students";
import { Donation, DonationFormData, Student } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function DoacoesPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [donationToDelete, setDonationToDelete] = useState<Donation | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [donationsData, studentsData] = await Promise.all([
        getDonations(),
        getStudents(),
      ]);
      setDonations(donationsData);
      setFilteredDonations(donationsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as doações.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterDonations = useCallback(() => {
    if (!searchTerm) {
      setFilteredDonations(donations);
      return;
    }

    const filtered = donations.filter((donation) =>
      donation.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDonations(filtered);
  }, [searchTerm, donations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterDonations();
  }, [filterDonations]);

  const handleCreateDonation = async (data: DonationFormData) => {
    if (!user) return;

    try {
      await createDonation(data, user.id, user.name);
      await loadData();
      toast({
        title: "Doação registrada",
        description: "A doação foi registrada com sucesso.",
      });
    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar doação",
        description: "Não foi possível registrar a doação.",
      });
      throw error;
    }
  };

  const handleUpdateDonation = async (id: string, data: DonationFormData) => {
    if (!user) return;

    try {
      await updateDonation(id, data);
      await loadData();
      setEditingDonation(null);
      toast({
        title: "Doação atualizada",
        description: "As informações da doação foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating donation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar doação",
        description: "Não foi possível atualizar a doação.",
      });
      throw error;
    }
  };

  const handleDeleteDonation = async () => {
    if (!donationToDelete) return;

    try {
      await deleteDonation(donationToDelete.id);
      await loadData();
      setDeleteDialogOpen(false);
      setDonationToDelete(null);
      toast({
        title: "Doação excluída",
        description: "A doação foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting donation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir doação",
        description: "Não foi possível excluir a doação.",
      });
    }
  };

  const openDeleteDialog = (donation: Donation) => {
    setDonationToDelete(donation);
    setDeleteDialogOpen(true);
  };

  const openDonationDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setDetailsOpen(true);
  };

  const closeDonationDetails = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) {
      setSelectedDonation(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doações</h1>
          <p className="text-muted-foreground">
            Registre e gerencie as doações recebidas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDonation(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Doação
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno ou forma de pagamento..."
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
              <TableHead>Aluno</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Registrado por</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchTerm
                    ? "Nenhuma doação encontrada."
                    : "Nenhuma doação registrada."}
                </TableCell>
              </TableRow>
            ) : (
              filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">
                    {donation.studentName}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {donation.products.reduce((sum, p) => sum + p.quantity, 0)} itens
                  </TableCell>
                  <TableCell>{formatDate(donation.date.toDate())}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {donation.products.map((p, i) => (
                        <div key={i}>
                          {p.product}: {p.quantity} {p.unit}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {donation.registeredByName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingDonation(donation);
                          setFormOpen(true);
                        }}
                        aria-label="Editar doação"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDonationDetails(donation)}
                        aria-label="Ver detalhes da doação"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(donation)}
                        aria-label="Excluir doação"
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
          Mostrando {filteredDonations.length} de {donations.length} doação(ões)
        </p>
        <p className="font-semibold">
          Total de itens:{" "}
          {filteredDonations.reduce(
            (sum, d) => sum + d.products.reduce((pSum, p) => pSum + p.quantity, 0),
            0
          )}
        </p>
      </div>

      <DonationForm
        donation={editingDonation ?? undefined}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingDonation(null);
        }}
        onSubmit={async (data) => {
          if (editingDonation) {
            await handleUpdateDonation(editingDonation.id, data);
          } else {
            await handleCreateDonation(data);
          }
        }}
      />

      <Dialog open={detailsOpen} onOpenChange={closeDonationDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da doação</DialogTitle>
            <DialogDescription>
              Visualize as informações registradas para esta doação.
            </DialogDescription>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Quem doou</p>
                <p className="text-base font-semibold">
                  {selectedDonation.studentName || "Aluno não informado"}
                </p>
                {selectedDonation.studentClass && (
                  <p className="text-sm text-muted-foreground">
                    Turma: {selectedDonation.studentClass}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Quando doou</p>
                <p>{formatDate(selectedDonation.date.toDate())}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">O que doou</p>
                <ul className="space-y-2">
                  {selectedDonation.products.map((product, index) => (
                    <li
                      key={`${product.product}-${index}`}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="font-medium">{product.product}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.quantity} {product.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Quanto doou</p>
                <p className="font-semibold">
                  {selectedDonation.products.reduce(
                    (sum, product) => sum + product.quantity,
                    0
                  )}{" "}
                  itens
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                {selectedDonation.notes ? (
                  <p>{selectedDonation.notes}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    Nenhuma observação registrada.
                  </p>
                )}
              </div>

              {selectedDonation.registeredByName && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Registrado por
                  </p>
                  <p>{selectedDonation.registeredByName}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta doação com{" "}
              {donationToDelete?.products.reduce((sum, p) => sum + p.quantity, 0) || 0} itens? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDonation}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
