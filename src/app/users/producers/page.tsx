"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ApprovalModal from "@/components/users/ApprovalModal";
import {
  useGetAllProducersQuery,
  useAcceptRejectProducerMutation,
  TProducerUser,
} from "@/redux/features/admin/adminApi";
import { VerificationStatus, ProducerType } from "@/types";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check, 
  Sprout,
  Building,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ProducerManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ProducerType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Selected producer for approval
  const [selectedProducer, setSelectedProducer] = useState<TProducerUser | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalDefaultAction, setApprovalDefaultAction] = useState<"accept" | "reject">("accept");

  // Query
  const queryParams = {
    search: search.trim() || undefined,
    verificationStatus: statusFilter === "ALL" ? undefined : statusFilter,
    producerType: typeFilter === "ALL" ? undefined : typeFilter,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllProducersQuery(queryParams);
  const [acceptRejectProducer, { isLoading: isMutating }] = useAcceptRejectProducerMutation();

  const producers = data?.data?.producers || [];
  const meta = data?.data?.meta;

  const handleApprovalSubmit = async (isAccept: boolean, rejectReason?: string) => {
    if (!selectedProducer) return;
    try {
      const res = await acceptRejectProducer({
        accountId: selectedProducer.id,
        isAccept,
        rejectReason,
      }).unwrap();
      toast.success(res.message || `Producer account ${isAccept ? "approved" : "rejected"} successfully.`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Action failed.");
      throw err;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>           
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Producer Management
            </h1>
            <p className="text-xs text-slate-500">
              Inspect farm documentation, verify land titles, and authorize local producers.
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
              placeholder="Search by producer name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Accepted">Accepted / Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Producer Types</option>
              <option value="Private">Private Farm</option>
              <option value="Company">Company / Cooperative</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              Loading verified producers from database...
            </div>
          ) : producers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No producers match current filters.</div>
              <p className="text-slate-400">Try clearing filters or search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Producer</th>
                    <th className="py-3.5 px-4">Farm & Location</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Farm Size</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {producers.map((producer) => {
                    const profile = producer.producerProfile;
                    const status = profile?.verificationStatus || "Pending";

                    return (
                      <tr key={producer.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Producer Name & Email */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/users/producers/${producer.id}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-emerald-200 transition-colors">
                              {producer.fullName?.charAt(0) || "P"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                {producer.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {producer.email}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Farm & Location */}
                        <td className="py-3.5 px-4 text-slate-800">
                          <div className="font-medium truncate max-w-[200px]">
                            {profile?.farmName || "Unnamed Farm"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {profile?.farmLocation || "Ivory Coast"}
                          </div>
                        </td>

                        {/* Producer Type */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {profile?.producerType === "Company" ? (
                              <Building className="w-3 h-3 text-slate-500" />
                            ) : (
                              <Sprout className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{profile?.producerType || "Private"}</span>
                          </span>
                        </td>

                        {/* Farm Size */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {profile?.farmSize ? `${profile.farmSize} Ha` : "N/A"}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {status === "Accepted" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Accepted</span>
                            </span>
                          )}
                          {status === "Rejected" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          )}
                          {status === "Pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Dedicated Details Page Button */}
                            <Link
                              href={`/users/producers/${producer.id}`}
                              title="Inspect Full Producer Details & Documents"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* If Pending: Quick Approve / Reject triggers */}
                            {status === "Pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProducer(producer);
                                    setApprovalDefaultAction("accept");
                                    setApprovalOpen(true);
                                  }}
                                  title="Take Action"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>                             
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {meta && (meta.totalPage > 1 || (meta.totalPages && meta.totalPages > 1)) && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing page <span className="font-semibold text-slate-800">{meta.page}</span> of{" "}
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> (
                {meta.total} total producers)
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

      {/* Approval / Rejection Modal */}
      {selectedProducer && (
        <ApprovalModal
          isOpen={approvalOpen}
          onClose={() => setApprovalOpen(false)}
          onConfirm={handleApprovalSubmit}
          accountName={selectedProducer.fullName}
          accountType="Producer"
          defaultAction={approvalDefaultAction}
          isLoading={isMutating}
        />
      )}
    </DashboardLayout>
  );
}
