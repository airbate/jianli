"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface Rewrite {
  original: string;
  suggested: string;
  reason: string;
}

interface RewriteSuggestionsProps {
  rewrites: Rewrite[];
}

export function RewriteSuggestions({ rewrites }: RewriteSuggestionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suggested Rewrites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rewrites.map((rewrite, index) => (
          <div
            key={index}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Original
                </p>
                <p className="text-sm italic text-muted-foreground">
                  "{rewrite.original}"
                </p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-primary">
                  Suggested
                </p>
                <p className="text-sm font-medium">"{rewrite.suggested}"</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {rewrite.reason}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
