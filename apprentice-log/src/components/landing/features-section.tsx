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
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice Recording",
    description: "Just talk about your day like you're telling a mate. 30 seconds is all it takes.",
    color: "blue",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Formatting",
    description: "Our AI turns your voice into a professional BCITO-style entry with tasks, hours, and skills.",
    color: "purple",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Your entries are backed up automatically. Access from any device, anytime.",
    color: "cyan",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and only you can access it. We don't share or sell anything.",
    color: "green",
  },
  {
    icon: Clock,
    title: "Track Your Hours",
    description: "See your total hours, skills progress, and complete history at a glance.",
    color: "orange",
  },
  {
    icon: Smartphone,
    title: "Works Offline",
    description: "No signal on site? No worries. Record offline and sync when you're back online.",
    color: "pink",
  },
];

const colorClasses = {
  blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
  purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
  cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/25",
  green: "from-green-500 to-green-600 shadow-green-500/25",
  orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
  pink: "from-pink-500 to-pink-600 shadow-pink-500/25",
};

const bgColorClasses = {
  blue: "bg-blue-500/10 border-blue-500/20",
  purple: "bg-purple-500/10 border-purple-500/20",
  cyan: "bg-cyan-500/10 border-cyan-500/20",
  green: "bg-green-500/10 border-green-500/20",
  orange: "bg-orange-500/10 border-orange-500/20",
  pink: "bg-pink-500/10 border-pink-500/20",
};

const textColorClasses = {
  blue: "text-blue-400",
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  green: "text-green-400",
  orange: "text-orange-400",
  pink: "text-pink-400",
};

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">The Better Way</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Nothing You Don&apos;t
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We built this for busy tradies who want to get their paperwork done
            and get back to their lives.
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
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-full hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works mini-section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            How It Works
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Record",
                description: "Tap the mic and talk about your day. What you did, how long, what tools you used.",
                icon: Mic,
              },
              {
                step: "2",
                title: "Review",
                description: "AI formats your entry in seconds. Check it looks good and make any tweaks.",
                icon: Sparkles,
              },
              {
                step: "3",
                title: "Done",
                description: "Hit save. Your BCITO-ready entry is stored safely in the cloud. That's it!",
                icon: Zap,
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
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-slate-700 to-slate-800" />
                )}

                {/* Step number */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-500/25">
                  {item.step}
                </div>

                <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
