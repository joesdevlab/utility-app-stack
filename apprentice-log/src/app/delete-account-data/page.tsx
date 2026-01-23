"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle2,
  Shield,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function DeleteAccountDataPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit request");
      }

      setIsSubmitted(true);
      toast.success("Deletion request submitted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state after submission
  if (isSubmitted) {
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
              Request Received
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              We&apos;ve received your account deletion request for{" "}
              <strong>{email}</strong>.
            </p>
            <p className="text-gray-500 mb-8">
              You will receive a confirmation email within 24-48 hours. Your
              account and all associated data will be permanently deleted within
              30 days as per our Privacy Policy.
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
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Account Deletion
          </h1>
          <p className="text-gray-600">
            Submit a request to delete your Apprentice Log account and data
          </p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Already have an account?
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                If you can sign in, you can delete your account directly from
                the app settings. This is faster and more secure.
              </p>
              <Link href="/delete-account">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Sign in to delete account
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* What gets deleted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-8"
        >
          <h2 className="font-semibold text-gray-900 mb-4">
            What will be deleted:
          </h2>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              All logbook entries and voice recordings
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Your account profile and settings
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Any organization memberships
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Authentication and security data
            </li>
          </ul>
        </motion.div>

        {/* Request Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              We&apos;ll verify your identity via email before processing
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email address associated with your account
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for deletion{" "}
                <span className="text-gray-400">(optional)</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Help us improve - why are you leaving?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-base font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Submitting Request...
                </>
              ) : (
                "Submit Deletion Request"
              )}
            </Button>

            <p className="text-center text-xs text-gray-500 mt-4">
              By submitting this request, you acknowledge that this action is
              irreversible. Your data will be permanently deleted within 30 days
              per our{" "}
              <Link href="/privacy" className="text-red-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Having trouble?{" "}
            <Link href="/contact" className="text-orange-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
