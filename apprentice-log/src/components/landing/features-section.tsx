"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Mic,
  Sparkles,
  Cloud,
  Shield,
  Clock,
  Smartphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-to-Text Entry",
    description: "Simply describe your day verbally. Our advanced speech recognition captures every detail accurately.",
    color: "orange",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Formatting",
    description: "Intelligent processing transforms your voice notes into structured, BCITO-compliant logbook entries.",
    color: "amber",
  },
  {
    icon: Cloud,
    title: "Secure Cloud Storage",
    description: "Enterprise-grade infrastructure ensures your documentation is always backed up and accessible.",
    color: "orange",
  },
  {
    icon: Shield,
    title: "Data Protection",
    description: "Bank-level encryption protects your information. Your data remains private and secure.",
    color: "amber",
  },
  {
    icon: Clock,
    title: "Progress Tracking",
    description: "Monitor accumulated hours, skills development, and qualification progress at a glance.",
    color: "orange",
  },
  {
    icon: Smartphone,
    title: "Offline Capability",
    description: "Record entries without internet connection. Automatic sync when connectivity is restored.",
    color: "amber",
  },
];

const colorClasses = {
  orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
  amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
};

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
            <CheckCircle2 className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 text-sm font-semibold">Professional Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Purpose-Built for the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Trade Industry
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive digital solution designed specifically for the unique requirements
            of New Zealand&apos;s trade apprenticeship programmes.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className="group"
            >
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 hover:shadow-lg">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Simple Three-Step Process
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Record",
                description: "Tap the microphone and describe your day's activities, tools used, and skills applied.",
              },
              {
                step: "2",
                title: "Review",
                description: "AI instantly formats your entry to BCITO standards. Review and make any adjustments.",
              },
              {
                step: "3",
                title: "Submit",
                description: "Save your compliant entry to the secure cloud. Access your complete history anytime.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:flex absolute top-8 left-[60%] w-[80%] items-center">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-300 to-orange-100" />
                    <ArrowRight className="h-4 w-4 text-orange-300 -ml-1" />
                  </div>
                )}

                {/* Step number */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-orange-500/25">
                  {item.step}
                </div>

                <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
