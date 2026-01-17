"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;

    const initUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);

      const { data: authData } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );
      subscription = authData.subscription;
    };

    initUser();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}
