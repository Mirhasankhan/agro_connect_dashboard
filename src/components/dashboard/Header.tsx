"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
  onMobileOpen: () => void;
}

const routeTitleMap: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Executive Dashboard",
    subtitle: "Real-time overview of agricultural commerce, orders, and logistics.",
  },
  "/users/buyers": {
    title: "Buyer Management",
    subtitle: "Manage retail & wholesale agricultural produce buyers.",
  },
  "/users/drivers": {
    title: "Driver Fleet Management",
    subtitle: "Review transport partners, verification credentials, and availability.",
  },
  "/users/producers": {
    title: "Producer Management",
    subtitle: "Verify farms, certificates, and monitor producer quality.",
  },
  "/orders": {
    title: "Orders & Delivery Dispatch",
    subtitle: "Track order fulfillment and precisely assign verified transport drivers.",
  },
  "/categories": {
    title: "Categories Management",
    subtitle: "Create, organize, and toggle status of agricultural market categories.",
  },
  "/products": {
    title: "Product Catalog",
    subtitle: "Explore certified harvests, inventory quantities, and pricing tiers.",
  },
  "/driver-earnings": {
    title: "Driver Earnings & Payouts",
    subtitle: "Delivery fees, completed route settlements, and driver ledger.",
  },
  "/producer-earnings": {
    title: "Producer Earnings & Payouts",
    subtitle: "Farmer payouts, harvest proceeds, and Stripe account transfers.",
  },
  "/reports": {
    title: "Incidents & Dispute Reports",
    subtitle: "Address damaged produce, transit delays, and buyer disputes.",
  },
  "/analytics": {
    title: "Platform Analytics & Intelligence",
    subtitle: "Visual trends, volume throughput, and regional supply insights.",
  },
  "/settings": {
    title: "Platform Settings",
    subtitle: "System configuration, platform delivery fees, and administrative controls.",
  },
};

export default function Header({ onMobileOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  // Match title from map or fallback to dynamic subroutes
  let currentRouteMeta = routeTitleMap[pathname];
  if (!currentRouteMeta) {
    if (pathname.startsWith("/products/")) {
      currentRouteMeta = {
        title: "Product Details",
        subtitle: "Comprehensive harvest specifications, wholesale pricing, farm origin, and sales ledger.",
      };
    } else if (pathname.startsWith("/orders/")) {
      currentRouteMeta = {
        title: "Order Details & Dispatch",
        subtitle: "Delivery route assignment and customer order tracking.",
      };
    } else if (pathname.startsWith("/users/producers/")) {
      currentRouteMeta = {
        title: "Producer Profile",
        subtitle: "Farm verification, produce listings, and producer credentials.",
      };
    } else if (pathname.startsWith("/users/drivers/")) {
      currentRouteMeta = {
        title: "Driver Profile",
        subtitle: "Driver vehicle verification and delivery logs.",
      };
    } else if (pathname.startsWith("/users/buyers/")) {
      currentRouteMeta = {
        title: "Buyer Profile",
        subtitle: "Customer purchasing activity and account information.",
      };
    } else {
      currentRouteMeta = {
        title: "Admin Portal",
        subtitle: "AgroConnect central management operations.",
      };
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/90 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMobileOpen}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate flex items-center gap-2">
              <span>{currentRouteMeta.title}</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate mt-0.5">
              {currentRouteMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Status Pill, Notifications & Admin Info */}
        <div className="flex items-center gap-3 shrink-0">       

          {/* Quick Notifications Dropdown */}
          <NotificationDropdown />

          {/* Admin Avatar & Role Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.fullName || "Admin"}
                width={32}
                height={32}
                unoptimized
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-semibold flex items-center justify-center text-xs shadow-sm ring-1 ring-slate-200">
                {user?.fullName?.charAt(0) || "A"}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.fullName || "Admin"}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">Verified Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
