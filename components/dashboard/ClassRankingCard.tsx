import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassRanking } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface ClassRankingCardProps {
  rankings: ClassRanking[];
}

export function ClassRankingCard({ rankings }: ClassRankingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 5 Turmas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma doação registrada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {rankings.map((ranking, index) => (
              <div key={ranking.class} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-100 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{ranking.class}</p>
                  <p className="text-xs text-muted-foreground">
                    {ranking.donorCount} doador(es)
                  </p>
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(ranking.totalDonated)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
