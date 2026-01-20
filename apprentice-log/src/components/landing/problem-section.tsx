"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Clock, FileX, TrendingDown, ArrowDown } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Hours Lost to Administration",
    description: "Trade professionals spend an average of 2+ hours weekly on manual logbook entries — time that could be spent on productive work.",
  },
  {
    icon: FileX,
    title: "Incomplete Documentation",
    description: "End-of-day fatigue leads to rushed, incomplete entries that fail to capture the full scope of skills and activities performed.",
  },
  {
    icon: TrendingDown,
    title: "Qualification Delays",
    description: "Poor documentation can delay apprenticeship sign-off, impacting career progression and employer compliance requirements.",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-700 text-sm font-semibold">Industry Challenge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            The Hidden Cost of Manual Logbooks
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Traditional paper-based and manual digital logbooks create significant inefficiencies
            for both apprentices and their employers.
          </p>
        </motion.div>

        {/* Problems grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:border-red-200 hover:shadow-lg transition-all duration-300">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                  <problem.icon className="h-6 w-6 text-red-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {problem.title}
                </h3>
                <p className="text-gray-600">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
        >
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">73%</div>
              <div className="text-gray-600">of apprentices report logbook frustration</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">2+ hrs</div>
              <div className="text-gray-600">weekly time lost to manual entry</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">40%</div>
              <div className="text-gray-600">submit incomplete documentation</div>
            </div>
          </div>
        </motion.div>

        {/* Transition arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex justify-center mt-12"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-300"
          >
            <ArrowDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
