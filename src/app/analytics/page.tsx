"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Truck,
  Sprout,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
} from "lucide-react";

export default function AnalyticsPage() {
  const categoryBreakdown = [
    { name: "Tubers & Roots (Cassava, Yam)", percentage: 38, value: "৳14.2M", color: "bg-emerald-500" },
    { name: "Fresh Vegetables (Tomato, Okra, Peppers)", percentage: 26, value: "৳9.8M", color: "bg-teal-500" },
    { name: "Tree Crops (Plantain, Banana)", percentage: 18, value: "৳6.7M", color: "bg-amber-500" },
    { name: "Cash Harvests (Cocoa, Cashew)", percentage: 12, value: "৳4.5M", color: "bg-orange-500" },
    { name: "Cereals & Grains (Rice, Maize)", percentage: 6, value: "৳2.2M", color: "bg-sky-500" },
  ];

  const regionalFlow = [
    { region: "Abidjan Metropolitan", volume: "44%", orders: "1,240 orders", status: "High Demand" },
    { region: "Yamoussoukro Agri-Hub", volume: "26%", orders: "732 orders", status: "Primary Supply" },
    { region: "San-Pédro Coast", volume: "18%", orders: "508 orders", status: "Transit Node" },
    { region: "Bouaké Central", volume: "12%", orders: "338 orders", status: "Expanding" },
  ];

  const monthlyVolume = [
    { month: "May", height: "45%", amount: "2.1M" },
    { month: "Jun", height: "55%", amount: "2.6M" },
    { month: "Jul", height: "60%", amount: "2.9M" },
    { month: "Aug", height: "75%", amount: "3.7M" },
    { month: "Sep", height: "85%", amount: "4.2M" },
    { month: "Oct", height: "100%", amount: "5.1M" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
              Intelligence & Throughput
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Platform Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Macro agricultural indicators, transaction velocities, and regional fleet performance.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Past 6 Months Overview</span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Gross Merchandise Value</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ৳37.4M
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% month-over-month</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Order Velocity</span>
              <ShoppingBag className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              2,818 Orders
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>99.2% fulfillment rate</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Fleet Efficiency</span>
              <Truck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              2.4 Hours
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-15% avg transit time</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Active Producers</span>
              <Sprout className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              94.6%
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Repeat harvest listings</span>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Growth Chart (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Monthly Commerce Growth & Revenue (BDT)
                </h2>
                <p className="text-xs text-slate-500">
                  Platform volume processed across registered hubs.
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                +32% H2 Trajectory
              </span>
            </div>

            {/* Custom Styled Bar Chart */}
            <div className="h-56 pt-6 flex items-end justify-between gap-4 border-b border-slate-100 pb-2">
              {monthlyVolume.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.amount}
                  </span>
                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-700 group-hover:to-emerald-500 transition-all shadow-sm"
                  />
                  <span className="text-xs font-bold text-slate-600 mt-1">{item.month}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Peak Month
                </span>
                <span className="font-bold text-slate-900">October (৳5.1M)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Avg Monthly GMV
                </span>
                <span className="font-bold text-slate-900">৳3.5M</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Stripe Payment Success
                </span>
                <span className="font-bold text-emerald-700">99.8%</span>
              </div>
            </div>
          </div>

          {/* Produce Category Distribution (1 col) */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Crop Categories</span>
              </h2>
              <p className="text-xs text-slate-500">Distribution of platform trade value.</p>
            </div>

            <div className="space-y-4">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="font-bold text-slate-900">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage}%` }}
                      className={`h-full rounded-full ${cat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Logistics Flow Table */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Regional Logistics Distribution</span>
            </h2>
            <p className="text-xs text-slate-500">Supply and intake hubs across Ivory Coast.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {regionalFlow.map((flow, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{flow.region}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {flow.volume}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{flow.orders} dispatched</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Node Role: {flow.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
