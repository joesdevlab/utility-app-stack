"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  FileText,
  Crown,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Calendar,
  CreditCard,
  ExternalLink,
} from "lucide-react";

interface Employer {
  id: string;
  name: string;
  slug: string;
  owner: { name: string; email: string };
  ownerId: string;
  plan: string;
  status: string;
  maxSeats: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  stats: {
    totalMembers: number;
    activeApprentices: number;
    pendingInvites: number;
    entriesLast30Days: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface EmployerDetail extends Employer {
  members: Array<{
    id: string;
    userId: string | null;
    email: string;
    name: string | null;
    role: string;
    status: string;
    invitedAt: string;
    joinedAt: string | null;
  }>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    active: { color: "bg-emerald-100 text-emerald-700", label: "Active" },
    trialing: { color: "bg-blue-100 text-blue-700", label: "Trialing" },
    canceled: { color: "bg-rose-100 text-rose-700", label: "Canceled" },
    past_due: { color: "bg-amber-100 text-amber-700", label: "Past Due" },
    incomplete: { color: "bg-gray-100 text-gray-700", label: "Incomplete" },
  };
  const { color, label } = config[status] || { color: "bg-gray-100 text-gray-700", label: status };

  return <Badge className={`${color} border-0`}>{label}</Badge>;
}

function PlanBadge({ plan }: { plan: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pro: { color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white", icon: <Crown className="h-3 w-3" />, label: "Pro" },
    paid: { color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white", icon: <Crown className="h-3 w-3" />, label: "Pro" },
    professional: { color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white", icon: <Crown className="h-3 w-3" />, label: "Pro" },
    free: { color: "bg-gray-100 text-gray-700", icon: null, label: "Free" },
    starter: { color: "bg-gray-100 text-gray-700", icon: null, label: "Free" },
  };
  const { color, icon, label } = config[plan] || { color: "bg-gray-100 text-gray-700", icon: null, label: plan };

  return (
    <Badge className={`${color} border-0 gap-1`}>
      {icon}
      {label}
    </Badge>
  );
}

export function EmployerManager() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerDetail | null>(null);
  const [expandedEmployerId, setExpandedEmployerId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    ownerEmail: "",
    plan: "free",
    maxSeats: 2,
  });
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("apprentice");
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmployers = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/employers");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch employers");
      }
      const result = await response.json();
      setEmployers(result.employers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchEmployerDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/employers/${id}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch employer details");
      }
      const result = await response.json();
      setSelectedEmployer(result.employer);
      setExpandedEmployerId(id);
    } catch (err) {
      console.error("Failed to fetch employer detail:", err);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/employers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create employer");
      }
      await fetchEmployers();
      setIsCreateModalOpen(false);
      setFormData({ name: "", ownerEmail: "", plan: "free", maxSeats: 2 });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create employer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEmployer) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/employers/${selectedEmployer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          plan: formData.plan,
          maxSeats: formData.maxSeats,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update employer");
      }
      await fetchEmployers();
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update employer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (hard = false) => {
    if (!selectedEmployer) return;
    setIsSaving(true);
    try {
      const url = `/api/admin/employers/${selectedEmployer.id}${hard ? "?hard=true" : ""}`;
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete employer");
      }
      await fetchEmployers();
      setIsDeleteModalOpen(false);
      setSelectedEmployer(null);
      setExpandedEmployerId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete employer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedEmployer) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/employers/${selectedEmployer.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to add member");
      }
      await fetchEmployerDetail(selectedEmployer.id);
      await fetchEmployers();
      setIsAddMemberModalOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("apprentice");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedEmployer) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(
        `/api/admin/employers/${selectedEmployer.id}/members?memberId=${memberId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to remove member");
      }
      await fetchEmployerDetail(selectedEmployer.id);
      await fetchEmployers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const filteredEmployers = employers.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
          <p className="text-rose-700 font-medium">{error}</p>
          <Button onClick={() => fetchEmployers()} className="mt-4" variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchEmployers(true)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setFormData({ name: "", ownerEmail: "", plan: "free", maxSeats: 2 });
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employer
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{employers.length}</p>
                <p className="text-xs text-muted-foreground">Total Employers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                <Crown className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {employers.filter((e) => e.plan === "pro" || e.plan === "paid" || e.plan === "professional").length}
                </p>
                <p className="text-xs text-muted-foreground">Pro Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {employers.reduce((sum, e) => sum + e.stats.activeApprentices, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Active Apprentices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {employers.reduce((sum, e) => sum + e.stats.entriesLast30Days, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Entries (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employer List */}
      <div className="space-y-3">
        {filteredEmployers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No employers match your search" : "No employers yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmployers.map((employer, i) => (
            <motion.div
              key={employer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{employer.name}</h3>
                          <PlanBadge plan={employer.plan} />
                          <StatusBadge status={employer.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {employer.owner.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {employer.stats.activeApprentices} apprentices
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {employer.stats.entriesLast30Days} entries
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (expandedEmployerId === employer.id) {
                            setExpandedEmployerId(null);
                            setSelectedEmployer(null);
                          } else {
                            fetchEmployerDetail(employer.id);
                          }
                        }}
                      >
                        {expandedEmployerId === employer.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          fetchEmployerDetail(employer.id).then(() => {
                            setFormData({
                              name: employer.name,
                              ownerEmail: employer.owner.email,
                              plan: employer.plan,
                              maxSeats: employer.maxSeats,
                            });
                            setIsEditModalOpen(true);
                          });
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                          fetchEmployerDetail(employer.id).then(() => {
                            setIsDeleteModalOpen(true);
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedEmployerId === employer.id && selectedEmployer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Slug</p>
                              <p className="font-medium">{selectedEmployer.slug}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Owner</p>
                              <p className="font-medium">{selectedEmployer.owner?.name || "Unknown"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Max Seats</p>
                              <p className="font-medium">{selectedEmployer.maxSeats}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-medium">
                                {new Date(selectedEmployer.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Stripe Info */}
                          {selectedEmployer.stripeCustomerId && (
                            <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-violet-600" />
                                <span className="text-sm font-medium text-violet-700">Stripe</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-violet-600">Customer ID</p>
                                  <p className="font-mono text-xs">{selectedEmployer.stripeCustomerId}</p>
                                </div>
                                {selectedEmployer.currentPeriodEnd && (
                                  <div>
                                    <p className="text-violet-600">Period Ends</p>
                                    <p className="font-medium">
                                      {new Date(selectedEmployer.currentPeriodEnd).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Members */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                Members ({selectedEmployer.members?.length || 0})
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsAddMemberModalOpen(true)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add Member
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {selectedEmployer.members?.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {member.name || member.email}
                                      </p>
                                      {member.name && (
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        member.role === "owner"
                                          ? "border-orange-200 text-orange-700"
                                          : member.role === "admin"
                                          ? "border-violet-200 text-violet-700"
                                          : "border-gray-200"
                                      }
                                    >
                                      {member.role}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={
                                        member.status === "active"
                                          ? "border-emerald-200 text-emerald-700"
                                          : "border-amber-200 text-amber-700"
                                      }
                                    >
                                      {member.status}
                                    </Badge>
                                    {member.role !== "owner" && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-rose-500 hover:text-rose-600"
                                        onClick={() => handleRemoveMember(member.id)}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employer</DialogTitle>
            <DialogDescription>
              Create a new employer organization. The owner must have an existing account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Acme Construction Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="owner@example.com"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This user must already have an account.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      plan: value,
                      maxSeats: value === "pro" ? 999 : 2,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro ($29/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSeats">Max Seats</Label>
                <Input
                  id="maxSeats"
                  type="number"
                  min="1"
                  value={formData.maxSeats}
                  onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) || 2 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSaving || !formData.name || !formData.ownerEmail}
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSaving ? "Creating..." : "Create Employer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employer</DialogTitle>
            <DialogDescription>
              Update the employer organization details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      plan: value,
                      maxSeats: value === "pro" ? 999 : formData.maxSeats,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro ($29/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxSeats">Max Seats</Label>
                <Input
                  id="edit-maxSeats"
                  type="number"
                  min="1"
                  value={formData.maxSeats}
                  onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) || 2 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSaving || !formData.name}
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600">Delete Employer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedEmployer?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-rose-700">This action cannot be undone</p>
                  <p className="text-rose-600 mt-1">
                    Canceling will mark the organization as canceled but preserve data.
                    Hard delete will permanently remove all data.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDelete(false)}
              disabled={isSaving}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              {isSaving ? "Processing..." : "Cancel Subscription"}
            </Button>
            <Button
              onClick={() => handleDelete(true)}
              disabled={isSaving}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isSaving ? "Deleting..." : "Hard Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to {selectedEmployer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="apprentice@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apprentice">Apprentice</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={isSaving || !newMemberEmail}
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSaving ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
