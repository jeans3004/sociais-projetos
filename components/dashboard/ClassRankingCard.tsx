import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassRanking } from "@/types";
import { formatItems } from "@/lib/utils";
import { Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassRankingCardProps {
  rankings: ClassRanking[];
  grades: number[];
  selectedGrade?: number;
  onGradeChange: (grade: number) => void;
}

export function ClassRankingCard({
  rankings,
  grades,
  selectedGrade,
  onGradeChange,
}: ClassRankingCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 Turmas
          </CardTitle>
          {grades.length > 0 ? (
            <Select
              value={selectedGrade ? selectedGrade.toString() : undefined}
              onValueChange={(value) => onGradeChange(Number(value))}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Selecione a série" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    {grade}º ano
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        {selectedGrade ? (
          <p className="text-sm text-muted-foreground">
            Ranking das turmas do {selectedGrade}º ano
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {selectedGrade
              ? "Nenhuma doação registrada para esta série ainda."
              : "Nenhuma doação registrada ainda."}
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
                  {formatItems(ranking.totalDonated)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
