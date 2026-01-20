"use client";

import { useState } from "react";
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
            <Skeleton key={i} className="h-20" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your organization's members and roles
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Seat Usage */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {activeMembers.length} of {organization?.max_seats || 5} seats used
                </p>
                <p className="text-sm text-muted-foreground">
                  {(organization?.max_seats || 5) - activeMembers.length} seats available
                </p>
              </div>
            </div>
            {activeMembers.length >= (organization?.max_seats || 5) && (
              <Link href="/employer/billing">
                <Button variant="outline" size="sm">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({pendingMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-amber-500/10 text-amber-600">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited as {roleLabels[member.role as OrganizationRole]}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Active Members ({activeMembers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.user?.full_name || member.email}
                  </p>
                  {member.user?.full_name && (
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  {roleIcons[member.role as OrganizationRole]}
                  {roleLabels[member.role as OrganizationRole]}
                </Badge>
                {member.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                        className="text-red-600"
                      >
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <InviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={inviteMember}
      />
    </div>
  );
}
