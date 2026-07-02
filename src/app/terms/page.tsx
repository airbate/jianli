import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — ATS Resume Match Checker",
  description:
    "Terms of service for ATS Resume Match Checker. Read before using the service.",
};

export default function TermsPage() {
  const contactEmail = process.env.CONTACT_EMAIL || "hello@example.com";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to ATS Match Checker
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective Date: July 2, 2026</p>

        <div className="mt-8 space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ATS Resume Match Checker, you agree to be bound by these Terms
              of Service. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p>
              ATS Resume Match Checker is a tool that compares a job description with a resume and
              provides a match score, missing keywords, and rewrite suggestions. It is a keyword
              matching aid, not a guarantee that your resume will pass any specific ATS or result in
              a job interview.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. User Content</h2>
            <p>
              You retain ownership of any text you submit. You represent that you have the right to
              submit the resume and job description text you provide. We do not store your
              submissions after analysis is complete.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Acceptable Use</h2>
            <p>You agree not to use the service to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Abuse, automate, or circumvent usage limits.</li>
              <li>Submit content that is illegal, harmful, or infringes on others' rights.</li>
              <li>Reverse-engineer or attempt to extract the underlying source code.</li>
              <li>Use the service to generate misleading or fraudulent resume content.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Free Tier and Bonus Credits</h2>
            <p>
              The service offers a limited number of free analyses per day. Additional credits may be
              granted by providing a valid email address. We reserve the right to modify or terminate
              free tiers at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Disclaimer of Warranties</h2>
            <p>
              The service is provided "as is" without warranties of any kind. We do not guarantee
              that the analysis is accurate, complete, or suitable for any particular purpose. You
              are solely responsible for any changes you make to your resume.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, ATS Resume Match Checker and its operators will
              not be liable for any indirect, incidental, special, consequential, or punitive damages
              arising out of your use of the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the service
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
            <p>
              Questions about these Terms should be sent to{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                {contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
