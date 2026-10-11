"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import {
  useGetAllBuyersQuery,
  TBuyerUser,
} from "@/redux/features/admin/adminApi";
import {
  Search,
  User,
  ShoppingBag,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function BuyerManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Selected buyer
  const [selectedBuyer, setSelectedBuyer] = useState<TBuyerUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Query params
  const queryParams = {
    search: search.trim() || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllBuyersQuery(queryParams);
  const buyers = data?.data?.buyers || [];
  const meta = data?.data?.meta;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Customer Demographics
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Buyer Management
            </h1>
            <p className="text-xs text-slate-500">
              Overview of registered buyers, order frequencies, and delivery destinations.
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
              placeholder="Search by buyer name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Buyers: <span className="font-bold text-slate-900">{meta?.total ?? buyers.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              Loading registered buyers...
            </div>
          ) : buyers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <User className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No buyers found.</div>
              <p className="text-slate-400">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Buyer</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Lifetime Orders</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buyers.map((buyer) => {
                    const orderCount = buyer._count?.orders ?? 0;

                    return (
                      <tr key={buyer.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Buyer Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {buyer.fullName?.charAt(0) || "B"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">
                                {buyer.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {buyer.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{buyer.city || "Abidjan"}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {buyer.address || buyer.region || "Ivory Coast"}
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {buyer.phoneNumber || "Not registered"}
                        </td>

                        {/* Lifetime Orders */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            <ShoppingBag className="w-3 h-3 text-emerald-600" />
                            <span>{orderCount} Orders</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedBuyer(buyer);
                              setDetailsOpen(true);
                            }}
                            title="View Buyer Profile"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
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
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} buyers)
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

      {/* Details Modal */}
      {selectedBuyer && (
        <UserDetailsModal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title="Buyer Profile & Order Overview"
          user={selectedBuyer}
          userType="buyer"
        />
      )}
    </DashboardLayout>
  );
}
