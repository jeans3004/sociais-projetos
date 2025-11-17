"use client";

import { useEffect, useState, useCallback } from "react";
import { FileDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDonations, getDonationsByDateRange } from "@/lib/firebase/donations";
import { getStudents } from "@/lib/firebase/students";
import { Donation, Student } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

export default function RelatoriosPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

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
        description: "Não foi possível carregar os dados.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione o período.",
      });
      return;
    }

    try {
      const filtered = await getDonationsByDateRange(
        new Date(startDate),
        new Date(endDate + "T23:59:59")
      );
      setFilteredDonations(filtered);
      toast({
        title: "Filtro aplicado",
        description: `${filtered.length} doação(ões) encontrada(s).`,
      });
    } catch (error) {
      console.error("Error filtering:", error);
      toast({
        variant: "destructive",
        title: "Erro ao filtrar",
        description: "Não foi possível filtrar as doações.",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      const data = filteredDonations.map((d) => ({
        Aluno: d.studentName,
        Turma: d.studentClass || "",
        Produtos: d.products.map(p => `${p.product}: ${p.quantity} ${p.unit}${p.packageDetail ? ` (${p.packageDetail})` : ""}`).join(", "),
        "Total de Itens": d.products.reduce((sum, p) => sum + p.quantity, 0),
        Data: formatDate(d.date.toDate()),
        "Registrado por": d.registeredByName,
        Observações: d.notes || "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Doações");
      XLSX.writeFile(wb, `doacoes_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Exportado com sucesso",
        description: "O relatório foi exportado para Excel.",
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório.",
      });
    }
  };

  const totalItems = filteredDonations.reduce(
    (sum, d) => sum + d.products.reduce((pSum, p) => pSum + p.quantity, 0),
    0
  );
  const averageItems = filteredDonations.length > 0 ? totalItems / filteredDonations.length : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Visualize e exporte relatórios de doações
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Período</CardTitle>
          <CardDescription>
            Selecione o período para gerar o relatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter}>
              <Calendar className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Doações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filteredDonations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Média de Itens/Doação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{averageItems.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Doações</CardTitle>
            <CardDescription>Lista de doações no período selecionado</CardDescription>
          </div>
          <Button onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Produtos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhuma doação encontrada no período.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{donation.studentName}</TableCell>
                      <TableCell>{donation.studentClass || "-"}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {donation.products.reduce((sum, p) => sum + p.quantity, 0)} itens
                      </TableCell>
                      <TableCell>{formatDate(donation.date.toDate())}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {donation.products.map((p, i) => (
                            <div key={i}>
                              {p.product}: {p.quantity} {p.unit}{p.packageDetail ? ` (${p.packageDetail})` : ""}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
