import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Apprentice Log",
  description: "Terms of service for the Apprentice Log application",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString("en-NZ", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Apprentice Log (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Apprentice Log is a voice-to-text logbook application designed to help apprentices
              create and manage their work logbook entries. The Service includes voice recording,
              AI-powered transcription and formatting, cloud storage, and entry management features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                To use the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Upload malicious content or attempt to compromise the Service</li>
              <li>Create false or misleading logbook entries</li>
              <li>Share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, features, and content, is owned by Apprentice Log
              and protected by intellectual property laws. You retain ownership of the content you
              create (logbook entries) but grant us a license to store and process it to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service uses AI to transcribe voice recordings and format logbook entries. While we
              strive for accuracy, AI-generated content may contain errors. You are responsible for
              reviewing and verifying all entries before submission to your employer or training organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim to provide reliable service but do not guarantee uninterrupted access. The Service
              may be temporarily unavailable for maintenance, updates, or circumstances beyond our control.
              We are not liable for any loss resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for
              any indirect, incidental, or consequential damages arising from your use of the Service.
              Our total liability is limited to the amount you paid for the Service (if any).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may terminate your account at any time. We may suspend or terminate your account
              if you violate these terms or for any other reason at our discretion. Upon termination,
              your right to use the Service ceases, but these terms survive as applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. We will notify you of significant changes by
              posting a notice in the app or sending an email. Continued use of the Service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of New Zealand. Any disputes will be resolved
              in the courts of New Zealand.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these terms, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> legal@apprenticelog.app
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
