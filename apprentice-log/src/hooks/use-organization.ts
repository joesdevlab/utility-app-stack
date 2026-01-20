"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  OrganizationWithRole,
  OrganizationStats,
  OrganizationMember,
  ApprenticeWithStats,
  OrganizationRole,
  OrganizationPlan,
} from "@/types";

export interface UseOrganizationReturn {
  organization: OrganizationWithRole | null;
  stats: OrganizationStats | null;
  isLoading: boolean;
  error: string | null;
  isEmployer: boolean;
  isOwnerOrAdmin: boolean;
  refetch: () => Promise<void>;
  createOrganization: (name: string) => Promise<OrganizationWithRole>;
  updateOrganization: (data: Partial<OrganizationWithRole>) => Promise<void>;
  createCheckout: (plan: OrganizationPlan) => Promise<void>;
  openPortal: () => Promise<void>;
}

export function useOrganization(): UseOrganizationReturn {
  const [organization, setOrganization] = useState<OrganizationWithRole | null>(null);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/organizations");

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          setOrganization(null);
          return;
        }
        if (response.status === 404) {
          // No organization - not an employer yet
          setOrganization(null);
          return;
        }
        throw new Error("Failed to fetch organization");
      }

      const data = await response.json();
      setOrganization(data.organization);
      setStats(data.stats);
    } catch (err) {
      console.error("Organization fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const createOrganization = useCallback(async (name: string): Promise<OrganizationWithRole> => {
    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create organization");
    }

    const data = await response.json();
    setOrganization(data.organization);
    return data.organization;
  }, []);

  const updateOrganization = useCallback(async (data: Partial<OrganizationWithRole>) => {
    if (!organization) throw new Error("No organization to update");

    const response = await fetch(`/api/organizations/${organization.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update organization");
    }

    const result = await response.json();
    setOrganization(result.organization);
  }, [organization]);

  const createCheckout = useCallback(async (plan: OrganizationPlan) => {
    const response = await fetch("/api/employer/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout");
    }

    const { url } = await response.json();
    window.location.href = url;
  }, []);

  const openPortal = useCallback(async () => {
    const response = await fetch("/api/employer/portal", {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to open billing portal");
    }

    const { url } = await response.json();
    window.location.href = url;
  }, []);

  const isEmployer = organization !== null;
  const isOwnerOrAdmin = organization !== null &&
    (organization.role === 'owner' || organization.role === 'admin');

  return {
    organization,
    stats,
    isLoading,
    error,
    isEmployer,
    isOwnerOrAdmin,
    refetch: fetchOrganization,
    createOrganization,
    updateOrganization,
    createCheckout,
    openPortal,
  };
}

// Hook for managing organization members
export interface UseOrgMembersReturn {
  members: OrganizationMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  inviteMember: (email: string, role: OrganizationRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: OrganizationRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

export function useOrgMembers(organizationId: string | undefined): UseOrgMembersReturn {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/organizations/${organizationId}/members`);

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      setMembers(data.members);
    } catch (err) {
      console.error("Members fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const inviteMember = useCallback(async (email: string, role: OrganizationRole) => {
    if (!organizationId) throw new Error("No organization");

    const response = await fetch(`/api/organizations/${organizationId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to invite member");
    }

    await fetchMembers();
  }, [organizationId, fetchMembers]);

  const updateMemberRole = useCallback(async (memberId: string, role: OrganizationRole) => {
    if (!organizationId) throw new Error("No organization");

    const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update member");
    }

    await fetchMembers();
  }, [organizationId, fetchMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!organizationId) throw new Error("No organization");

    const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove member");
    }

    await fetchMembers();
  }, [organizationId, fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  };
}

// Hook for fetching apprentices with stats (for employer dashboard)
export interface UseOrgApprenticesReturn {
  apprentices: ApprenticeWithStats[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrgApprentices(organizationId: string | undefined): UseOrgApprenticesReturn {
  const [apprentices, setApprentices] = useState<ApprenticeWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprentices = useCallback(async () => {
    if (!organizationId) {
      setApprentices([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/organizations/${organizationId}/apprentices`);

      if (!response.ok) {
        throw new Error("Failed to fetch apprentices");
      }

      const data = await response.json();
      setApprentices(data.apprentices);
    } catch (err) {
      console.error("Apprentices fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setApprentices([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchApprentices();
  }, [fetchApprentices]);

  return {
    apprentices,
    isLoading,
    error,
    refetch: fetchApprentices,
  };
}
