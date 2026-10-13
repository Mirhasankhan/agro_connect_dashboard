import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "rose" | "blue" | "slate";
}

export default function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = "emerald",
}: StatsCardProps) {
  const badgeClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[badgeColor];

  return (
    <div className="relative rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold  tracking-wider text-slate-500">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className=" border-slate-100 flex items-center justify-between text-xs">
        {change && (
          <div
            className={`inline-flex items-center gap-1 font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}

        {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}

        {badge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
