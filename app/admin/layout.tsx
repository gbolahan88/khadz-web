// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading, roleLoading } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    // Wait for BOTH firebase auth AND role fetch to finish
    if (loading || roleLoading) return;

    // Now the state is settled
    if (!user) {
      router.push("/admin/login");
      return;
    }

    if (!isAdmin) {
      router.push("/");
    }
  }, [user, isAdmin, loading, roleLoading, isLoginPage, router]);

  // Always render children — page handles its own loading UI
  return <>{children}</>;
}