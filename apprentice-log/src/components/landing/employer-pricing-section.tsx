"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  BarChart3,
  FileText,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 2 apprentices",
      "Basic dashboard overview",
      "View apprentice entries",
      "Progress tracking",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/employer",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses with more apprentices",
    features: [
      "Unlimited apprentices",
      "Full analytics dashboard",
      "Team management tools",
      "Export reports (CSV/PDF)",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Pro Trial",
    href: "/employer",
    popular: true,
  },
];

const benefits = [
  {
    icon: BarChart3,
    title: "Real-Time Visibility",
    description: "Track hours logged, skills developed, and progress toward qualifications in real-time.",
  },
  {
    icon: FileText,
    title: "Compliance Ready",
    description: "All entries are BCITO-compliant. Export reports for audits and qualification verification.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Invite supervisors, manage apprentices, and coordinate training across your organization.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption protects your team's data. SOC2 compliant infrastructure.",
  },
];

export function EmployerPricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="employer-pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[rgb(18_49_72)]/10 border border-[rgb(18_49_72)]/20 rounded-full px-4 py-2 mb-6">
            <Building2 className="h-4 w-4 text-[rgb(18_49_72)]" />
            <span className="text-[rgb(18_49_72)] text-sm font-semibold">For Employers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Manage Your
            <br />
            <span className="text-[rgb(18_49_72)]">
              Apprentice Team
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track progress, ensure compliance, and support your apprentices with our employer portal.
            The apprentice app is 100% free - you only pay for the management tools.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[rgb(18_49_72)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[rgb(18_49_72)]/25">
                    Most Popular
                  </span>
                </div>
              )}
              <div
                className={`h-full flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? "bg-white border-2 border-[rgb(18_49_72)] shadow-xl shadow-[rgb(18_49_72)]/10"
                    : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-[rgb(18_49_72)]" : "text-green-500"}`} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="block mt-auto">
                  <Button
                    className={`w-full py-6 text-base font-semibold cursor-pointer ${
                      plan.popular
                        ? "bg-[rgb(18_49_72)] hover:bg-[rgb(12_35_52)] text-white shadow-lg shadow-[rgb(18_49_72)]/25"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Why Employers Choose Apprentice Log
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[rgb(18_49_72)] shadow-lg shadow-[rgb(18_49_72)]/25 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="h-4 w-4" />
            <span>Setup takes less than 2 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
