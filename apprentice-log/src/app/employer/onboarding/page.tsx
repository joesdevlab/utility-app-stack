"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowRight, Check, Users, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "Team Management",
    description: "Invite and manage your apprentices from one dashboard",
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-100 to-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    description: "Generate BCITO-ready reports with a few clicks",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-100 to-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Simple Billing",
    description: "Transparent pricing with no hidden fees",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-100 to-green-50",
    iconColor: "text-green-600",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshOrganization } = useAuth();
  const { createOrganization } = useOrganization();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrganization = async () => {
    if (!orgName.trim() || orgName.trim().length < 2) {
      toast.error("Organization name must be at least 2 characters");
      return;
    }

    setIsLoading(true);
    try {
      await createOrganization(orgName.trim());
      await refreshOrganization();
      toast.success("Organization created successfully!");
      router.push("/employer/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative inline-block"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-orange-500/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome to Employer Portal</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Manage your apprentices, track their progress, and generate compliance reports all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg hover:border-orange-200 transition-all">
                    <CardContent className="pt-6 text-center">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.bgColor} mb-4`}>
                        <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 px-8"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardHeader className="text-center border-b bg-gradient-to-r from-orange-50/50 to-transparent">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-gray-900">Create Your Organization</CardTitle>
                <CardDescription>
                  Enter your company name to set up your employer account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-gray-700 font-medium">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Smith Construction Ltd"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    autoFocus
                    className="border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be visible to your apprentices
                  </p>
                </div>

                <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Your Starter plan includes:</h4>
                  <ul className="space-y-2">
                    {[
                      "Up to 5 apprentice seats",
                      "Logbook viewing and monitoring",
                      "Basic compliance reports",
                      "Email support",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground pt-2">
                    Free during beta. You can upgrade anytime.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
                    onClick={handleCreateOrganization}
                    disabled={isLoading || !orgName.trim()}
                  >
                    {isLoading ? "Creating..." : "Create Organization"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
