// context/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { syncUserToPostgres } from "@/lib/sync-user";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  roleLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  roleLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        setRoleLoading(true);
        await syncUserToPostgres(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken(true);
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data.user?.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("Role fetch failed:", e);
          setIsAdmin(false);
        } finally {
          setRoleLoading(false);
        }
      } else {
        setIsAdmin(false);
        setRoleLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, roleLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);