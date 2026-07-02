"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MissingKeywordsProps {
  keywords: string[];
}

export function MissingKeywords({ keywords }: MissingKeywordsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Missing Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        {keywords.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Great — no obvious hard-skill gaps were found between your resume and the JD.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
