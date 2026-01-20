"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrgMembers } from "@/hooks/use-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, UserPlus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { OrganizationRole } from "@/types";

export default function InvitePage() {
  const router = useRouter();
  const { organization } = useAuth();
  const { inviteMember } = useOrgMembers(organization?.id);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>("apprentice");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await inviteMember(email, role);
      toast.success("Invitation sent successfully!");
      router.push("/employer/team");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employer/team">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Invite Team Member</h1>
          <p className="text-muted-foreground">
            Add a new member to your organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Send Invitation
          </CardTitle>
          <CardDescription>
            Enter the email address of the person you want to invite. They will receive
            an email with instructions to join your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="apprentice@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Role</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["apprentice", "supervisor", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      role === r
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium capitalize">{r}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {r === "apprentice" && "Can log hours and view their own entries"}
                      {r === "supervisor" && "Can view apprentice entries and hours"}
                      {r === "admin" && "Full access to manage team and settings"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
              <Link href="/employer/team">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
