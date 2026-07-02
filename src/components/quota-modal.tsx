"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface QuotaModalProps {
  open: boolean;
  email: string;
  setEmail: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function QuotaModal({
  open,
  email,
  setEmail,
  onSubmit,
  loading,
}: QuotaModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You&apos;ve used your 3 free checks today</DialogTitle>
          <DialogDescription>
            Leave your email and unlock 10 more free analyses instantly. No spam,
            no credit card required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quota-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="quota-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={loading || !email.trim() || !email.includes("@")}
          >
            {loading ? "Unlocking..." : "Unlock 10 More Free Analyses"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            We&apos;ll use your email only to grant bonus credits and occasional product updates.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
