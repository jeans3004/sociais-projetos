"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Package,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useDonations } from "@/hooks/useDonations";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { getOrCreateSettings } from "@/lib/firebase/settings";
import { createContestacao } from "@/lib/firebase/contestacoes";
import { ContestacaoFormData, Donation, Settings, Student } from "@/types";
import { formatDate } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { getStudents } from "@/lib/firebase/students";

interface PublicDonationRow {
  id: string;
  className: string;
  displayName: string;
  searchName: string;
  productSummary: string;
  totalQuantity: number;
  date: Date;
  grade?: number;
}

interface ClassPerformanceRow {
  className: string;
  totalQuantity: number;
  donationCount: number;
  donors: number;
  grade?: number;
}

const UNIT_TO_KG: Record<string, number> = {
  kg: 1,
  lt: 1,
  un: 0.5,
  pacote: 0.8,
};

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("pt-BR", options).format(value);

const anonymizeName = (name?: string) => {
  if (!name) return "Participante reservado";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "Participante reservado";
  const firstName = parts[0];
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]?.toUpperCase()}.` : "";
  return `${firstName} ${lastInitial}`.trim();
};

const toDate = (value: Donation["date"]) => {
  if (!value) return new Date();
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  const possible = value as unknown as { seconds?: number; toDate?: () => Date };
  if (possible?.toDate) {
    return possible.toDate();
  }
  if (typeof possible?.seconds === "number") {
    return new Date((possible.seconds || 0) * 1000);
  }
  return new Date(value as unknown as string);
};

const extractGradeFromClass = (className?: string): number | undefined => {
  if (!className) return undefined;
  const match = className.match(/(\d{1,2})/);
  if (!match) return undefined;
  const grade = Number(match[1]);
  return Number.isFinite(grade) ? grade : undefined;
};

const formatClassLabel = (grade?: number, classValue?: string) => {
  const fallback = classValue?.trim();
  if (grade === undefined || Number.isNaN(grade)) {
    return fallback && fallback.length > 0 ? fallback : "Não informado";
  }

  if (!fallback || fallback.length === 0 || fallback === "Não informado") {
    return `${grade}º ano`;
  }

  const normalized = fallback.replace(/\s+/g, " ");
  const gradePattern = new RegExp(`^${grade}(º|o|°)?\\s*`, "i");
  if (gradePattern.test(normalized)) {
    const withoutPrefix = normalized.replace(gradePattern, "").trim();
    return withoutPrefix ? `${grade}º ${withoutPrefix}` : `${grade}º ano`;
  }

  return `${grade}º ${normalized}`;
};

export default function TransparencyPage() {
  const { donations, loading: donationsLoading } = useDonations();
  const { auditLogs, loading: auditLoading } = useAuditLogs(40);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContestacaoFormData>({
    defaultValues: {
      nome: "",
      contato: "",
      referencia: "",
      descricao: "",
    },
  });

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const data = await getOrCreateSettings();
        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("TransparencyPage:settings", error);
      } finally {
        if (mounted) {
          setSettingsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        const data = await getStudents();
        if (mounted) {
          setStudents(data);
        }
      } catch (error) {
        console.error("TransparencyPage:students", error);
      } finally {
        if (mounted) {
          setStudentsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      mounted = false;
    };
  }, []);

  const studentIndex = useMemo(() => {
    const index = new Map<string, Student>();
    students.forEach((student) => {
      index.set(student.id, student);
    });
    return index;
  }, [students]);

  const donationRows = useMemo<PublicDonationRow[]>(() => {
    return donations.map((donation) => {
      const date = toDate(donation.date);
      const totalQuantity = donation.products.reduce((sum, product) => {
        const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
        return sum + quantity;
      }, 0);

      const student = studentIndex.get(donation.studentId);
      const grade = typeof student?.grade === "number" ? student.grade : extractGradeFromClass(donation.studentClass);
      const classSource = student?.class || donation.studentClass || "Não informado";
      const className = formatClassLabel(grade, classSource);

      const productSummary = donation.products
        .map((product) => product.product)
        .filter(Boolean)
        .join(", ");

      return {
        id: donation.id,
        className,
        displayName: anonymizeName(donation.studentName),
        searchName: donation.studentName?.toLowerCase() || "",
        productSummary,
        totalQuantity,
        date,
        grade,
      };
    });
  }, [donations, studentIndex]);

  const classPerformance = useMemo<ClassPerformanceRow[]>(() => {
    const accumulator = new Map<
      string,
      { total: number; donationCount: number; donors: Set<string>; grade?: number }
    >();

    donations.forEach((donation) => {
      const student = studentIndex.get(donation.studentId);
      const grade = typeof student?.grade === "number" ? student.grade : extractGradeFromClass(donation.studentClass);
      const classSource = student?.class || donation.studentClass || "Não informado";
      const className = formatClassLabel(grade, classSource);
      const donationTotal = donation.products.reduce((sum, product) => {
        const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
        return sum + quantity;
      }, 0);

      if (!accumulator.has(className)) {
        accumulator.set(className, {
          total: 0,
          donationCount: 0,
          donors: new Set<string>(),
          grade,
        });
      }

      const entry = accumulator.get(className)!;
      entry.total += donationTotal;
      entry.donationCount += 1;
      if (grade !== undefined) {
        entry.grade = grade;
      }

      const donorKey = donation.studentId || donation.studentName || donation.id;
      if (donorKey) {
        entry.donors.add(donorKey);
      }
    });

    return Array.from(accumulator.entries())
      .map(([className, data]) => ({
        className,
        totalQuantity: data.total,
        donationCount: data.donationCount,
        donors: data.donors.size,
        grade: data.grade,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [donations, studentIndex]);

  const gradeOptions = useMemo(() => {
    const grades = new Set<number>();
    classPerformance.forEach((entry) => {
      if (typeof entry.grade === "number" && !Number.isNaN(entry.grade)) {
        grades.add(entry.grade);
      }
    });
    return Array.from(grades.values()).sort((a, b) => a - b);
  }, [classPerformance]);

  useEffect(() => {
    setSelectedGrade((previous) => {
      if (gradeOptions.length === 0) {
        return null;
      }
      if (previous !== null && gradeOptions.includes(previous)) {
        return previous;
      }
      return gradeOptions[0] ?? null;
    });
  }, [gradeOptions]);

  const filteredClassPerformance = useMemo(() => {
    if (selectedGrade === null) {
      return classPerformance;
    }
    return classPerformance.filter((entry) => entry.grade === selectedGrade);
  }, [classPerformance, selectedGrade]);

  const totalItems = useMemo(() => {
    return donations.reduce((sum, donation) => {
      return (
        sum +
        donation.products.reduce((productSum, product) => {
          const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
          return productSum + quantity;
        }, 0)
      );
    }, 0);
  }, [donations]);

  const estimatedWeight = useMemo(() => {
    return donations.reduce((sum, donation) => {
      return (
        sum +
        donation.products.reduce((productSum, product) => {
          const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
          const unitWeight = UNIT_TO_KG[product.unit] ?? 1;
          return productSum + quantity * unitWeight;
        }, 0)
      );
    }, 0);
  }, [donations]);

  const uniqueDonors = useMemo(() => {
    const donors = new Set<string>();
    donations.forEach((donation) => {
      const donorKey = donation.studentId || donation.studentName || donation.id;
      if (donorKey) {
        donors.add(donorKey);
      }
    });
    return donors.size;
  }, [donations]);

  const goalValue = settings?.monthlyGoal ?? 0;
  const goalProgress = goalValue > 0 ? Math.min(100, (totalItems / goalValue) * 100) : 0;
  const remainingGoal = goalValue > 0 ? Math.max(goalValue - totalItems, 0) : 0;

  const classOptions = useMemo(() => {
    return classPerformance.map((entry) => entry.className).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [classPerformance]);

  const filteredDonations = useMemo(() => {
    return donationRows
      .filter((row) => {
        if (!searchTerm) return true;
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const display = row.displayName.toLowerCase();
        return display.includes(normalizedSearch) || row.searchName.includes(normalizedSearch);
      })
      .filter((row) => {
        if (selectedClass === "all") return true;
        return row.className === selectedClass;
      })
      .sort((a, b) => {
        if (b.totalQuantity !== a.totalQuantity) {
          return b.totalQuantity - a.totalQuantity;
        }
        return b.date.getTime() - a.date.getTime();
      });
  }, [donationRows, searchTerm, selectedClass]);

  const donationsByClassData = useMemo(() => {
    return filteredClassPerformance
      .slice(0, 7)
      .map(({ className, totalQuantity }) => ({ className, total: totalQuantity }));
  }, [filteredClassPerformance]);

  const publicAuditLogs = useMemo(() => {
    return auditLogs
      .filter((log) => !log.sensitive)
      .map((log) => {
        const date = log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date();
        return {
          id: log.id,
          action: log.action,
          entity: log.entity,
          timestamp: date,
        };
      });
  }, [auditLogs]);

  const onSubmit = async (data: ContestacaoFormData) => {
    try {
      await createContestacao(data);
      toast({
        title: "Revisão enviada",
        description: "Recebemos a sua solicitação. A coordenação retornará em breve.",
      });
      reset();
    } catch (error) {
      console.error("TransparencyPage:revisao", error);
      toast({
        variant: "destructive",
        title: "Não foi possível enviar",
        description: "Tente novamente em instantes ou contate a coordenação.",
      });
    }
  };

  const isLoading = donationsLoading || auditLoading || settingsLoading || studentsLoading;
  const engagedClasses = classPerformance.length;
  const topClassTotal = filteredClassPerformance[0]?.totalQuantity ?? 0;
  const hasGoalConfigured = goalValue > 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[360px] max-w-5xl rounded-full bg-gradient-to-br from-sky-200/50 via-indigo-100/40 to-transparent blur-3xl" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-1.5 text-slate-700 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Portal da Transparência
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Transparência total das doações em tempo real
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Acompanhe a evolução da campanha, visualize o desempenho de cada turma e saiba exatamente como as contribuições estão impulsionando nossos resultados.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/80 px-6 py-3 shadow-lg shadow-slate-200/60 backdrop-blur">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-slate-700">Atualizando indicadores oficiais...</span>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            <section>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="group relative overflow-hidden border-none bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur transition">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-transparent opacity-0 transition group-hover:opacity-100" />
                  <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Visão geral</p>
                      <CardTitle className="text-sm font-medium text-slate-600">Doações registradas</CardTitle>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-1">
                    <p className="text-3xl font-semibold text-slate-900">{formatNumber(donations.length)}</p>
                    <p className="text-sm text-slate-500">Total consolidado de registros confirmados</p>
                  </CardContent>
                </Card>
                <Card className="group relative overflow-hidden border-none bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur transition">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-100/70 via-white to-transparent opacity-0 transition group-hover:opacity-100" />
                  <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Impacto</p>
                      <CardTitle className="text-sm font-medium text-slate-600">Itens contabilizados</CardTitle>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                      <Package className="h-5 w-5" />
                    </span>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-1">
                    <p className="text-3xl font-semibold text-slate-900">{formatNumber(totalItems)}</p>
                    <p className="text-sm text-slate-500">Soma total de itens entregues nas doações</p>
                  </CardContent>
                </Card>
                <Card className="group relative overflow-hidden border-none bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur transition">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/70 via-white to-transparent opacity-0 transition group-hover:opacity-100" />
                  <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Estimativa</p>
                      <CardTitle className="text-sm font-medium text-slate-600">Equivalente em kg</CardTitle>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                      <Scale className="h-5 w-5" />
                    </span>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-1">
                    <p className="text-3xl font-semibold text-slate-900">
                      {formatNumber(estimatedWeight, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
                    </p>
                    <p className="text-sm text-slate-500">Conversão aproximada considerando pesos médios dos itens</p>
                  </CardContent>
                </Card>
                <Card className="group relative overflow-hidden border-none bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur transition">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/70 via-white to-transparent opacity-0 transition group-hover:opacity-100" />
                  <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Engajamento</p>
                      <CardTitle className="text-sm font-medium text-slate-600">Doadores únicos</CardTitle>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <Users2 className="h-5 w-5" />
                    </span>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-1">
                    <p className="text-3xl font-semibold text-slate-900">{formatNumber(uniqueDonors)}</p>
                    <p className="text-sm text-slate-500">Participantes distintos que contribuíram com a campanha</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-5">
              <Card className="relative overflow-hidden border-none bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur xl:col-span-3">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-transparent opacity-60" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Transparência reforçada
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Indicadores atualizados para acompanhar a campanha com clareza, confiança e protagonismo das turmas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                      <ShieldCheck className="mt-1 h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="font-medium text-slate-700">Dados auditáveis</p>
                        <p className="text-sm text-slate-600">
                          Cada lançamento passa por validação e fica registrado no histórico público do sistema.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                      <Users2 className="mt-1 h-4 w-4 text-sky-500" />
                      <div>
                        <p className="font-medium text-slate-700">Participação das turmas</p>
                        <p className="text-sm text-slate-600">
                          {engagedClasses > 0 ? (
                            <>
                              {formatNumber(engagedClasses)} turmas ativas somando {formatNumber(uniqueDonors)} doadores únicos.
                            </>
                          ) : (
                            "As turmas aparecerão aqui assim que as primeiras doações forem registradas."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                      <Target className="mt-1 h-4 w-4 text-rose-500" />
                      <div>
                        <p className="font-medium text-slate-700">Acompanhamento da meta</p>
                        <p className="text-sm text-slate-600">
                          {hasGoalConfigured ? (
                            <>
                              Estamos em{" "}
                              <span className="font-semibold text-slate-800">
                                {formatNumber(goalProgress, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                              </span>{" "}
                              da meta mensal
                              {remainingGoal > 0 ? (
                                <>
                                  {" "}com{" "}
                                  <span className="font-semibold text-slate-800">{formatNumber(remainingGoal)}</span> itens pendentes.
                                </>
                              ) : (
                                "."
                              )}
                            </>
                          ) : (
                            "Configure a meta mensal para acompanhar a evolução automaticamente."
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                      <Sparkles className="mt-1 h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="font-medium text-slate-700">Canal direto com a coordenação</p>
                        <p className="text-sm text-slate-600">
                          Dúvidas? Escreva para{" "}
                          <Link href="mailto:coordenacao@christmaster.com.br" className="font-medium text-primary hover:underline">
                            coordenacao@christmaster.com.br
                          </Link>{" "}
                          ou envie mensagem para (81) 99999-0000.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur xl:col-span-2">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Ranking visual por turma
                    </CardTitle>
                    <CardDescription>
                      {selectedGrade
                        ? `Turmas do ${selectedGrade}º ano com maior volume de itens registrados.`
                        : "Turmas com maior volume de itens registrados."}
                    </CardDescription>
                  </div>
                  {gradeOptions.length > 0 ? (
                    <Select
                      value={selectedGrade !== null ? selectedGrade.toString() : undefined}
                      onValueChange={(value) => setSelectedGrade(Number(value))}
                    >
                      <SelectTrigger className="sm:w-[180px]">
                        <SelectValue placeholder="Selecione a série" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            {grade}º ano
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {donationsByClassData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={donationsByClassData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="className" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                          <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} formatter={(value: number) => `${formatNumber(value)} itens`} />
                          <Bar dataKey="total" fill="rgba(59,130,246,0.85)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {selectedGrade
                        ? `Ainda não há dados suficientes para gerar o gráfico do ${selectedGrade}º ano.`
                        : "Ainda não há dados suficientes para gerar o gráfico."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="border-none bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Ranking completo das turmas
                    </CardTitle>
                    <CardDescription>
                      {selectedGrade
                        ? `Ordem definida automaticamente pelas doações das turmas do ${selectedGrade}º ano.`
                        : "Ordem definida automaticamente pela quantidade total de itens doados."}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full border-slate-200/80 bg-white/70 px-4 py-1 text-xs font-medium text-slate-600">
                      Atualizado em tempo real
                    </Badge>
                    {gradeOptions.length > 0 ? (
                      <Select
                        value={selectedGrade !== null ? selectedGrade.toString() : undefined}
                        onValueChange={(value) => setSelectedGrade(Number(value))}
                      >
                        <SelectTrigger className="sm:w-[180px]">
                          <SelectValue placeholder="Selecione a série" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade} value={grade.toString()}>
                              {grade}º ano
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredClassPerformance.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {selectedGrade
                        ? `Nenhuma turma do ${selectedGrade}º ano registrada até o momento. Assim que as doações forem lançadas, o ranking será atualizado aqui.`
                        : "Nenhuma turma registrada até o momento. Assim que as doações forem lançadas, o ranking será atualizado aqui."}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                        {filteredClassPerformance.map((entry, index) => {
                          const progressValue = topClassTotal > 0 ? Math.min(100, (entry.totalQuantity / topClassTotal) * 100) : 0;
                          return (
                            <div
                              key={`${entry.className}-${index}`}
                              className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm">
                                    #{index + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">{entry.className}</p>
                                    <p className="text-xs text-slate-500">
                                      {formatNumber(entry.donors)} doadores • {formatNumber(entry.donationCount)} registros
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">{formatNumber(entry.totalQuantity)} itens</p>
                              </div>
                              <Progress value={progressValue} className="mt-3 h-2" />
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500">
                        Para efeito de comparação justa, as turmas são ordenadas exclusivamente pela quantidade doada, independentemente da data de entrega.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Doações registradas</h2>
                  <p className="text-sm text-slate-600">
                    As entradas abaixo estão ordenadas pela quantidade total de itens doados, com os lançamentos mais recentes como critério de desempate.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative md:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Buscar por participante"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="rounded-full border-slate-200 bg-white/90 pl-9 backdrop-blur"
                    />
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="rounded-full border-slate-200 bg-white/90 backdrop-blur md:w-48">
                      <SelectValue placeholder="Filtrar por turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as turmas</SelectItem>
                      {classOptions.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead>Turma/Série</TableHead>
                      <TableHead>Participante</TableHead>
                      <TableHead>Itens registrados</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                          Nenhuma doação encontrada com os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDonations.map((donation) => (
                        <TableRow key={donation.id} className="transition hover:bg-slate-50/80">
                          <TableCell>
                            <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                              {donation.className}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-700">{donation.displayName}</TableCell>
                          <TableCell className="text-slate-600">{donation.productSummary || "Itens diversos"}</TableCell>
                          <TableCell className="text-right font-semibold text-slate-800">{formatNumber(donation.totalQuantity)}</TableCell>
                          <TableCell className="text-right text-slate-600">{formatDate(donation.date)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

              <section className="grid gap-6 xl:grid-cols-5">
                <Card className="border-none bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Histórico resumido</CardTitle>
                    <CardDescription>Últimos registros de auditoria não sensíveis do sistema.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {publicAuditLogs.length === 0 ? (
                      <p className="text-sm text-slate-500">Ainda não há registros públicos disponíveis.</p>
                    ) : (
                      <ul className="space-y-3">
                        {publicAuditLogs.map((log) => (
                          <li key={log.id} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                                <p className="text-xs text-slate-500">Referência: {log.entity}</p>
                              </div>
                              <span className="text-xs font-medium text-slate-500">{formatDate(log.timestamp)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur xl:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Formulário público de revisão</CardTitle>
                    <CardDescription>Encontrou algum dado incorreto? Envie sua solicitação e retornaremos com a atualização necessária.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          placeholder="Como deseja ser identificado"
                          className="border-slate-200 bg-white/90 backdrop-blur"
                          {...register("nome", { required: "Informe seu nome" })}
                        />
                        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contato">Contato</Label>
                        <Input
                          id="contato"
                          placeholder="WhatsApp ou e-mail"
                          className="border-slate-200 bg-white/90 backdrop-blur"
                          {...register("contato", { required: "Informe um contato para retorno" })}
                        />
                        {errors.contato && <p className="text-xs text-destructive">{errors.contato.message}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="referencia">Referência da doação (opcional)</Label>
                          <Input
                            id="referencia"
                            placeholder="Número do comprovante ou detalhes relevantes"
                            className="border-slate-200 bg-white/90 backdrop-blur"
                            {...register("referencia")}
                          />
                        </div>
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-xs text-slate-500">
                          Use este campo para indicar comprovantes, datas ou outras informações que facilitem a localização do registro.
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="descricao">Descreva o que aconteceu</Label>
                        <Textarea
                          id="descricao"
                          placeholder="Explique o motivo da revisão com o máximo de detalhes possível"
                          className="min-h-[140px] border-slate-200 bg-white/90 backdrop-blur"
                          {...register("descricao", { required: "Descreva a situação para podermos ajudar" })}
                        />
                        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                          Os dados são enviados diretamente para a coordenação e tratados com confidencialidade.
                        </p>
                        <Button type="submit" className="min-w-[180px] gap-2" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                            </>
                          ) : (
                            <>
                              Enviar revisão <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </section>

            </div>
          )}
      </div>
    </main>
  );
}
