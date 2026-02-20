"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Loader2,
  Heart,
} from "lucide-react";

export interface ExitSurveyData {
  reason: string;
  details?: string;
  wouldRecommend: boolean | null;
  feedback?: string;
}

interface ExitSurveyProps {
  onComplete: (data: ExitSurveyData) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

const EXIT_REASONS = [
  { id: "not_using", label: "I'm not using it anymore", icon: "😴" },
  { id: "too_expensive", label: "Too expensive for my needs", icon: "💰" },
  { id: "missing_features", label: "Missing features I need", icon: "🔧" },
  { id: "hard_to_use", label: "Too difficult to use", icon: "😕" },
  { id: "switched_competitor", label: "Switched to another solution", icon: "🔄" },
  { id: "employer_change", label: "Changed employers", icon: "🏢" },
  { id: "finished_apprenticeship", label: "Finished my apprenticeship", icon: "🎓" },
  { id: "privacy_concerns", label: "Privacy or security concerns", icon: "🔒" },
  { id: "other", label: "Other reason", icon: "💭" },
];

export function ExitSurvey({ onComplete, onSkip, isSubmitting }: ExitSurveyProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    onComplete({
      reason,
      details: details || undefined,
      wouldRecommend,
      feedback: feedback || undefined,
    });
  };

  const canProceedStep1 = !!reason;
  const showDetailsInput = ["missing_features", "hard_to_use", "other"].includes(reason);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-orange-200 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            Before you go...
          </h2>
          <p className="text-sm text-gray-600">
            Help us improve by sharing why you&apos;re leaving
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-orange-500" : "bg-gray-200"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-orange-500" : "bg-gray-200"}`} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Label className="text-sm font-medium text-gray-700">
              What&apos;s your main reason for leaving?
            </Label>

            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {EXIT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    reason === r.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                  }`}
                >
                  <RadioGroupItem value={r.id} id={r.id} className="sr-only" />
                  <span className="text-lg">{r.icon}</span>
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </RadioGroup>

            {showDetailsInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="details" className="text-sm font-medium text-gray-700">
                  Tell us more (optional)
                </Label>
                <Textarea
                  id="details"
                  placeholder="What features were missing? What was difficult?"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="flex-1 text-gray-500 hover:text-gray-700"
              >
                Skip Survey
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Would you recommend Apprentice Log to a friend?
              </Label>
              <div className="flex gap-4">
                <button
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    wouldRecommend === true
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-200"
                  }`}
                >
                  <ThumbsUp
                    className={`h-5 w-5 ${
                      wouldRecommend === true ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span className={wouldRecommend === true ? "text-green-700" : "text-gray-600"}>
                    Yes
                  </span>
                </button>
                <button
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    wouldRecommend === false
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-200"
                  }`}
                >
                  <ThumbsDown
                    className={`h-5 w-5 ${
                      wouldRecommend === false ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span className={wouldRecommend === false ? "text-red-700" : "text-gray-600"}>
                    No
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                Any final thoughts? (optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Is there anything we could do better?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Thank you for trying Apprentice Log. Your feedback helps us build
                  a better product for NZ apprentices.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit & Continue"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
