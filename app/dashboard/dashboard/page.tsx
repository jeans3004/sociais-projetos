"use client";

import { useEffect, useState } from "react";
import { DollarSign, Users, Target, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { ClassRankingCard } from "@/components/dashboard/ClassRankingCard";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDonations } from "@/lib/firebase/donations";
import { getStudents } from "@/lib/firebase/students";
import { getOrCreateSettings } from "@/lib/firebase/settings";
import { formatCurrency } from "@/lib/utils";
import {
  calculateDashboardMetrics,
  getMonthlyData,
  getClassRankings,
} from "@/lib/utils/dashboard";
import { Donation, Student, Settings, DashboardMetrics, MonthlyData, ClassRanking } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [rankings, setRankings] = useState<ClassRanking[]>([]);
  const [grades, setGrades] = useState<number[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsData, studentsData, settingsData] = await Promise.all([
        getDonations(),
        getStudents(),
        getOrCreateSettings(),
      ]);

      setDonations(donationsData);
      setStudents(studentsData);
      setSettings(settingsData);

      // Calculate metrics
      const metricsData = calculateDashboardMetrics(
        donationsData,
        studentsData,
        settingsData.monthlyGoal
      );
      setMetrics(metricsData);

      // Get monthly data
      const monthlyChartData = getMonthlyData(donationsData);
      setMonthlyData(monthlyChartData);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (students.length === 0) {
      setGrades([]);
      setSelectedGrade(null);
      setRankings([]);
      return;
    }

    const uniqueGrades = Array.from(
      new Set(students.map((student) => student.grade))
    )
      .filter((grade) => typeof grade === "number" && !Number.isNaN(grade))
      .sort((a, b) => a - b);

    setGrades(uniqueGrades);
    setSelectedGrade((prev) => {
      if (prev !== null && uniqueGrades.includes(prev)) {
        return prev;
      }
      return uniqueGrades[0] ?? null;
    });
  }, [students]);

  useEffect(() => {
    if (selectedGrade === null) {
      setRankings([]);
      return;
    }

    const rankingsData = getClassRankings(students, selectedGrade);
    setRankings(rankingsData);
  }, [students, selectedGrade]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visão geral das doações e métricas do sistema
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total do Mês"
          value={formatCurrency(metrics?.monthlyTotal || 0)}
          description={`Meta: ${formatCurrency(metrics?.monthlyGoal || 0)}`}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Total do Ano"
          value={formatCurrency(metrics?.yearlyTotal || 0)}
          description={`${new Date().getFullYear()}`}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Doadores Únicos"
          value={metrics?.uniqueDonors.toString() || "0"}
          description={`de ${students.length} alunos`}
          icon={Users}
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Meta vs Realizado"
          value={`${metrics?.goalProgress.toFixed(0)}%`}
          description="do objetivo mensal"
          icon={Target}
          iconColor="text-orange-600"
        />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Meta Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={metrics?.goalProgress || 0} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(metrics?.monthlyTotal || 0)}</span>
              <span>{formatCurrency(metrics?.monthlyGoal || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <MonthlyChart data={monthlyData} />
        </div>
        <div className="lg:col-span-3">
          <ClassRankingCard
            rankings={rankings}
            grades={grades}
            selectedGrade={selectedGrade ?? undefined}
            onGradeChange={(grade) => setSelectedGrade(grade)}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total de Doações
              </p>
              <p className="text-2xl font-bold">{donations.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total de Alunos
              </p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Média de Itens/Doação
              </p>
              <p className="text-2xl font-bold">
                {donations.length > 0
                  ? (
                      donations.reduce(
                        (sum, d) =>
                          sum + d.products.reduce((pSum, p) => pSum + p.quantity, 0),
                        0
                      ) / donations.length
                    ).toFixed(1)
                  : 0}{" "}
                itens
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
