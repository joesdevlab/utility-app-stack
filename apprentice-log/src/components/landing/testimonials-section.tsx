"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Jake T.",
    role: "3rd Year Carpentry Apprentice",
    location: "Auckland",
    avatar: "JT",
    rating: 5,
    quote:
      "Used to dread doing my logbook after work. Now I just talk into my phone on the drive home and it's done. Bloody brilliant.",
    highlight: "Saves me 15+ minutes every day",
  },
  {
    name: "Sarah M.",
    role: "2nd Year Building Apprentice",
    location: "Wellington",
    avatar: "SM",
    rating: 5,
    quote:
      "My supervisor actually commented that my entries have gotten way more detailed. The AI picks up stuff I'd forget to write down.",
    highlight: "Better quality entries",
  },
  {
    name: "Tama R.",
    role: "4th Year Apprentice",
    location: "Christchurch",
    avatar: "TR",
    rating: 5,
    quote:
      "I was 6 months behind on my logbook. Caught up in two weeks using this app. Wish I'd found it sooner.",
    highlight: "Caught up in 2 weeks",
  },
  {
    name: "Mike D.",
    role: "1st Year Apprentice",
    location: "Hamilton",
    avatar: "MD",
    rating: 5,
    quote:
      "Started using it from day one of my apprenticeship. My mates who write theirs by hand are jealous as.",
    highlight: "Easy from day one",
  },
  {
    name: "Emma L.",
    role: "3rd Year Apprentice",
    location: "Tauranga",
    avatar: "EL",
    rating: 5,
    quote:
      "Works even when I'm out on rural sites with no signal. Just sync when I get home. Game changer.",
    highlight: "Works offline",
  },
  {
    name: "Chris W.",
    role: "2nd Year Carpentry Apprentice",
    location: "Dunedin",
    avatar: "CW",
    rating: 5,
    quote:
      "The voice recognition is crazy accurate. Even understands my accent and the technical terms we use on site.",
    highlight: "Understands trade talk",
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
    <section ref={ref} className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Loved by Kiwi Apprentices</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Real Tradies, Real Results
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Join hundreds of NZ apprentices who&apos;ve made logbook entries actually bearable.
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
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8">
              <Quote className="h-10 w-10 text-blue-500/30 mb-4" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-lg text-white mb-6 leading-relaxed">
                &quot;{testimonials[currentIndex].quote}&quot;
              </p>

              <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <span className="text-blue-400 text-sm font-medium">
                  {testimonials[currentIndex].highlight}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {testimonials[currentIndex].avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonials[currentIndex].name}</div>
                  <div className="text-sm text-slate-400">
                    {testimonials[currentIndex].role} · {testimonials[currentIndex].location}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-700"
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
                      i === currentIndex ? "bg-blue-500" : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-700"
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
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full hover:border-slate-700 transition-all duration-300 hover:transform hover:-translate-y-1">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 mb-4 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Highlight */}
                <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-blue-400 text-xs font-medium">{testimonial.highlight}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">
                      {testimonial.role} · {testimonial.location}
                    </div>
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
          className="mt-16 flex flex-wrap justify-center items-center gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-slate-400">Active Users</div>
          </div>
          <div className="w-px h-12 bg-slate-800 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">25,000+</div>
            <div className="text-sm text-slate-400">Entries Created</div>
          </div>
          <div className="w-px h-12 bg-slate-800 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">4.9</div>
            <div className="text-sm text-slate-400">Average Rating</div>
          </div>
          <div className="w-px h-12 bg-slate-800 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">NZ</div>
            <div className="text-sm text-slate-400">Built in Aotearoa</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
