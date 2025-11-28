"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Users2,
  Package,
  Target,
  ArrowUp,
  Loader2,
  ShieldCheck,
  Sparkles,
  FileDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { getDonations } from "@/lib/firebase/donations";
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

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("pt-BR", options).format(value);

const anonymizeName = (name?: string) => {
  if (!name) return "Participante";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "Participante";
  const firstName = parts[0];
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]?.toUpperCase()}.` : "";
  return `${firstName} ${lastInitial}`.trim();
};

export default function PublicRankingPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [donationsData, studentsData] = await Promise.all([
          getDonations(),
          getStudents(),
        ]);
        if (mounted) {
          setDonations(donationsData);
          setStudents(studentsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Get unique grades
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

    donations.forEach((donation) => {
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

    // Apply grade filter
    if (selectedGrade !== "all") {
      rankings = rankings.filter((r) => r.studentGrade === selectedGrade);
    }

    // Add position
    rankings.forEach((r, index) => {
      r.position = index + 1;
    });

    return rankings;
  }, [donations, students, selectedGrade]);

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
    donations.forEach((donation) => {
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
  }, [donations, students, selectedGrade]);

  const totalItems = useMemo(() => {
    return donations.reduce((sum, donation) => {
      return sum + donation.products.reduce((pSum, p) => pSum + p.quantity, 0);
    }, 0);
  }, [donations]);

  const uniqueDonors = useMemo(() => {
    const donors = new Set<string>();
    donations.forEach((donation) => {
      if (donation.studentId) donors.add(donation.studentId);
    });
    return donors.size;
  }, [donations]);

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium text-slate-500">{position}º</span>;
  };

  const handleExportStudentRanking = () => {
    try {
      const data = studentRankings.map((r) => ({
        "Posição": r.position,
        "Aluno": anonymizeName(r.studentName),
        "Turma": r.studentClass,
        "Série": `${r.studentGrade}º`,
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
        "Série": `${r.grade}º`,
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

  const topClassTotal = classRankings[0]?.totalItems ?? 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div
        id="topo-ranking"
        className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-4xl border border-slate-200/70 bg-white/70 px-6 py-12 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="pointer-events-none absolute -top-32 left-0 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 right-0 h-72 w-72 rounded-full bg-yellow-200/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_55%)]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-1.5 text-slate-700 shadow-sm backdrop-blur"
            >
              <Trophy className="h-4 w-4 text-amber-500" /> Ranking de Doadores
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Quem mais contribuiu com a campanha
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Confira o ranking dos alunos e turmas que mais doaram. Dados atualizados em tempo real para acompanhamento da comunidade escolar.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20">
                <Link href="#ranking-alunos">Ver Ranking de Alunos</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-slate-200/80 bg-white/80 px-6 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
              >
                <Link href="#ranking-turmas">Ver Ranking de Turmas</Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <dl className="relative z-10 mt-10 grid gap-4 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:bg-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doadores</p>
                  <p className="text-2xl font-semibold text-slate-900">{formatNumber(uniqueDonors)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Alunos que já contribuíram</p>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:bg-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10">
                  <Package className="h-5 w-5 text-sky-500" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total de Itens</p>
                  <p className="text-2xl font-semibold text-slate-900">{formatNumber(totalItems)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Itens doados no total</p>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:bg-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10">
                  <Users2 className="h-5 w-5 text-indigo-500" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Turmas</p>
                  <p className="text-2xl font-semibold text-slate-900">{formatNumber(classRankings.length)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Turmas participantes</p>
            </div>
          </dl>
        </section>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/80 px-6 py-3 shadow-lg shadow-slate-200/60 backdrop-blur">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-slate-700">Carregando ranking...</span>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {/* Grade Filter */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <span className="text-sm font-medium text-slate-600">Filtrar por série:</span>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-[140px] rounded-full border-slate-200 bg-white/90">
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
            </div>

            {/* Tabs with Rankings */}
            <Tabs defaultValue="students" className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="rounded-full bg-white/80 p-1 shadow-sm backdrop-blur">
                  <TabsTrigger value="students" className="rounded-full px-6">
                    Ranking de Alunos
                  </TabsTrigger>
                  <TabsTrigger value="classes" className="rounded-full px-6">
                    Ranking de Turmas
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Student Ranking */}
              <TabsContent value="students" id="ranking-alunos">
                <section className="rounded-4xl border border-slate-200/70 bg-white/60 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.05)] backdrop-blur">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Ranking de Alunos
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Alunos ordenados pelo total de itens doados
                      </p>
                    </div>
                    <Button
                      onClick={handleExportStudentRanking}
                      disabled={studentRankings.length === 0}
                      className="rounded-full"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </Button>
                  </div>

                  {/* Top 3 Podium */}
                  {studentRankings.length >= 3 && (
                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                      {/* 2nd Place */}
                      <div className="order-1 sm:order-1 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center shadow-sm">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 shadow-inner">
                          <Medal className="h-8 w-8 text-gray-500" />
                        </div>
                        <p className="text-lg font-semibold text-slate-800">2º Lugar</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">{anonymizeName(studentRankings[1].studentName)}</p>
                        <p className="text-xs text-slate-500">{studentRankings[1].studentClass}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-600">{formatNumber(studentRankings[1].totalItems)}</p>
                        <p className="text-xs text-slate-500">itens</p>
                      </div>
                      {/* 1st Place */}
                      <div className="order-0 sm:order-2 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-100 p-6 text-center shadow-lg sm:-mt-4">
                        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 shadow-lg">
                          <Trophy className="h-10 w-10 text-white" />
                        </div>
                        <p className="text-xl font-bold text-amber-800">1º Lugar</p>
                        <p className="mt-1 text-base font-semibold text-slate-700">{anonymizeName(studentRankings[0].studentName)}</p>
                        <p className="text-sm text-slate-500">{studentRankings[0].studentClass}</p>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{formatNumber(studentRankings[0].totalItems)}</p>
                        <p className="text-sm text-slate-500">itens</p>
                      </div>
                      {/* 3rd Place */}
                      <div className="order-2 sm:order-3 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-orange-50 to-amber-100 p-6 text-center shadow-sm">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-inner">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-lg font-semibold text-amber-800">3º Lugar</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">{anonymizeName(studentRankings[2].studentName)}</p>
                        <p className="text-xs text-slate-500">{studentRankings[2].studentClass}</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">{formatNumber(studentRankings[2].totalItems)}</p>
                        <p className="text-xs text-slate-500">itens</p>
                      </div>
                    </div>
                  )}

                  {/* Full Table */}
                  <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                    <Table>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow>
                          <TableHead className="w-16 text-center">Pos.</TableHead>
                          <TableHead>Aluno</TableHead>
                          <TableHead>Turma</TableHead>
                          <TableHead>Série</TableHead>
                          <TableHead className="text-right">Total de Itens</TableHead>
                          <TableHead className="text-right">Doações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentRankings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                              Nenhum doador encontrado.
                            </TableCell>
                          </TableRow>
                        ) : (
                          studentRankings.map((ranking) => (
                            <TableRow
                              key={ranking.studentId}
                              className={`transition hover:bg-slate-50/80 ${ranking.position <= 3 ? "bg-amber-50/30" : ""}`}
                            >
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center">
                                  {getMedalIcon(ranking.position)}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-slate-700">
                                {anonymizeName(ranking.studentName)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                                  {ranking.studentClass}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">{ranking.studentGrade}º</TableCell>
                              <TableCell className="text-right font-bold text-green-600">
                                {formatNumber(ranking.totalItems)}
                              </TableCell>
                              <TableCell className="text-right text-slate-500">
                                {ranking.donationCount}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              </TabsContent>

              {/* Class Ranking */}
              <TabsContent value="classes" id="ranking-turmas">
                <section className="rounded-4xl border border-slate-200/70 bg-white/60 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.05)] backdrop-blur">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                        <Users2 className="h-5 w-5 text-indigo-500" />
                        Ranking de Turmas
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Turmas ordenadas pelo total de itens doados
                      </p>
                    </div>
                    <Button
                      onClick={handleExportClassRanking}
                      disabled={classRankings.length === 0}
                      className="rounded-full"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </Button>
                  </div>

                  {/* Class Cards */}
                  {classRankings.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      Nenhuma turma encontrada.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {classRankings.map((ranking) => {
                        const progressValue = topClassTotal > 0 ? Math.min(100, (ranking.totalItems / topClassTotal) * 100) : 0;
                        return (
                          <div
                            key={ranking.className}
                            className={`rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${
                              ranking.position <= 3
                                ? "border-amber-200/80 bg-gradient-to-r from-amber-50/50 to-white"
                                : "border-slate-200/80 bg-white/80"
                            }`}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                  ranking.position === 1 ? "bg-gradient-to-br from-amber-300 to-yellow-400 text-white" :
                                  ranking.position === 2 ? "bg-gray-200 text-gray-600" :
                                  ranking.position === 3 ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" :
                                  "bg-slate-100 text-slate-600"
                                }`}>
                                  {ranking.position <= 3 ? getMedalIcon(ranking.position) : (
                                    <span className="text-lg font-bold">{ranking.position}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-slate-800">{ranking.className}</p>
                                  <p className="text-sm text-slate-500">
                                    {ranking.donorCount} doadores • {ranking.grade}º ano
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{formatNumber(ranking.totalItems)}</p>
                                <p className="text-sm text-slate-500">itens doados</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="mb-1 flex justify-between text-xs text-slate-500">
                                <span>Participação: {ranking.participationRate.toFixed(1)}%</span>
                                <span>{ranking.donorCount} de {ranking.studentCount} alunos</span>
                              </div>
                              <Progress value={progressValue} className="h-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex justify-center">
              <Link
                href="#topo-ranking"
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white/60 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/20 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <ArrowUp className="h-4 w-4" /> Voltar ao topo
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
