"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import Cookies from "js-cookie";

export default function AuthRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token =
      Cookies.get("token") ||
      Cookies.get("accessToken") ||
      (typeof document !== "undefined" && document.cookie.includes("token"));

    const isLoginPage = pathname === "/login" || pathname.startsWith("/login");

    // 1. If not authenticated, or not ADMIN role
    if (!isAuthenticated || !user || !token || user.role !== "ADMIN") {
      if (!isLoginPage) {
        router.replace("/login");
      }
      return;
    }

    // 2. If authenticated ADMIN visits login page
    if (user.role === "ADMIN" && isLoginPage) {
      router.replace("/");
    }
  }, [pathname, user, isAuthenticated, router]);

  return <>{children}</>;
}
