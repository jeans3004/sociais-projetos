"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { FileDown, Calendar, Trophy, Users, Medal, Award } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDonations, getDonationsByDateRange } from "@/lib/firebase/donations";
import { getStudents } from "@/lib/firebase/students";
import { Donation, Student } from "@/types";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface StudentRanking {
  studentId: string;
  studentName: string;
  studentClass: string;
  studentGrade: string;
  totalItems: number;
  donationCount: number;
  position: number;
}

interface ClassRanking {
  className: string;
  grade: string;
  totalItems: number;
  donorCount: number;
  studentCount: number;
  participationRate: number;
  position: number;
}

export default function RankingPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
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

  // Get unique classes and grades
  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    students.forEach((s) => {
      if (s.class) classes.add(s.class);
    });
    return Array.from(classes).sort();
  }, [students]);

  const uniqueGrades = useMemo(() => {
    const grades = new Set<string>();
    students.forEach((s) => {
      if (s.grade) grades.add(String(s.grade));
    });
    return Array.from(grades).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  // Calculate student rankings
  const studentRankings = useMemo((): StudentRanking[] => {
    const rankingMap = new Map<string, StudentRanking>();

    filteredDonations.forEach((donation) => {
      if (!donation.studentId) return;

      const student = students.find((s) => s.id === donation.studentId);
      const totalItems = donation.products.reduce((sum, p) => sum + p.quantity, 0);

      if (rankingMap.has(donation.studentId)) {
        const existing = rankingMap.get(donation.studentId)!;
        existing.totalItems += totalItems;
        existing.donationCount += 1;
      } else {
        rankingMap.set(donation.studentId, {
          studentId: donation.studentId,
          studentName: donation.studentName || student?.fullName || "Desconhecido",
          studentClass: donation.studentClass || student?.class || "-",
          studentGrade: donation.studentGrade || String(student?.grade || "-"),
          totalItems,
          donationCount: 1,
          position: 0,
        });
      }
    });

    // Convert to array and sort by total items
    let rankings = Array.from(rankingMap.values())
      .sort((a, b) => b.totalItems - a.totalItems);

    // Apply filters
    if (selectedClass !== "all") {
      rankings = rankings.filter((r) => r.studentClass === selectedClass);
    }
    if (selectedGrade !== "all") {
      rankings = rankings.filter((r) => r.studentGrade === selectedGrade);
    }

    // Add position
    rankings.forEach((r, index) => {
      r.position = index + 1;
    });

    return rankings;
  }, [filteredDonations, students, selectedClass, selectedGrade]);

  // Calculate class rankings
  const classRankings = useMemo((): ClassRanking[] => {
    const rankingMap = new Map<string, ClassRanking>();

    // Count students per class
    const studentsPerClass = new Map<string, number>();
    students.forEach((student) => {
      if (student.class && student.status === "active") {
        const count = studentsPerClass.get(student.class) || 0;
        studentsPerClass.set(student.class, count + 1);
      }
    });

    // Count donations per class
    const donorsPerClass = new Map<string, Set<string>>();
    filteredDonations.forEach((donation) => {
      const className = donation.studentClass;
      if (!className) return;

      const student = students.find((s) => s.id === donation.studentId);
      const totalItems = donation.products.reduce((sum, p) => sum + p.quantity, 0);

      // Track unique donors
      if (!donorsPerClass.has(className)) {
        donorsPerClass.set(className, new Set());
      }
      if (donation.studentId) {
        donorsPerClass.get(className)!.add(donation.studentId);
      }

      if (rankingMap.has(className)) {
        const existing = rankingMap.get(className)!;
        existing.totalItems += totalItems;
      } else {
        rankingMap.set(className, {
          className,
          grade: donation.studentGrade || String(student?.grade || "-"),
          totalItems,
          donorCount: 0,
          studentCount: studentsPerClass.get(className) || 0,
          participationRate: 0,
          position: 0,
        });
      }
    });

    // Calculate donor count and participation rate
    rankingMap.forEach((ranking, className) => {
      ranking.donorCount = donorsPerClass.get(className)?.size || 0;
      ranking.participationRate = ranking.studentCount > 0
        ? (ranking.donorCount / ranking.studentCount) * 100
        : 0;
    });

    // Convert to array and sort by total items
    let rankings = Array.from(rankingMap.values())
      .sort((a, b) => b.totalItems - a.totalItems);

    // Apply grade filter
    if (selectedGrade !== "all") {
      rankings = rankings.filter((r) => r.grade === selectedGrade);
    }

    // Add position
    rankings.forEach((r, index) => {
      r.position = index + 1;
    });

    return rankings;
  }, [filteredDonations, students, selectedGrade]);

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

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setSelectedClass("all");
    setSelectedGrade("all");
    setFilteredDonations(donations);
    toast({
      title: "Filtros limpos",
      description: "Mostrando todos os dados.",
    });
  };

  const handleExportStudentRanking = () => {
    try {
      const data = studentRankings.map((r) => ({
        "Posição": r.position,
        "Aluno": r.studentName,
        "Turma": r.studentClass,
        "Série": r.studentGrade,
        "Total de Itens Doados": r.totalItems,
        "Número de Doações": r.donationCount,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ranking Alunos");

      const fileName = `ranking_alunos_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Exportado com sucesso",
        description: "O ranking de alunos foi exportado para Excel.",
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

  const handleExportClassRanking = () => {
    try {
      const data = classRankings.map((r) => ({
        "Posição": r.position,
        "Turma": r.className,
        "Série": r.grade,
        "Total de Itens Doados": r.totalItems,
        "Alunos Doadores": r.donorCount,
        "Total de Alunos": r.studentCount,
        "Taxa de Participação (%)": r.participationRate.toFixed(1),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ranking Turmas");

      const fileName = `ranking_turmas_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Exportado com sucesso",
        description: "O ranking de turmas foi exportado para Excel.",
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

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground">{position}º</span>;
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ranking de Doadores</h1>
        <p className="text-muted-foreground">
          Visualize quem mais contribuiu com doações e exporte relatórios para os professores
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre por período, turma ou série para gerar o relatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5 items-end">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="grade">Série</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}º Ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Turma</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={handleClearFilter}>
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Doadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{studentRankings.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {studentRankings.reduce((sum, r) => sum + r.totalItems, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Turmas Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{classRankings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Doador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {studentRankings.length > 0
                ? (studentRankings.reduce((sum, r) => sum + r.totalItems, 0) / studentRankings.length).toFixed(1)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Rankings */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Ranking de Alunos</TabsTrigger>
          <TabsTrigger value="classes">Ranking de Turmas</TabsTrigger>
        </TabsList>

        {/* Ranking de Alunos */}
        <TabsContent value="students">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ranking de Alunos</CardTitle>
                <CardDescription>
                  Alunos ordenados pelo total de itens doados
                </CardDescription>
              </div>
              <Button onClick={handleExportStudentRanking} disabled={studentRankings.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Posição</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead className="text-right">Total de Itens</TableHead>
                      <TableHead className="text-right">Nº de Doações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentRankings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Nenhum doador encontrado no período selecionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentRankings.map((ranking) => (
                        <TableRow key={ranking.studentId} className={ranking.position <= 3 ? "bg-muted/50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center justify-center">
                              {getMedalIcon(ranking.position)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{ranking.studentName}</TableCell>
                          <TableCell>{ranking.studentClass}</TableCell>
                          <TableCell>{ranking.studentGrade}º</TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {ranking.totalItems}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {ranking.donationCount}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking de Turmas */}
        <TabsContent value="classes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ranking de Turmas</CardTitle>
                <CardDescription>
                  Turmas ordenadas pelo total de itens doados
                </CardDescription>
              </div>
              <Button onClick={handleExportClassRanking} disabled={classRankings.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Posição</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead className="text-right">Total de Itens</TableHead>
                      <TableHead className="text-right">Doadores</TableHead>
                      <TableHead className="text-right">Total Alunos</TableHead>
                      <TableHead className="text-right">Participação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classRankings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Nenhuma turma encontrada no período selecionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      classRankings.map((ranking) => (
                        <TableRow key={ranking.className} className={ranking.position <= 3 ? "bg-muted/50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center justify-center">
                              {getMedalIcon(ranking.position)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{ranking.className}</TableCell>
                          <TableCell>{ranking.grade}º</TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {ranking.totalItems}
                          </TableCell>
                          <TableCell className="text-right">{ranking.donorCount}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {ranking.studentCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={ranking.participationRate >= 50 ? "text-green-600" : "text-amber-600"}>
                              {ranking.participationRate.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
