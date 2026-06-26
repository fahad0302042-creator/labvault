"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ensureSeed,
  getCurrentUser,
  setCurrentUser,
} from "@/lib/lab/storage";
import { supabase, isSupabaseEnabled } from "@/lib/lab/supabase";
import type { LabUser } from "@/lib/lab/types";

type AuthContextValue = {
  user: LabUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth provider — uses real Supabase Auth when configured, falls back to
 * mock auth (any email + 4+ char password) for prototype mode.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LabUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureSeed();

    if (isSupabaseEnabled && supabase) {
      // Real Supabase: check existing session
      supabase.auth.getSession().then(({ data }) => {
        const session = data.session;
        if (session?.user) {
          const u: LabUser = {
            id: session.user.id,
            email: session.user.email ?? "",
            name:
              (session.user.user_metadata?.name as string) ??
              session.user.email?.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
              "Researcher",
            role: "admin",
          };
          setUser(u);
        }
        setLoading(false);
      });

      // Listen for auth changes (sign in / sign out)
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            const u: LabUser = {
              id: session.user.id,
              email: session.user.email ?? "",
              name:
                (session.user.user_metadata?.name as string) ??
                session.user.email?.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
                "Researcher",
              role: "admin",
            };
            setUser(u);
          } else {
            setUser(null);
          }
        },
      );

      return () => {
        listener.subscription.unsubscribe();
      };
    } else {
      // Mock auth fallback
      setUser(getCurrentUser());
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      // The onAuthStateChange listener will set the user
      return;
    }

    // Mock auth fallback
    await new Promise((r) => setTimeout(r, 450));
    const local = email.split("@")[0] || "Researcher";
    const name = local
      .split(/[._-]+/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    const u: LabUser = {
      id: `user-${local}`,
      email,
      name,
      role: "admin",
    };
    setCurrentUser(u);
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
    } else {
      setCurrentUser(null);
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
