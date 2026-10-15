"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProducerEarningDetailModal from "@/components/earnings/ProducerEarningDetailModal";
import {
  useGetAllProducerEarningsQuery,
  useTransferProducerEarningMutation,
  TAdminProducerEarning,
} from "@/redux/features/admin/adminApi";
import {
  Coins,
  Sprout,
  Clock,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Building,
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

export default function ProducerEarningsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "true" | "false">("ALL");
  const [page, setPage] = useState(1);
  const [transferringId, setTransferringId] = useState<string | null>(null);

  // Selected earning for inspection modal
  const [selectedEarning, setSelectedEarning] = useState<TAdminProducerEarning | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [transferProducerEarning] = useTransferProducerEarningMutation();

  // RTK Query parameters
  const queryParams = {
    search: search.trim() || undefined,
    isTransferred: statusFilter === "ALL" ? undefined : (statusFilter as "true" | "false"),
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllProducerEarningsQuery(queryParams);

  const earnings = data?.data?.earnings || [];
  const meta = data?.data?.meta;

  // Calculate dynamic metrics from current earnings dataset
  const totalVolume = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const settledEarnings = earnings.filter((item) => item.isTransferred);
  const settledVolume = settledEarnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingEarnings = earnings.filter((item) => !item.isTransferred);
  const pendingVolume = pendingEarnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const uniqueProducersCount = new Set(
    earnings.map((item) => item.producer?.id).filter(Boolean)
  ).size;

  const handleOpenDetail = (earning: TAdminProducerEarning) => {
    setSelectedEarning(earning);
    setIsDetailOpen(true);
  };

  const handleDirectTransfer = async (e: React.MouseEvent, earningId: string) => {
    e.stopPropagation();
    try {
      setTransferringId(earningId);
      const res = await transferProducerEarning(earningId).unwrap();
      toast.success(res.message || "Producer earning transferred successfully!");
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to transfer producer earning."
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
              Producer Earnings & Payouts
            </h1>
            <p className="text-xs text-slate-500">
              Overview of agricultural harvest sales, escrow clearances, and producer bank disbursements.
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
              <span>Gross Ledger Payouts</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalVolume)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Settled & Transferred</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 tracking-tight">
              {formatCurrency(settledVolume)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Pending Escrow</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-900 tracking-tight">
              {formatCurrency(pendingVolume)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider">
              <span>Active Producers</span>
              <Sprout className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {uniqueProducersCount}{" "}
              <span className="text-xs font-bold text-slate-400">farms</span>
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
              placeholder="Search by produce item name or producer..."
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
              Total Disbursements: <span className="font-bold text-slate-900">{meta?.total ?? earnings.length}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              Loading producer earnings...
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <Coins className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No producer earnings found.</div>
              <p className="text-slate-400">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Producer</th>
                    <th className="py-3.5 px-4">Fulfilled Item</th>
                    <th className="py-3.5 px-4">Quantity / Unit</th>
                    <th className="py-3.5 px-4">Disbursed Amount</th>
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
                        {/* Producer Profile */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={earn.producer?.id ? `/users/producers/${earn.producer.id}` : "#"}
                            className="flex items-center gap-3 group"
                          >
                            {earn.producer?.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={earn.producer.profileImage}
                                alt={earn.producer.fullName || "Producer"}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                                {earn.producer?.fullName?.charAt(0) || "P"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                {earn.producer?.fullName || "Producer"}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{earn.producer?.producerProfile?.farmName || "Direct Farm Partner"}</span>
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Fulfilled Produce Item */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {earn.orderItem?.productName || "Direct Harvest Fulfillment"}
                          </div>
                          {earn.orderItem?.subtotal !== undefined && (
                            <div className="text-[11px] text-slate-400">
                              Subtotal: {formatCurrency(earn.orderItem.subtotal)}
                            </div>
                          )}
                        </td>

                        {/* Quantity / Unit */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {earn.orderItem?.quantity || 1} {earn.orderItem?.sellingUnit || "units"}
                        </td>

                        {/* Disbursed Amount */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                          {formatCurrency(earn.amount || 0)}
                        </td>

                        {/* Settlement Status */}
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
                              <span>Pending Escrow</span>
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
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} producer earnings)
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
      <ProducerEarningDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        earning={selectedEarning}
      />
    </DashboardLayout>
  );
}
