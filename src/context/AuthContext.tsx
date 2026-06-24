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
import type { LabUser } from "@/lib/lab/types";

type AuthContextValue = {
  user: LabUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Mock auth — in production this is a thin wrapper around Supabase Auth.
 * Any email + password (≥4 chars) succeeds for the prototype.
 *
 * The user's display name is derived from the email local-part so the
 * dashboard greeting feels real without a profile form.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LabUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureSeed();
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mimic network latency for believable UX
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

  const signOut = useCallback(() => {
    setCurrentUser(null);
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
