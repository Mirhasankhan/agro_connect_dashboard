"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Truck,
  ShoppingBag,
  Grid,
  Package,
  Wallet,
  Coins,
  AlertOctagon,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  X,
  User,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Auto-expand User Management if currently on a sub-route
  const isUserMgmtActive = pathname.startsWith("/users");
  const [userMgmtOpen, setUserMgmtOpen] = useState(true);

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    dispatch(logout());
    router.replace("/login");
  };

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinks = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    // User Management will be handled with nested menu below
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingBag,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: Grid,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Driver Earnings",
      href: "/driver-earnings",
      icon: Wallet,
    },
    {
      name: "Producer Earnings",
      href: "/producer-earnings",
      icon: Coins,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: AlertOctagon,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const userSubLinks = [
    {
      name: "Buyer Management",
      href: "/users/buyers",
      icon: User,
    },
    {
      name: "Driver Management",
      href: "/users/drivers",
      icon: Truck,
    },
    {
      name: "Producer Management",
      href: "/users/producers",
      icon: UserCheck,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-sm flex items-center justify-center">
            <Image
              src={logoImg}
              alt="AgroConnect"
              width={120}
              height={32}
              className="h-6 w-auto object-contain"
              priority
            />
          </div>
          <div>
            <span className="block text-xs font-semibold tracking-wider uppercase text-emerald-400">
              Admin Portal
            </span>
            <span className="block text-[11px] text-slate-400 font-medium">Control Center</span>
          </div>
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {/* Section Label */}
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>

        {/* Dashboard Link */}
        <Link
          href="/"
          onClick={onMobileClose}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isRouteActive("/")
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold"
              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${isRouteActive("/") ? "text-white" : "text-slate-400"}`} />
          <span>Dashboard</span>
        </Link>

        {/* User Management Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setUserMgmtOpen(!userMgmtOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isUserMgmtActive
                ? "bg-slate-800/90 text-emerald-400 font-semibold"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${isUserMgmtActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>User Management</span>
            </div>
            {userMgmtOpen ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Nested Sub-routes */}
          {userMgmtOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1">
              {userSubLinks.map((subLink) => {
                const active = pathname === subLink.href || pathname.startsWith(`${subLink.href}/`);
                const SubIcon = subLink.icon;
                return (
                  <Link
                    key={subLink.href}
                    href={subLink.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-emerald-600/90 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    <SubIcon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                    <span>{subLink.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Section Label */}
        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Operations & Commerce
        </div>

        {/* Remaining Main Links */}
        {navLinks.slice(1).map((link) => {
          const active = isRouteActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin User Footer & Logout */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-emerald-500/30">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.fullName || "Administrator"}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Shield className="w-3 h-3 inline" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 select-none h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
