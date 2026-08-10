"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  isStaff: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  initialIsStaff,
  children,
}: {
  initialUser: User | null;
  initialIsStaff: boolean;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isStaff, setIsStaff] = useState(initialIsStaff);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsStaff(false);
        return;
      }
      supabase.rpc("is_staff").then(({ data }) => setIsStaff(data ?? false));
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, isStaff }), [user, isStaff]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
