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
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    description: "Generate BCITO-ready reports with a few clicks",
  },
  {
    icon: CreditCard,
    title: "Simple Billing",
    description: "Transparent pricing with no hidden fees",
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
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Welcome to Employer Portal</h1>
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
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button size="lg" onClick={() => setStep(2)}>
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Create Your Organization</CardTitle>
                <CardDescription>
                  Enter your company name to set up your employer account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Smith Construction Ltd"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be visible to your apprentices
                  </p>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Your Starter plan includes:</h4>
                  <ul className="space-y-2">
                    {[
                      "Up to 5 apprentice seats",
                      "Logbook viewing and monitoring",
                      "Basic compliance reports",
                      "Email support",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    Free during beta. You can upgrade anytime.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
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
