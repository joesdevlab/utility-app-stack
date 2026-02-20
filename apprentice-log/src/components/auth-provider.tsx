"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, AuthMFAEnrollResponse, Factor } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { OrganizationWithRole } from "@/types";

interface MFAEnrollmentData {
  id: string;
  type: "totp";
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  organization: OrganizationWithRole | null;
  isEmployer: boolean;
  orgLoading: boolean;
  mfaEnabled: boolean;
  mfaRequired: boolean;
  refreshOrganization: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; mfaRequired?: boolean }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resendVerification: (email: string) => Promise<{ error: Error | null }>;
  // MFA methods
  enrollMFA: () => Promise<{ data: MFAEnrollmentData | null; error: Error | null }>;
  verifyMFAEnrollment: (factorId: string, code: string) => Promise<{ error: Error | null }>;
  verifyMFAChallenge: (code: string) => Promise<{ error: Error | null }>;
  unenrollMFA: (factorId: string) => Promise<{ error: Error | null }>;
  getMFAFactors: () => Promise<{ factors: Factor[]; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organization, setOrganization] = useState<OrganizationWithRole | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const supabase = isSupabaseConfigured ? createClient() : null;

  const fetchOrganization = useCallback(async () => {
    setOrgLoading(true);
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
      } else {
        setOrganization(null);
      }
    } catch {
      setOrganization(null);
    } finally {
      setOrgLoading(false);
    }
  }, []);

  const checkMFAStatus = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        console.error("Error checking MFA status:", error);
        return;
      }
      const verifiedFactors = data.totp.filter(f => f.status === "verified");
      setMfaEnabled(verifiedFactors.length > 0);
    } catch (err) {
      console.error("Error in checkMFAStatus:", err);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) {
        fetchOrganization();
        checkMFAStatus();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (session?.user) {
          fetchOrganization();
          checkMFAStatus();
        } else {
          setOrganization(null);
          setMfaEnabled(false);
          setMfaRequired(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchOrganization, checkMFAStatus]);

  const notConfiguredError = new Error("Supabase is not configured");

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: notConfiguredError, mfaRequired: false };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error as Error | null, mfaRequired: false };
    }

    // Check if MFA verification is required
    if (data.session) {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2") {
        setMfaRequired(true);
        return { error: null, mfaRequired: true };
      }
    }

    await checkMFAStatus();
    return { error: null, mfaRequired: false };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  };

  const resendVerification = async (email: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return { error: error as Error | null };
  };

  // MFA Methods
  const enrollMFA = async () => {
    if (!supabase) return { data: null, error: notConfiguredError };
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });

    if (error) {
      return { data: null, error: error as Error };
    }

    return {
      data: data as MFAEnrollmentData,
      error: null,
    };
  };

  const verifyMFAEnrollment = async (factorId: string, code: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      return { error: challengeError as Error };
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return { error: verifyError as Error };
    }

    setMfaEnabled(true);
    setMfaRequired(false);
    return { error: null };
  };

  const verifyMFAChallenge = async (code: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      return { error: factorsError as Error };
    }

    const verifiedFactor = factorsData.totp.find(f => f.status === "verified");
    if (!verifiedFactor) {
      return { error: new Error("No verified MFA factor found") };
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });

    if (challengeError) {
      return { error: challengeError as Error };
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: verifiedFactor.id,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return { error: verifyError as Error };
    }

    setMfaRequired(false);
    return { error: null };
  };

  const unenrollMFA = async (factorId: string) => {
    if (!supabase) return { error: notConfiguredError };
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (!error) {
      setMfaEnabled(false);
    }
    return { error: error as Error | null };
  };

  const getMFAFactors = async () => {
    if (!supabase) return { factors: [] as Factor[], error: notConfiguredError };
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      return { factors: [] as Factor[], error: error as Error };
    }
    return { factors: data.totp, error: null };
  };

  const isEmployer = organization !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        organization,
        isEmployer,
        orgLoading,
        mfaEnabled,
        mfaRequired,
        refreshOrganization: fetchOrganization,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        resendVerification,
        enrollMFA,
        verifyMFAEnrollment,
        verifyMFAChallenge,
        unenrollMFA,
        getMFAFactors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
