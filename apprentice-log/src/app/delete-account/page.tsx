"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Loader2,
  CheckCircle2,
  Shield,
  Download,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { ExitSurvey, ExitSurveyData } from "@/components/exit-survey";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

type DeleteStep = "survey" | "confirm" | "deleted";

export default function DeleteAccountPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [step, setStep] = useState<DeleteStep>("survey");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  const isDeleted = step === "deleted";

  const canDelete =
    user &&
    confirmEmail.toLowerCase() === user.email?.toLowerCase() &&
    confirmText === "DELETE";

  const handleSurveyComplete = async (data: ExitSurveyData) => {
    setIsSubmittingSurvey(true);
    try {
      // Submit survey in the background - don't block the flow
      await fetch("/api/user/exit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      trackEvent(ANALYTICS_EVENTS.EXIT_SURVEY_SUBMITTED, { reason: data.reason });
    } catch {
      // Don't show error to user - survey is optional
      console.error("Failed to submit exit survey");
    } finally {
      setIsSubmittingSurvey(false);
      setStep("confirm");
    }
  };

  const handleSkipSurvey = () => {
    setStep("confirm");
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    trackEvent(ANALYTICS_EVENTS.ACCOUNT_DELETION_STARTED);

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      trackEvent(ANALYTICS_EVENTS.ACCOUNT_DELETED);
      setStep("deleted");
      toast.success("Your account has been deleted");

      // Sign out after a short delay
      setTimeout(() => {
        signOut();
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show success state after deletion
  if (isDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Account Deleted
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your account and all associated data have been permanently deleted.
              We&apos;re sorry to see you go.
            </p>
            <Link href="/">
              <Button className="bg-gray-900 hover:bg-gray-800">
                Return to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Delete Your Account
            </h1>
            <p className="text-gray-600">
              Please sign in to delete your account.
            </p>
          </div>

          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={step === "survey" ? "/app/settings" : "#"}
            onClick={step === "confirm" ? (e) => { e.preventDefault(); setStep("survey"); } : undefined}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === "survey" ? "Back to Settings" : "Back"}
          </Link>
        </div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-900 mb-2">
                Delete Your Account
              </h1>
              <p className="text-red-700">
                This action is <strong>permanent and irreversible</strong>. All
                your data will be deleted and cannot be recovered.
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "survey" && (
            <motion.div
              key="survey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Exit Survey */}
              <ExitSurvey
                onComplete={handleSurveyComplete}
                onSkip={handleSkipSurvey}
                isSubmitting={isSubmittingSurvey}
              />
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* What gets deleted */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  What will be deleted:
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>All your logbook entries and voice recordings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Your account profile and settings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Any organization memberships</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Authentication and security data</span>
                  </li>
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h2 className="font-semibold text-blue-900 mb-4">
                  Before you delete:
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-blue-800">Export your data first</span>
                      <p className="text-sm text-blue-600 mt-1">
                        Go to{" "}
                        <Link
                          href="/app/settings"
                          className="underline hover:text-blue-800"
                        >
                          Settings → Export Entries
                        </Link>{" "}
                        to download your logbook as CSV.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-blue-800">Having issues?</span>
                      <p className="text-sm text-blue-600 mt-1">
                        <Link
                          href="/contact"
                          className="underline hover:text-blue-800"
                        >
                          Contact us
                        </Link>{" "}
                        - we may be able to help resolve your concerns.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Delete Form */}
              <div className="bg-white border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Signed in as <strong>{user.email}</strong>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmEmail">
                      Type your email to confirm:{" "}
                      <span className="font-mono text-red-600">{user.email}</span>
                    </Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmText">
                      Type <span className="font-mono text-red-600">DELETE</span> to
                      confirm:
                    </Label>
                    <Input
                      id="confirmText"
                      type="text"
                      placeholder="DELETE"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  <Button
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || isDeleting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-base font-semibold disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5 mr-2" />
                        Permanently Delete My Account
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    This action cannot be undone. Your data will be permanently
                    removed within 30 days per our{" "}
                    <Link href="/privacy" className="text-red-600 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
