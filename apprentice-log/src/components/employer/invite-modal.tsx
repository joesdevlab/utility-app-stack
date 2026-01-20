"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OrganizationRole } from "@/types";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: OrganizationRole) => Promise<void>;
}

export function InviteModal({ open, onOpenChange, onInvite }: InviteModalProps) {
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
      await onInvite(email, role);
      toast.success("Invitation sent!");
      setEmail("");
      setRole("apprentice");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-sm">
                Send an invitation to add a new member
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="apprentice@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-700 font-medium">Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["apprentice", "supervisor", "admin"] as const).map((r) => (
                  <motion.button
                    key={r}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                      role === r
                        ? "border-orange-500 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                        : "border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-700"
                    )}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {role === "apprentice" && "Can log hours and view their own entries"}
                {role === "supervisor" && "Can view apprentice entries and hours"}
                {role === "admin" && "Full access to manage team and settings"}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
