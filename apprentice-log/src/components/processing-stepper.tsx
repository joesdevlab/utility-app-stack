"use client";

import { motion } from "framer-motion";
import {
  Mic,
  FileAudio,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export type ProcessingPhase =
  | "idle"
  | "recording"
  | "transcribing"
  | "formatting"
  | "complete"
  | "error";

interface ProcessingStepperProps {
  currentPhase: ProcessingPhase;
  error?: string | null;
  className?: string;
}

const STEPS = [
  {
    id: "recording" as const,
    label: "Record",
    icon: Mic,
    description: "Capturing your voice",
  },
  {
    id: "transcribing" as const,
    label: "Transcribe",
    icon: FileAudio,
    description: "Converting speech to text",
  },
  {
    id: "formatting" as const,
    label: "Format",
    icon: Sparkles,
    description: "AI formatting your entry",
  },
  {
    id: "complete" as const,
    label: "Done",
    icon: CheckCircle2,
    description: "Entry ready",
  },
];

function getStepStatus(
  stepId: string,
  currentPhase: ProcessingPhase
): "pending" | "active" | "complete" | "error" {
  const stepOrder = ["recording", "transcribing", "formatting", "complete"];
  const currentIndex = stepOrder.indexOf(currentPhase);
  const stepIndex = stepOrder.indexOf(stepId);

  if (currentPhase === "error") {
    if (stepIndex <= currentIndex) return "error";
    return "pending";
  }

  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

export function ProcessingStepper({
  currentPhase,
  error,
  className = "",
}: ProcessingStepperProps) {
  if (currentPhase === "idle") return null;

  const activeStep = STEPS.find((s) => s.id === currentPhase);

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id, currentPhase);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <motion.div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  status === "complete"
                    ? "bg-emerald-500 border-emerald-500"
                    : status === "active"
                    ? "bg-orange-500 border-orange-500"
                    : status === "error"
                    ? "bg-rose-500 border-rose-500"
                    : "bg-gray-100 border-gray-300"
                }`}
                animate={
                  status === "active"
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(249, 115, 22, 0)",
                          "0 0 0 8px rgba(249, 115, 22, 0.2)",
                          "0 0 0 0 rgba(249, 115, 22, 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: status === "active" ? Infinity : 0,
                }}
              >
                {status === "active" ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : status === "complete" ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : status === "error" ? (
                  <AlertCircle className="h-5 w-5 text-white" />
                ) : (
                  <Icon
                    className={`h-5 w-5 ${
                      status === "pending" ? "text-gray-400" : "text-white"
                    }`}
                  />
                )}
              </motion.div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-0.5 transition-colors ${
                      getStepStatus(STEPS[index + 1].id, currentPhase) !==
                      "pending"
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels (small screens show only current) */}
      <div className="hidden sm:flex justify-between text-xs text-center">
        {STEPS.map((step) => {
          const status = getStepStatus(step.id, currentPhase);
          return (
            <div
              key={step.id}
              className={`w-10 ${
                status === "active"
                  ? "text-orange-600 font-medium"
                  : status === "complete"
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      {/* Current step description */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        {error ? (
          <div className="text-rose-600">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1 text-rose-500">{error}</p>
          </div>
        ) : activeStep ? (
          <>
            <p className="font-medium text-gray-900">{activeStep.label}</p>
            <p className="text-sm text-gray-500 mt-1">
              {activeStep.description}
            </p>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}

// Compact inline stepper for limited space
export function CompactStepper({
  currentPhase,
}: {
  currentPhase: ProcessingPhase;
}) {
  if (currentPhase === "idle") return null;

  const stepOrder = ["recording", "transcribing", "formatting", "complete"];
  const currentIndex = stepOrder.indexOf(currentPhase);
  const progress = ((currentIndex + 1) / stepOrder.length) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>
          {currentPhase === "recording"
            ? "Recording..."
            : currentPhase === "transcribing"
            ? "Transcribing..."
            : currentPhase === "formatting"
            ? "Formatting..."
            : "Complete!"}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
