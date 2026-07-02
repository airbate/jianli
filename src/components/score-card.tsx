"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  score: number;
  label: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

export function ScoreCard({ score, label }: ScoreCardProps) {
  return (
    <Card className={`border-2 ${getScoreBg(score)}`}>
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Match Score
          </p>
          <h2 className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </h2>
          <p className="mt-1 text-lg font-semibold text-foreground">{label}</p>
        </div>
        <Progress value={score} className="h-3 w-full max-w-md" />
      </CardContent>
    </Card>
  );
}
