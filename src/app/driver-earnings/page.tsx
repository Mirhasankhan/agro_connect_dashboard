"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DriverEarningDetailModal from "@/components/earnings/DriverEarningDetailModal";
import {
  useGetAllDriverEarningsQuery,
  useTransferDriverEarningMutation,
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
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "react-toastify";

const isPast24Hours = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) return false;
  return Date.now() - createdTime >= 24 * 60 * 60 * 1000;
};

export default function DriverEarningsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "true" | "false">("ALL");
  const [page, setPage] = useState(1);
  const [transferringId, setTransferringId] = useState<string | null>(null);

  // Selected driver earning for inspection modal
  const [selectedEarning, setSelectedEarning] = useState<TAdminDriverEarning | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [transferDriverEarning] = useTransferDriverEarningMutation();

  // Query parameters
  const queryParams = {
    search: search.trim() || undefined,
    isTransferred: statusFilter === "ALL" ? undefined : (statusFilter as "true" | "false"),
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllDriverEarningsQuery(queryParams);

  const earnings = data?.data?.earnings || [];
  const meta = data?.data?.meta;

  // Calculate dynamic metrics from current earnings dataset
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

  const handleDirectTransfer = async (e: React.MouseEvent, earningId: string) => {
    e.stopPropagation();
    try {
      setTransferringId(earningId);
      const res = await transferDriverEarning(earningId).unwrap();
      toast.success(res.message || "Driver earning transferred successfully!");
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to transfer driver earning."
      );
    } finally {
      setTransferringId(null);
    }
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
              Overview of completed deliveries, driver compensations, and automated account settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Gross Delivery Fees</span>
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalVolume)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Settled Transfers</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 tracking-tight">
              {formatCurrency(settledVolume)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Pending Transfers</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-900 tracking-tight">
              {formatCurrency(pendingVolume)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Active Drivers</span>
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {uniqueDriversCount}{" "}
              <span className="text-xs font-bold text-slate-400">drivers</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by driver name, email or order ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Filter Dropdowns and Total Count */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Settlement Statuses</option>
              <option value="false">Pending Transfer</option>
              <option value="true">Settled / Transferred</option>
            </select>

            <div className="text-xs text-slate-500 font-medium ml-2">
              Total Payouts: <span className="font-bold text-slate-900">{meta?.total ?? earnings.length}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              Loading driver earnings...
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <Truck className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No driver earnings found.</div>
              <p className="text-slate-400">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Driver</th>
                    <th className="py-3.5 px-4">Dispatched Order</th>
                    <th className="py-3.5 px-4">Vehicle Type</th>
                    <th className="py-3.5 px-4">Delivery Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earnings.map((earn) => {
                    const canTransfer = !earn.isTransferred && isPast24Hours(earn.createdAt);

                    return (
                      <tr key={earn.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Driver */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={earn.driver?.id ? `/users/drivers/${earn.driver.id}` : "#"}
                            className="flex items-center gap-3 group"
                          >
                            {earn.driver?.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={earn.driver.profileImage}
                                alt={earn.driver.fullName || "Driver"}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                                {earn.driver?.fullName?.charAt(0) || "D"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                {earn.driver?.fullName || "Logistics Driver"}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {earn.driver?.email || "No email"}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Dispatched Order */}
                        <td className="py-3.5 px-4">
                          {earn.order?.orderId ? (
                            <div>
                              <div                           
                                className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                              >
                                <span>#{earn.order.orderId}</span>                               
                              </div>
                              {earn.order.items && (
                                <div className="text-[11px] text-slate-400">
                                  {earn.order.items.length} {earn.order.items.length === 1 ? "item" : "items"}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">Direct Trip</span>
                          )}
                        </td>

                        {/* Vehicle Type */}
                        <td className="py-3.5 px-4">
                          {earn.driver?.driverProfile?.vehicleType ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <Truck className="w-3 h-3 text-slate-500" />
                              <span>{earn.driver.driverProfile.vehicleType}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Fleet Courier</span>
                          )}
                        </td>

                        {/* Delivery Fee */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                          {formatCurrency(earn.amount || 0)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {earn.isTransferred ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Settled</span>
                              </span>
                              {earn.paidAt && (
                                <div className="text-[10px] text-slate-400">
                                  {format(new Date(earn.paidAt), "MMM dd, HH:mm")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Transfer</span>
                            </span>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          <div className="font-medium">
                            {earn.createdAt ? format(new Date(earn.createdAt), "MMM dd, yyyy") : "N/A"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {earn.createdAt ? format(new Date(earn.createdAt), "HH:mm:ss") : ""}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {canTransfer && (
                              <button
                                onClick={(e) => handleDirectTransfer(e, earn.id)}
                                disabled={transferringId === earn.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                                title="Transfer Earning Directly"
                              >
                                {transferringId === earn.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                                <span>{transferringId === earn.id ? "Transferring..." : "Transfer"}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenDetail(earn)}
                              title="View Details"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && (meta.totalPage > 1 || (meta.totalPages && meta.totalPages > 1)) && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing page <span className="font-semibold text-slate-800">{meta.page}</span> of{" "}
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} driver earnings)
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= (meta.totalPage || meta.totalPages || 1)}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
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
