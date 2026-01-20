"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { useOrgMembers } from "@/hooks/use-organization";
import { InviteModal } from "@/components/employer/invite-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Crown,
  User,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import type { OrganizationRole } from "@/types";

const roleIcons: Record<OrganizationRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  supervisor: <Eye className="h-4 w-4" />,
  apprentice: <User className="h-4 w-4" />,
};

const roleLabels: Record<OrganizationRole, string> = {
  owner: "Owner",
  admin: "Admin",
  supervisor: "Supervisor",
  apprentice: "Apprentice",
};

export default function TeamPage() {
  const { organization } = useAuth();
  const { members, isLoading, inviteMember, updateMemberRole, removeMember } =
    useOrgMembers(organization?.id);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleRoleChange = async (memberId: string, newRole: OrganizationRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeMember(memberId);
      toast.success("Member removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const getInitials = (member: (typeof members)[0]) => {
    if (member.user?.full_name) {
      return member.user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return member.email[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your organization's members and roles
          </p>
        </div>
        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </motion.div>

      {/* Seat Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="hover:shadow-lg hover:border-orange-200 transition-all">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {activeMembers.length} of {organization?.max_seats || 5} seats used
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(organization?.max_seats || 5) - activeMembers.length} seats available
                  </p>
                </div>
              </div>
              {activeMembers.length >= (organization?.max_seats || 5) && (
                <Link href="/employer/billing">
                  <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 hover:text-orange-600">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-amber-50/50 to-transparent">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-gray-900">Pending Invitations ({pendingMembers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {pendingMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-100"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-amber-100">
                      <AvatarFallback className="bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 font-semibold">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{member.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited as {roleLabels[member.role as OrganizationRole]}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pending</Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-gray-900">Active Members ({activeMembers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {activeMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl border hover:border-orange-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-orange-100">
                    <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 font-semibold">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user?.full_name || member.email}
                    </p>
                    {member.user?.full_name && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 border-orange-200 text-orange-700">
                    {roleIcons[member.role as OrganizationRole]}
                    {roleLabels[member.role as OrganizationRole]}
                  </Badge>
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-orange-50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "admin")}
                          disabled={member.role === "admin"}
                        >
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "supervisor")}
                          disabled={member.role === "supervisor"}
                        >
                          Make Supervisor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "apprentice")}
                          disabled={member.role === "apprentice"}
                        >
                          Make Apprentice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <InviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={inviteMember}
      />
    </div>
  );
}
