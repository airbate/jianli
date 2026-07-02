import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — ATS Resume Match Checker",
  description:
    "Privacy policy for ATS Resume Match Checker. We do not store your resume or job description.",
};

export default function PrivacyPage() {
  const contactEmail = process.env.CONTACT_EMAIL || "hello@example.com";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to ATS Match Checker
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective Date: July 2, 2026</p>

        <div className="mt-8 space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Process</h2>
            <p>
              ATS Resume Match Checker is designed to minimize data collection. When you use our
              service, you paste a job description and your resume text into the tool. We process
              this text solely to generate an ATS match analysis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. We Do Not Store Your Resume or Job Description</h2>
            <p>
              We do not store, log, or retain the job descriptions or resume text you submit.
              Analysis occurs in real-time and the text is discarded immediately after the result is
              returned to you.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Third-Party AI Processing</h2>
            <p>
              To perform the analysis, your text is sent to third-party AI providers: SiliconFlow
              (DeepSeek V3) and, as a fallback, OpenAI (gpt-4o-mini). These providers process the
              text on our behalf under their respective terms of service and privacy policies. We do
              not allow these providers to use your data for training their models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Email Addresses</h2>
            <p>
              If you choose to provide your email address to unlock bonus analysis credits, we store
              only your email address. We use it to grant those credits and may send occasional
              product updates. We do not sell, rent, or share your email address with third parties
              for marketing purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Cookies and Analytics</h2>
            <p>
              We use a minimal cookie or local identifier to enforce daily free analysis limits. We
              may also use Vercel Analytics to understand aggregate traffic patterns. This data is
              anonymized and does not identify individual users.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Data Security</h2>
            <p>
              All data transmission is encrypted via HTTPS. Analysis requests are processed through
              secure serverless infrastructure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
            <p>
              You can request deletion of any email address we have on record by contacting us at{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on
              this page with an updated effective date.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
