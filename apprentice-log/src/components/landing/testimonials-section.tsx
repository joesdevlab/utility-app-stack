"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Building2, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "James Thompson",
    role: "3rd Year Carpentry Apprentice",
    company: "Fletcher Construction",
    avatar: "JT",
    rating: 5,
    quote:
      "The voice recording feature has completely transformed my daily routine. What used to take 20 minutes of typing now takes 30 seconds of talking.",
    highlight: "90% time reduction",
  },
  {
    name: "Sarah Mitchell",
    role: "2nd Year Building Apprentice",
    company: "Naylor Love",
    avatar: "SM",
    rating: 5,
    quote:
      "My supervisor commented on the improved quality of my entries. The AI captures technical details I would have forgotten to write down.",
    highlight: "Improved documentation quality",
  },
  {
    name: "Te Koha Rawiri",
    role: "4th Year Apprentice",
    company: "Hawkins Construction",
    avatar: "TR",
    rating: 5,
    quote:
      "I was six months behind on my logbook. With Apprentice Log, I caught up in two weeks. The offline feature is essential for remote sites.",
    highlight: "Caught up in 2 weeks",
  },
  {
    name: "Michael Chen",
    role: "1st Year Apprentice",
    company: "Dominion Constructors",
    avatar: "MC",
    rating: 5,
    quote:
      "Started using it from day one of my apprenticeship. The structured format ensures I'm capturing everything needed for my qualification.",
    highlight: "BCITO compliant from day one",
  },
  {
    name: "Emma Williams",
    role: "3rd Year Apprentice",
    company: "Russell Group",
    avatar: "EW",
    rating: 5,
    quote:
      "Works perfectly on rural sites with no cell coverage. I record my entries throughout the day and sync when I'm back in town.",
    highlight: "Reliable offline capability",
  },
  {
    name: "David Patterson",
    role: "2nd Year Carpentry Apprentice",
    company: "Arrow International",
    avatar: "DP",
    rating: 5,
    quote:
      "The speech recognition understands trade terminology perfectly. It knows the difference between a joist and a beam without any corrections needed.",
    highlight: "Industry-specific accuracy",
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            <span className="text-amber-700 text-sm font-semibold">Industry Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Trade Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join hundreds of apprentices across New Zealand&apos;s leading construction companies
            who have streamlined their documentation process.
          </p>
        </motion.div>

        {/* Featured testimonial (mobile carousel) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:hidden mb-12"
        >
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <Quote className="h-10 w-10 text-orange-200 mb-4" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                ))}
              </div>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                &quot;{testimonials[currentIndex].quote}&quot;
              </p>

              <div className="inline-block bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
                <span className="text-orange-700 text-sm font-semibold">
                  {testimonials[currentIndex].highlight}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                  {testimonials[currentIndex].avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonials[currentIndex].name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonials[currentIndex].role}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">
                    {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300"
                onClick={prevTestimonial}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300"
                onClick={nextTestimonial}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Testimonials grid (desktop) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Highlight */}
                <div className="inline-block bg-orange-100 border border-orange-200 rounded-full px-3 py-1 mb-4">
                  <span className="text-orange-700 text-xs font-semibold">{testimonial.highlight}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                    <div className="text-xs text-orange-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-white border border-gray-200 rounded-2xl p-8"
        >
          <div className="grid sm:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">25,000+</div>
              <div className="text-sm text-gray-500">Entries Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-500">User Rating</div>
            </div>
            <div>
              <div className="flex justify-center gap-2 mb-1">
                <Building2 className="h-6 w-6 text-orange-500" />
                <HardHat className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-sm text-gray-500">NZ Trade Industry</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
