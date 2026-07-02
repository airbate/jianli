"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalysisForm } from "@/components/analysis-form";
import { ScoreCard } from "@/components/score-card";
import { MissingKeywords } from "@/components/missing-keywords";
import { RewriteSuggestions } from "@/components/rewrite-suggestions";
import { QuotaModal } from "@/components/quota-modal";
import { AnalyzeResponse, ApiErrorResponse } from "@/lib/schemas";
import { AlertCircle, CheckCircle2, Shield, Lock } from "lucide-react";

function isApiError(data: AnalyzeResponse | ApiErrorResponse): data is ApiErrorResponse {
  return "error" in data;
}

export default function HomePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [bonusEmail, setBonusEmail] = useState("");
  const [quotaLoading, setQuotaLoading] = useState(false);

  async function handleAnalyze(email?: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          jobTitle: jobTitle || undefined,
          email,
        }),
      });

      const data: AnalyzeResponse | ApiErrorResponse = await response.json();

      if (isApiError(data)) {
        if (data.error === "FREE_LIMIT_REACHED") {
          setShowQuotaModal(true);
          setLoading(false);
          return;
        }
        setError(data.message);
        setResult(null);
      } else {
        setResult(data);
        setShowQuotaModal(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlockBonus() {
    setQuotaLoading(true);
    await handleAnalyze(bonusEmail);
    setQuotaLoading(false);
  }

  function handleReset() {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ATS Match Checker
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background px-4 py-12 md:py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Will Your Resume Pass the ATS?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Paste any job description and your resume. Get your match score,
              missing keywords, and rewrite suggestions in 30 seconds.
            </p>
            <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> Free
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> No signup
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-green-600" /> No PDF uploads
              </span>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:py-12">
          <div className="mx-auto max-w-6xl">
            {!result ? (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <AnalysisForm
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  resumeText={resumeText}
                  setResumeText={setResumeText}
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  onSubmit={() => handleAnalyze()}
                  loading={loading}
                />
              </>
            ) : (
              <div className="space-y-6">
                <ScoreCard score={result.matchScore} label={result.scoreLabel} />
                <MissingKeywords keywords={result.missingKeywords} />
                <RewriteSuggestions rewrites={result.suggestedRewrites} />
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="font-medium">Summary</p>
                  <p className="mt-1 text-muted-foreground">{result.summary}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Check another job →
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            No resume data is stored. Analysis only.
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>

      <QuotaModal
        open={showQuotaModal}
        email={bonusEmail}
        setEmail={setBonusEmail}
        onSubmit={handleUnlockBonus}
        loading={quotaLoading}
      />
    </div>
  );
}
