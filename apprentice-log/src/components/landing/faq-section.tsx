"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is this actually free?",
    answer:
      "Yep, 100% free. We're building this for NZ apprentices and want everyone to have access. No credit card needed, no hidden fees, no catch.",
  },
  {
    question: "Will my boss or BCITO accept these entries?",
    answer:
      "Absolutely. The entries are formatted to match BCITO standards with tasks, hours, tools, and skills clearly documented. Many apprentices have told us their supervisors are impressed with the quality.",
  },
  {
    question: "What if I don't have internet on site?",
    answer:
      "No worries! The app works offline. Record your entries without signal and they'll sync automatically when you get back online. Perfect for remote sites.",
  },
  {
    question: "How accurate is the voice recognition?",
    answer:
      "We use the same AI that powers ChatGPT. It's really good at understanding Kiwi accents and trade terminology. If it gets something wrong, you can easily edit before saving.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "100%. Your data is encrypted both in transit and at rest. We use enterprise-grade security from Supabase. Only you can access your entries, and we never share or sell your data.",
  },
  {
    question: "Can I use this on iPhone and Android?",
    answer:
      "Yes! It works on any phone with a web browser. You can also install it as an app on your home screen for quick access. We're also launching on the Play Store soon.",
  },
  {
    question: "What if I'm not doing construction?",
    answer:
      "While we built this with BCITO apprentices in mind, it works for any trade apprenticeship - electrical, plumbing, automotive, you name it. The AI adapts to whatever work you describe.",
  },
  {
    question: "How do I export my entries for BCITO?",
    answer:
      "You can view all your entries in the History section and export them anytime. We're also working on direct BCITO integration - stay tuned!",
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 text-sm font-medium">Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Apprentice Log
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-left hover:border-slate-600 transition-colors duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white text-lg">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </motion.div>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                    marginTop: openIndex === index ? 12 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 mb-2">Still have questions?</p>
          <a
            href="mailto:support@apprenticelog.app"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Get in touch with us →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
