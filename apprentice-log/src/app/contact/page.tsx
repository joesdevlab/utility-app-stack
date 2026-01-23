"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
  Building2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Turnstile } from "@/components/turnstile";

type InquiryType = "general" | "support" | "employer" | "partnership";

const inquiryTypes: { value: InquiryType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "general",
    label: "General Inquiry",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Questions about the app or features",
  },
  {
    value: "support",
    label: "Technical Support",
    icon: <HelpCircle className="h-5 w-5" />,
    description: "Help with bugs or issues",
  },
  {
    value: "employer",
    label: "Employer Portal",
    icon: <Building2 className="h-5 w-5" />,
    description: "Questions about team management",
  },
  {
    value: "partnership",
    label: "Partnership",
    icon: <Users className="h-5 w-5" />,
    description: "ITOs, training providers, business",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState<InquiryType>("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isTurnstileConfigured = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isTurnstileConfigured && !turnstileToken) {
      toast.error("Please complete the security verification");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify Turnstile if configured
      if (isTurnstileConfigured && turnstileToken) {
        const verifyResponse = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        });

        if (!verifyResponse.ok) {
          toast.error("Security verification failed. Please try again.");
          setTurnstileToken(null);
          return;
        }
      }

      // Send contact form
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          inquiryType,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setIsSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thanks for reaching out. We&apos;ll get back to you within 24-48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                  setTurnstileToken(null);
                }}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
              >
                Send Another Message
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
            <Mail className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 text-sm font-semibold">Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, feedback, or need support? We&apos;d love to hear from you.
            Our team typically responds within 24-48 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <a
                    href="mailto:support@apprenticelog.nz"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    support@apprenticelog.nz
                  </a>
                  <p className="text-sm text-gray-500 mt-1">For general inquiries</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                  <p className="text-gray-600">24-48 hours</p>
                  <p className="text-sm text-gray-500 mt-1">Mon-Fri, NZ business hours</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                  <p className="text-gray-600">New Zealand</p>
                  <p className="text-sm text-gray-500 mt-1">Supporting NZ apprentices 🇳🇿</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/#faq" className="text-gray-600 hover:text-orange-600 text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-orange-600 text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-orange-600 text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">What can we help you with?</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {inquiryTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setInquiryType(type.value)}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          inquiryType === type.value
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            inquiryType === type.value
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {type.icon}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              inquiryType === type.value ? "text-orange-700" : "text-gray-900"
                            }`}
                          >
                            {type.label}
                          </p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Turnstile */}
                <div className="flex justify-center">
                  <Turnstile
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken(null)}
                    theme="auto"
                    action="contact"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting || (isTurnstileConfigured && !turnstileToken)}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  By submitting this form, you agree to our{" "}
                  <Link href="/privacy" className="text-orange-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Apprentice Log. Supporting New Zealand&apos;s trade industry.
          </p>
        </div>
      </div>
    </div>
  );
}
