"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DriverEarningDetailModal from "@/components/earnings/DriverEarningDetailModal";
import {
  useGetAllDriverEarningsQuery,
  TAdminDriverEarning,
} from "@/redux/features/admin/adminApi";
import {
  Wallet,
  Truck,
  Clock,
  CheckCircle2,
  Search,  
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  Mail,
  X,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

export default function DriverEarningsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "true" | "false">("ALL");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selected driver earning for inspection modal
  const [selectedEarning, setSelectedEarning] = useState<TAdminDriverEarning | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Query parameters
  const queryParams = {
    search: search.trim() || undefined,
    isTransferred: statusFilter === "ALL" ? undefined : (statusFilter as "true" | "false"),
    order,
    page,
    limit,
  };

  const { data, isLoading } = useGetAllDriverEarningsQuery(queryParams);

  const earnings = data?.data?.earnings || [];
  const meta = data?.data?.meta;

  // Calculate dynamic metrics from the current earnings dataset
  const totalVolume = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const settledEarnings = earnings.filter((item) => item.isTransferred);
  const settledVolume = settledEarnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingEarnings = earnings.filter((item) => !item.isTransferred);
  const pendingVolume = pendingEarnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const uniqueDriversCount = new Set(
    earnings.map((item) => item.driver?.id).filter(Boolean)
  ).size;

  const handleOpenDetail = (earning: TAdminDriverEarning) => {
    setSelectedEarning(earning);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>       
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Driver Earnings & Payouts
            </h1>
            <p className="text-xs text-slate-500">
              Delivery fees, completed dispatch compensations, and automated account settlements for certified logistics drivers.
            </p>
          </div>
     
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Gross Delivery Fees</span>
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalVolume)}{" "}
              <span className="text-xs font-bold text-slate-400">BDT</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              <span>{earnings.length} delivery payouts</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Settled Transfers</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 tracking-tight">
              {formatCurrency(settledVolume)}{" "}
              <span className="text-xs font-bold text-emerald-600">BDT</span>
            </div>
            <div className="text-xs text-emerald-700">
              {settledEarnings.length} settlements complete
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Pending Transfers</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-900 tracking-tight">
              {formatCurrency(pendingVolume)}{" "}
              <span className="text-xs font-bold text-amber-600">BDT</span>
            </div>
            <div className="text-xs text-amber-700">
              {pendingEarnings.length} queued for next payout cycle
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Active Fleet Drivers</span>
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {uniqueDriversCount}{" "}
              <span className="text-xs font-bold text-slate-400">drivers</span>
            </div>
            <div className="text-xs text-slate-500">
              {meta?.total ? `${meta.total} total dispatch logs` : "Compensated fleet partners"}
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Order ID (e.g. ORD-1002, 670...)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50/50 focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("true");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    statusFilter === "true"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-600 hover:text-emerald-700"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Settled</span>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("false");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    statusFilter === "false"
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-slate-600 hover:text-amber-700"
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Pending</span>
                </button>
              </div>

              {/* Sort Order */}
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "desc" | "asc")}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              {/* Rows Per Page */}
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Driver Profile</th>
                  <th className="py-3.5 px-4">Vehicle Type</th>
                  <th className="py-3.5 px-4">Dispatched Order</th>
                  <th className="py-3.5 px-4">Delivery Fee</th>
                  <th className="py-3.5 px-4">Transfer Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-3.5 bg-slate-200 rounded w-24 mb-1" />
                        <div className="h-2.5 bg-slate-100 rounded w-16" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-200" />
                          <div className="space-y-1">
                            <div className="h-3 bg-slate-200 rounded w-28" />
                            <div className="h-2.5 bg-slate-100 rounded w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 rounded-full w-20" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 bg-slate-200 rounded w-24 mb-1" />
                        <div className="h-2.5 bg-slate-100 rounded w-16" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 rounded w-20" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 bg-slate-200 rounded-full w-24" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-8 bg-slate-200 rounded-xl w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : earnings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100 shadow-sm">
                          <Truck className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-800">No Driver Earnings Found</h4>
                          <p className="text-xs text-slate-400">
                            {search || statusFilter !== "ALL"
                              ? "No earnings match the search parameters. Try clearing your filters."
                              : "No driver payout records have been logged in the platform yet."}
                          </p>
                        </div>
                        {(search || statusFilter !== "ALL") && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("ALL");
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs transition-colors"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  earnings.map((earn) => (
                    <tr
                      key={earn.id}
                      onClick={() => handleOpenDetail(earn)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {earn.createdAt ? format(new Date(earn.createdAt), "MMM dd, yyyy") : "N/A"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {earn.createdAt ? format(new Date(earn.createdAt), "HH:mm:ss") : ""}
                        </div>
                      </td>

                      {/* Driver Profile */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2.5">
                          {earn.driver?.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={earn.driver.profileImage}
                              alt={earn.driver.fullName || "Driver"}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {earn.driver?.fullName
                                ? earn.driver.fullName.charAt(0).toUpperCase()
                                : "D"}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            {earn.driver?.id ? (
                              <Link
                                href={`/users/drivers/${earn.driver.id}`}
                                className="font-bold text-slate-900 hover:text-sky-700 hover:underline block truncate max-w-[160px]"
                              >
                                {earn.driver.fullName || "Logistics Driver"}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-900 block truncate max-w-[160px]">
                                {earn.driver?.fullName || "Logistics Driver"}
                              </span>
                            )}
                            {earn.driver?.email && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[160px]">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{earn.driver.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {earn.driver?.driverProfile?.vehicleType ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Truck className="w-3 h-3 text-slate-500" />
                            <span>{earn.driver.driverProfile.vehicleType}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Fleet Courier</span>
                        )}
                      </td>

                      {/* Dispatched Order */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-0.5">
                          {earn.order?.orderId ? (
                            <Link
                              href={`/orders/${earn.order.orderId}`}
                              className="font-bold text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-1 font-mono text-xs"
                            >
                              <span>#{earn.order.orderId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">Direct Trip</span>
                          )}
                          {earn.order?.items && (
                            <div className="text-[11px] text-slate-400">
                              {earn.order.items.length} {earn.order.items.length === 1 ? "item" : "items"} delivered
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Delivery Compensation Fee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-sky-900 text-sm">
                          {formatCurrency(earn.amount || 0)}
                        </span>
                      </td>

                      {/* Transfer Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {earn.isTransferred ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Settled</span>
                            </span>
                            {earn.paidAt && (
                              <div className="text-[10px] text-slate-400 block">
                                {format(new Date(earn.paidAt), "MMM dd, HH:mm")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Transfer</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetail(earn)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all border border-slate-200/80 hover:border-sky-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {meta && meta.total > 0 && (
            <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {Math.min((page - 1) * limit + 1, meta.total)}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(page * limit, meta.total)}
                </span>{" "}
                of <span className="font-bold text-slate-800">{meta.total}</span> delivery payouts
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="px-3 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold border border-sky-200">
                  Page {page} of {meta.totalPage || 1}
                </div>

                <button
                  onClick={() => setPage((prev) => (meta.totalPage ? Math.min(prev + 1, meta.totalPage) : prev + 1))}
                  disabled={Boolean(meta.totalPage && page >= meta.totalPage)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DriverEarningDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        earning={selectedEarning}
      />
    </DashboardLayout>
  );
}
