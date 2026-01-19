"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, Clock, AlertTriangle, FileX, ArrowDown } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Wasting 20+ minutes every night",
    description: "After a 10-hour day on site, the last thing you want is more paperwork.",
  },
  {
    icon: FileX,
    title: "Forgetting what you actually did",
    description: "By Friday, Monday's tasks are a blur. Your logbook ends up vague and unhelpful.",
  },
  {
    icon: AlertTriangle,
    title: "Risking your qualification",
    description: "Incomplete or rushed entries could delay your sign-off. Don't let paperwork hold you back.",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6">
            <X className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">The Old Way Sucks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Sound Familiar?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Every tradie in NZ knows the pain of keeping a logbook updated.
            It&apos;s boring, time-consuming, and always gets pushed to &quot;later.&quot;
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
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full hover:border-red-500/30 transition-colors duration-300">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <problem.icon className="h-6 w-6 text-red-400" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {problem.title}
                </h3>
                <p className="text-slate-400">
                  {problem.description}
                </p>

                {/* Strike through effect on hover */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8"
        >
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">73%</div>
              <div className="text-slate-400">of apprentices hate doing their logbook</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">2+ hrs</div>
              <div className="text-slate-400">wasted on paperwork each week</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">40%</div>
              <div className="text-slate-400">leave entries incomplete</div>
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
            className="text-slate-600"
          >
            <ArrowDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
