"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Save, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const { organization, refreshOrganization } = useAuth();
  const { updateOrganization, isLoading } = useOrganization();
  const [name, setName] = useState(organization?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!organization) return;
    if (deleteConfirmation !== organization.name) {
      toast.error("Organization name does not match");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete organization");
      }

      toast.success("Organization deleted successfully");
      await refreshOrganization();
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete organization");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Organization name must be at least 2 characters");
      return;
    }

    setIsSaving(true);
    try {
      await updateOrganization({ name: name.trim() });
      await refreshOrganization();
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization's profile and settings
        </p>
      </motion.div>

      {/* Organization Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50/50 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-900">Organization Details</span>
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                className="border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Organization URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`/org/${organization?.slug || ""}`}
                  disabled
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This URL is used for organization identification
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Plan</Label>
              <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50/30">
                <div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {organization?.plan === "pro" || organization?.plan === "paid" ? "Pro" : "Free"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {organization?.plan === "pro" || organization?.plan === "paid"
                      ? "Unlimited apprentices"
                      : "Up to 2 apprentices"}
                  </p>
                </div>
                <Link href="/employer/billing">
                  <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 hover:text-orange-600">
                    Manage Plan
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="border-b border-red-100">
            <CardTitle className="flex items-center gap-3 text-red-600">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-white">
              <div>
                <p className="font-medium text-gray-900">Delete Organization</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your organization and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Organization</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All members will be removed and any active subscription will be canceled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-700">This will permanently delete:</p>
                  <ul className="mt-1 text-red-600 list-disc list-inside space-y-1">
                    <li>All member records and invites</li>
                    <li>Organization settings and data</li>
                    <li>Active Stripe subscription (if any)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-gray-700">
                Type <span className="font-semibold">{organization?.name}</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Organization name"
                className="border-red-200 focus:border-red-400 focus:ring-red-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteModalOpen(false);
              setDeleteConfirmation("");
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || deleteConfirmation !== organization?.name}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
