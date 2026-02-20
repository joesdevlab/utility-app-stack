"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Check, X, Loader2, Handshake } from "lucide-react";
import { toast } from "sonner";

interface Invitation {
  id: string;
  role: string;
  status: string;
  invited_at: string;
  organization_id: string;
  organizations: {
    id: string;
    name: string;
  };
}

export function PendingInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/user/invitations", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitation = async (invitationId: string, action: "accept" | "decline") => {
    setProcessingId(invitationId);
    try {
      const response = await fetch("/api/user/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invitationId, action }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        // Remove the processed invitation from the list
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to process invitation");
      }
    } catch (error) {
      console.error("Failed to process invitation:", error);
      toast.error("Failed to process invitation");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return null;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4"
      >
        {invitations.map((invitation) => (
          <Card
            key={invitation.id}
            className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md overflow-hidden"
          >
            <CardContent className="py-4 px-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Handshake className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Team Invitation
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    <span className="font-medium text-orange-600">
                      {invitation.organizations?.name || "An employer"}
                    </span>{" "}
                    has invited you to join as{" "}
                    <span className="font-medium">{invitation.role}</span>
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                      onClick={() => handleInvitation(invitation.id, "accept")}
                      disabled={processingId === invitation.id}
                    >
                      {processingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300"
                      onClick={() => handleInvitation(invitation.id, "decline")}
                      disabled={processingId === invitation.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
