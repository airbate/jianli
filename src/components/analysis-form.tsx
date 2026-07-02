"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, FileText } from "lucide-react";

interface AnalysisFormProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  resumeText: string;
  setResumeText: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function AnalysisForm({
  jobDescription,
  setJobDescription,
  resumeText,
  setResumeText,
  jobTitle,
  setJobTitle,
  onSubmit,
  loading,
}: AnalysisFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="job-description" className="text-base font-semibold">
              Job Description
            </Label>
            <span className="text-xs text-muted-foreground">
              {jobDescription.length.toLocaleString()} / 15,000
            </span>
          </div>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={14}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Copy straight from the job posting.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="resume-text" className="text-base font-semibold">
              Your Resume Text
            </Label>
            <span className="text-xs text-muted-foreground">
              {resumeText.length.toLocaleString()} / 10,000
            </span>
          </div>
          <Textarea
            id="resume-text"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={14}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Open your PDF, press Ctrl+A, then Ctrl+C.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="job-title" className="text-sm font-medium">
            Job Title (optional)
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="job-title"
              placeholder="e.g. Senior Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={loading || !jobDescription.trim() || !resumeText.trim()}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Check My Match
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
