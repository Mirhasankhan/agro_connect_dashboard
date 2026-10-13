"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  ShoppingBag,
  Truck,
  UserCheck,
  Grid,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  useGetAllOrdersQuery,
  useGetAllProducersQuery,
  useGetAllDriversQuery,
  useGetAllCategoriesQuery,
} from "@/redux/features/admin/adminApi";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

export default function AdminOverviewDashboard() {
  // Fetch real metrics from backend
  const { data: ordersData, isLoading: isLoadingOrders } = useGetAllOrdersQuery({ limit: 5 });
  const { data: pendingProducersData, isLoading: isLoadingProducers } = useGetAllProducersQuery({
    verificationStatus: "Pending",
    limit: 5,
  });
  const { data: pendingDriversData, isLoading: isLoadingDrivers } = useGetAllDriversQuery({
    verificationStatus: "Pending",
    limit: 5,
  });
 
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery();

  const totalOrders = ordersData?.data?.meta?.total ?? 0;
  const pendingProducersCount = pendingProducersData?.data?.meta?.total ?? 0;
  const pendingDriversCount = pendingDriversData?.data?.meta?.total ?? 0;
  const totalCategories = categoriesData?.data?.categories?.length ?? 0;

  const recentOrders = ordersData?.data?.orders || [];
  const pendingProducers = pendingProducersData?.data?.producers || [];
  const pendingDrivers = pendingDriversData?.data?.drivers || [];

  return (
    <DashboardLayout>    
    

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Orders"
          value={isLoadingOrders ? "..." : totalOrders}       
          isPositive={true}
          icon={ShoppingBag}       
          badgeColor="emerald"
        />

        <StatsCard
          title="Pending Producers"
          value={isLoadingProducers ? "..." : pendingProducersCount}   
          icon={UserCheck}  
          badgeColor={pendingProducersCount > 0 ? "amber" : "emerald"}
        />

        <StatsCard
          title="Pending Drivers"
          value={isLoadingDrivers ? "..." : pendingDriversCount}      
          icon={Truck}  
          badgeColor={pendingDriversCount > 0 ? "blue" : "emerald"}
        />

        <StatsCard
          title="Active Categories"
          value={isLoadingCategories ? "..." : totalCategories}       
          icon={Grid}     
          badgeColor="slate"
        />
      </div>

      {/* 3. Operational Queues & Priority Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Producer & Driver Verification Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Verifications Widget */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Pending Partner Verifications</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Producers and fleet drivers awaiting account validation and document checks.
                </p>
              </div>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {pendingProducersCount + pendingDriversCount} Pending
              </span>
            </div>

            {/* Producers sub-list */}
            <div className="space-y-3">
              <div className="text-xs font-bold tracking-wider text-slate-400">
                Farmers & Producers Awaiting Approval
              </div>

              {pendingProducers.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  No pending producer approvals at this time.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                  {pendingProducers.slice(0, 3).map((producer) => (
                    <div
                      key={producer.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {producer.fullName?.charAt(0) || "P"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {producer.fullName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {producer.producerProfile?.farmName || "Farm Name"} •{" "}
                            {producer.producerProfile?.farmLocation || "Ivory Coast"}
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/users/producers"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors shrink-0"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drivers sub-list */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold tracking-wider text-slate-400">
                Transport Drivers Awaiting Approval
              </div>

              {pendingDrivers.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  No pending driver approvals at this time.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                  {pendingDrivers.slice(0, 3).map((driver) => (
                    <div
                      key={driver.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs shrink-0">
                          <Truck className="w-4 h-4 text-sky-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {driver.fullName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            Vehicle: {driver.driverProfile?.vehicleType || "Fleet"} • Reg:{" "}
                            {driver.driverProfile?.registrationNumber || "N/A"}
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/users/drivers"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors shrink-0"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Platform Orders</h2>
                <p className="text-xs text-slate-500">
                  Orders requiring hub intake and driver assignment.
                </p>
              </div>

              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Order ID</th>
                      <th className="py-2.5 px-3 font-semibold">Buyer</th>
                      <th className="py-2.5 px-3 font-semibold">Amount</th>
                      <th className="py-2.5 px-3 font-semibold">City</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                          #{order.orderId?.slice(-6) || order.id?.slice(-6)}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {order.customer?.fullName || "Buyer"}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {formatCurrency(order.totalAmount || 0)}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {order.shippingAddress?.city || "Abidjan"}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {order.createdAt
                            ? format(new Date(order.createdAt), "MMM dd, yyyy")
                            : "N/A"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href="/orders"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Operational Shortcuts & System Status (1 col) */}
        <div className="space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Administrative Hub</h2>
            <p className="text-xs text-slate-500">Quick routing to operational modules.</p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                href="/categories"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Categories
                    </div>
                    <div className="text-[11px] text-slate-400">Organize produce types</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Product Catalog
                    </div>
                    <div className="text-[11px] text-slate-400">Inventory & pricing tiers</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/reports"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                      Disputes & Reports
                    </div>
                    <div className="text-[11px] text-slate-400">Produce quality feedback</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/analytics"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-800">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                      Analytics
                    </div>
                    <div className="text-[11px] text-slate-400">Trade volume & charts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        
        </div>
      </div>
    </DashboardLayout>
  );
}
