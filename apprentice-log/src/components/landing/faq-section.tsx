"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is this service free to use?",
    answer:
      "Yes, Apprentice Log is completely free for all New Zealand apprentices. Our mission is to support the trade industry by making documentation accessible to everyone. No credit card required, no hidden fees.",
  },
  {
    question: "Will BCITO and employers accept these entries?",
    answer:
      "Absolutely. Our entries are formatted to meet BCITO documentation standards, including structured task descriptions, hours tracking, tools and equipment used, and skills demonstrated. Many employers have reported improved documentation quality from apprentices using our platform.",
  },
  {
    question: "How does the voice recording work without internet?",
    answer:
      "The application stores your voice recordings locally on your device. When you regain internet connectivity, entries are automatically processed and synced to our secure cloud. This ensures you never lose work, even on remote construction sites.",
  },
  {
    question: "How accurate is the speech recognition for trade terminology?",
    answer:
      "We utilise advanced AI trained on construction and trade vocabulary. The system accurately recognises industry-specific terms, tool names, and technical descriptions. Any minor corrections can be made before saving your entry.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Security is paramount. We employ enterprise-grade encryption for all data, both in transit and at rest. Your information is stored on ISO 27001 certified infrastructure, and only you can access your logbook entries.",
  },
  {
    question: "Can I use this on both iPhone and Android?",
    answer:
      "Yes, Apprentice Log works on any modern smartphone with a web browser. You can also install it directly to your home screen for quick access, providing a native app experience. An Android app is coming to the Play Store soon.",
  },
  {
    question: "What trades are supported?",
    answer:
      "While designed with BCITO building and construction apprentices in mind, our platform supports all trade apprenticeships including carpentry, electrical, plumbing, automotive, and more. The AI adapts to your specific industry terminology.",
  },
  {
    question: "How can I export my entries for submission?",
    answer:
      "Your complete entry history is accessible through the History section. You can view, search, and export your documentation at any time. We're also developing direct integration with BCITO systems for seamless submission.",
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
    <section ref={ref} id="faq" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gray-200 border border-gray-300 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700 text-sm font-semibold">Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about implementing Apprentice Log
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
                className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-orange-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
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
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
          <p className="text-gray-600 mb-2">Have additional questions?</p>
          <a
            href="mailto:support@apprenticelog.app"
            className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
          >
            Contact our support team →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
