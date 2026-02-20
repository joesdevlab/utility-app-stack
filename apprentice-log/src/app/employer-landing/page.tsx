"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingHeader } from "@/components/landing/marketing-header";
import {
  Building2,
  Users,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  Check,
  ChevronRight,
  Star,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Users,
    title: "Team Management",
    description: "Invite apprentices, assign supervisors, and manage your entire team from one dashboard.",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Monitor apprentice hours and activity as they log their daily work entries.",
  },
  {
    icon: FileText,
    title: "BCITO Compliance Reports",
    description: "Generate audit-ready PDF and CSV reports with a single click.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Control who can view and manage entries with owner, admin, supervisor, and apprentice roles.",
  },
  {
    icon: BarChart3,
    title: "Activity Insights",
    description: "See which apprentices need attention with automatic low-activity alerts.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get started in minutes. Invite your first apprentice today.",
  },
];

const plans = [
  {
    name: "Starter",
    price: 29,
    seats: "1-5",
    features: [
      "Up to 5 apprentice seats",
      "Apprentice logbook viewing",
      "Basic activity reports",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: 79,
    seats: "6-20",
    popular: true,
    features: [
      "Up to 20 apprentice seats",
      "Everything in Starter",
      "BCITO compliance reports",
      "CSV & PDF exports",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: 149,
    seats: "21+",
    features: [
      "Up to 100 apprentice seats",
      "Everything in Professional",
      "Custom reporting",
      "API access",
      "Dedicated support",
    ],
  },
];

const testimonials = [
  {
    quote: "Finally, a simple way to keep track of all our apprentices' progress. The compliance reports save us hours every month.",
    author: "Mike T.",
    role: "Owner, T&M Construction",
    stars: 5,
  },
  {
    quote: "We were using spreadsheets before. This is so much better. Our apprentices actually enjoy logging their hours now.",
    author: "Sarah K.",
    role: "Training Manager, ElectroCraft Ltd",
    stars: 5,
  },
];

export default function EmployerLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
                <Building2 className="h-3 w-3 mr-1" />
                For Employers & Training Managers
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
            >
              Manage Your Apprentices
              <span className="text-orange-500"> with Confidence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Track hours, monitor progress, and generate BCITO-ready compliance reports.
              Everything you need to support your trade apprentices in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/employer">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-sm text-gray-500"
            >
              Free during beta. No credit card required.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Manage Your Team
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Purpose-built for NZ trade employers and training managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Trusted by NZ Trade Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.stars)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your team size. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={plan.popular ? "md:-mt-4 md:mb-4" : ""}
              >
                <Card className={`h-full relative ${plan.popular ? "border-orange-500 shadow-xl" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="pt-8">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.seats} apprentices</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/employer" className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Get Started
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center mt-8 text-gray-500">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Simplify Apprentice Management?
            </h2>
            <p className="text-orange-100 text-lg mb-8">
              Join hundreds of NZ trade businesses already using Apprentice Log.
            </p>
            <Link href="/employer">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg shadow-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-white">Apprentice Log</span>
              <Badge variant="secondary" className="ml-2">For Employers</Badge>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                For Apprentices
              </Link>
              <Link href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Apprentice Log. Made in NZ.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
