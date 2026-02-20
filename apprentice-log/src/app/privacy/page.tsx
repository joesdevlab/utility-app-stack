import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Apprentice Log",
  description: "Privacy policy for the Apprentice Log application",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString("en-NZ", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Apprentice Log (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you use
              our mobile application and web service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Account Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, we collect your email address and password (securely hashed).
                  This information is used solely for authentication purposes.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Logbook Entries</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We store the logbook entries you create, including voice transcripts, task descriptions,
                  hours worked, tools used, skills practiced, and any notes or safety observations you add.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Voice Recordings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you use the voice recording feature, your audio is temporarily processed to convert
                  speech to text. We do not permanently store audio recordings. The audio is sent to OpenAI&apos;s
                  Whisper API for transcription and is subject to OpenAI&apos;s data usage policies.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide and maintain our service</li>
              <li>To authenticate your identity and secure your account</li>
              <li>To store and display your logbook entries</li>
              <li>To convert your voice recordings to text</li>
              <li>To improve our service based on usage patterns (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using Supabase, which provides enterprise-grade security including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Encryption at rest and in transit</li>
              <li>Row Level Security (RLS) ensuring you can only access your own data</li>
              <li>Regular security audits and compliance certifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Supabase</strong> - Database and authentication</li>
              <li><strong>OpenAI</strong> - Voice transcription (Whisper API) and text processing</li>
              <li><strong>Vercel</strong> - Application hosting</li>
              <li><strong>Sentry</strong> - Error tracking (optional, anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your logbook entries for as long as your account is active. You can delete individual
              entries at any time. If you delete your account, all associated data will be permanently removed
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data and account</li>
              <li>Export your logbook entries</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Apprentice Log is intended for use by apprentices aged 16 and older. We do not knowingly
              collect information from children under 16. If you believe a child has provided us with
              personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> privacy@apprenticelog.nz
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t">
          <a href="/app" className="text-orange-500 hover:text-orange-600 font-medium">
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  );
}
