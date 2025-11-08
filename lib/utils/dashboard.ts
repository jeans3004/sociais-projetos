import {
  Donation,
  Student,
  DashboardMetrics,
  MonthlyData,
  ClassRanking,
  ProductType,
  PRODUCT_TYPES,
} from "@/types";
import { startOfMonth, endOfMonth, startOfYear, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Calculate dashboard metrics
 */
export function calculateDashboardMetrics(
  donations: Donation[],
  students: Student[],
  monthlyGoal: number
): DashboardMetrics {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);

  // Monthly total
  const monthlyDonations = donations.filter((d) => {
    const donationDate = d.date.toDate();
    return donationDate >= monthStart && donationDate <= monthEnd;
  });
  const monthlyTotal = monthlyDonations.reduce(
    (sum, d) => sum + d.products.reduce((pSum, p) => pSum + p.quantity, 0),
    0
  );

  // Yearly total
  const yearlyDonations = donations.filter((d) => {
    const donationDate = d.date.toDate();
    return donationDate >= yearStart;
  });
  const yearlyTotal = yearlyDonations.reduce(
    (sum, d) => sum + d.products.reduce((pSum, p) => pSum + p.quantity, 0),
    0
  );

  // Unique donors (students who made at least one donation)
  const uniqueDonorIds = new Set(donations.map((d) => d.studentId));
  const uniqueDonors = uniqueDonorIds.size;

  // Goal progress
  const goalProgress =
    monthlyGoal > 0 ? Math.min(100, (monthlyTotal / monthlyGoal) * 100) : 0;

  // Product breakdown
  const productBreakdown = PRODUCT_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<ProductType, number>);

  monthlyDonations.forEach((donation) => {
    donation.products.forEach((product) => {
      if (productBreakdown[product.product] !== undefined) {
        productBreakdown[product.product] += product.quantity;
      }
    });
  });

  return {
    monthlyTotal,
    yearlyTotal,
    uniqueDonors,
    goalProgress,
    monthlyGoal,
    productBreakdown,
  };
}

/**
 * Get monthly donation data for the last 12 months
 */
export function getMonthlyData(donations: Donation[]): MonthlyData[] {
  const now = new Date();
  const monthlyData: MonthlyData[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthDonations = donations.filter((d) => {
      const donationDate = d.date.toDate();
      return donationDate >= monthStart && donationDate <= monthEnd;
    });

    const total = monthDonations.reduce(
      (sum, d) => sum + d.products.reduce((pSum, p) => pSum + p.quantity, 0),
      0
    );

    monthlyData.push({
      month: format(date, "MMM/yy", { locale: ptBR }),
      total,
    });
  }

  return monthlyData;
}

/**
 * Get class rankings based on total donations
 */
export function getClassRankings(
  donations: Donation[],
  students: Student[]
): ClassRanking[] {
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const classMap = new Map<
    string,
    { totalDonations: number; donorIds: Set<string> }
  >();

  donations.forEach((donation) => {
    const student = studentMap.get(donation.studentId);

    const classLabel = student
      ? `${student.grade}º ${student.class}`
      : donation.studentClass ?? null;

    if (!classLabel) {
      return;
    }

    const itemsDonated = donation.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    if (itemsDonated <= 0) {
      return;
    }

    const existing =
      classMap.get(classLabel) || {
        totalDonations: 0,
        donorIds: new Set<string>(),
      };

    existing.donorIds.add(donation.studentId);

    classMap.set(classLabel, {
      totalDonations: existing.totalDonations + itemsDonated,
      donorIds: existing.donorIds,
    });
  });

  const rankings: ClassRanking[] = Array.from(classMap.entries())
    .map(([className, data]) => ({
      class: className,
      totalDonated: data.totalDonations,
      donorCount: data.donorIds.size,
    }))
    .sort((a, b) => b.totalDonated - a.totalDonated)
    .slice(0, 5);

  return rankings;
}
