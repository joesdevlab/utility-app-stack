"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, FileText, BarChart3, ChevronRight, X, Sparkles } from "lucide-react";

const ONBOARDING_KEY = "onboarding-completed";

interface OnboardingStep {
  icon: typeof Mic;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Sparkles,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    title: "Kia ora! Welcome to Apprentice Log",
    description:
      "The easiest way to keep your BCITO logbook up to date. Just speak about your day and we'll handle the rest.",
  },
  {
    icon: Mic,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    title: "Record your day in 30 seconds",
    description:
      "Tap the mic, talk about what you did today — tasks, tools, hours. Our AI formats it into a proper logbook entry.",
  },
  {
    icon: FileText,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    title: "Export BCITO-ready PDFs",
    description:
      "Download your entries as a professional PDF formatted for BCITO. Ready for your supervisor to sign off.",
  },
  {
    icon: BarChart3,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    title: "Track your progress",
    description:
      "See your hours, skills, and streaks in the Stats tab. Stay on top of your apprenticeship goals.",
  },
];

export function OnboardingWalkthrough() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay so the app loads first
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Skip button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          <div className="px-6 pt-8 pb-6 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mx-auto mb-5`}
            >
              <Icon className={`w-8 h-8 ${step.iconColor}`} />
            </motion.div>

            {/* Content */}
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {step.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 space-y-3">
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-6 bg-orange-500"
                      : i < currentStep
                      ? "w-1.5 bg-orange-300"
                      : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  className="flex-1 text-gray-500"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 ${
                  currentStep === 0 ? "w-full" : ""
                }`}
                onClick={handleNext}
              >
                {isLast ? "Get Started" : "Next"}
                {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
