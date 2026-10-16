"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  AlertOctagon,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetAllReportsQuery,
  useResolveReportMutation,
  TAdminReport,
  TReportStatus,
} from "@/redux/features/admin/adminApi";
import Pagination from "@/utils/pagination";
import { formatCurrency } from "@/utils/formatters";

export default function ReportsManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TReportStatus>("ALL");
  const [page, setPage] = useState(1);

  const queryParams: any = {
    page,
    limit: 10,
  };
  if (search.trim()) queryParams.search = search.trim();
  if (statusFilter !== "ALL") queryParams.status = statusFilter;

  const { data, isLoading } = useGetAllReportsQuery(queryParams);
  const [resolveReportMutation, { isLoading: isResolving }] = useResolveReportMutation();

  const reports: TAdminReport[] = data?.data?.reports || [];
  const totalPages = data?.data?.meta?.totalPage || 1;
  const pendingCount = reports.filter((r) => r.status === "Pending").length;

  const [selectedReport, setSelectedReport] = useState<TAdminReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const handleOpenInspect = (report: TAdminReport) => {
    setSelectedReport(report);
    setAdminNote(report.adminComment || "");
    setModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: "Resolved" | "Rejected") => {
    if (!selectedReport) return;

    try {
      await resolveReportMutation({
        id: selectedReport.id,
        payload: {
          status: newStatus,
          adminComment: adminNote.trim() || undefined,
        },
      }).unwrap();

      toast.success(
        newStatus === "Resolved"
          ? "Dispute resolved and marked as refunded."
          : "Dispute dismissed / rejected."
      );
      setModalOpen(false);
      setSelectedReport(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update report status");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>           
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Reports & Quality Disputes
            </h1>
            <p className="text-xs text-slate-500">
              Review customer incident claims, damaged goods reports, and mediate resolutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingCount} Pending Disputes</span>
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
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
              placeholder="Search by reason, customer, produce item..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-rose-600"
            >
              <option value="ALL">All Dispute Statuses</option>
              <option value="Pending">Pending Decision</option>
              <option value="Resolved">Resolved / Refunded</option>
              <option value="Rejected">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Dispute ID</th>
                    <th className="py-3.5 px-4">Buyer Customer</th>
                    <th className="py-3.5 px-4">Produce Reported</th>
                    <th className="py-3.5 px-4">Reason / Issue</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Dispute ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                          #{report.id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {report.buyer?.fullName || "Buyer"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {report.buyer?.email}
                        </div>
                      </td>

                      {/* Produce */}
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        <div>{report.orderItem?.productName || "Produce Item"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: #{report.orderItem?.order?.orderId || "ORD"}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="truncate" title={report.reason}>
                          {report.reason}
                        </p>
                        {report.adminComment && (
                          <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                            Note: {report.adminComment}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {report.status === "Pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {report.status === "Resolved" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Resolved</span>
                          </span>
                        )}
                        {report.status === "Rejected" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Dismissed</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenInspect(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No Quality Disputes Found</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                There are no dispute records matching the selected search criteria.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Pagination
                page={page}
                setPage={setPage}
                totalPage={totalPages}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail & Resolution Modal */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dispute #{selectedReport.id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Buyer: {selectedReport.buyer?.fullName || "Buyer"} ({selectedReport.buyer?.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Product and Order Info */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold  tracking-wider text-slate-400">
                    Produce & Order Details
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {formatCurrency(selectedReport.orderItem?.subtotal || 0)}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedReport.orderItem?.productName}
                </div>
                <div className="text-slate-500 text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                  <span>Quantity: {selectedReport.orderItem?.quantity} {selectedReport.orderItem?.sellingUnit}</span>
                  <span>Unit Price: {formatCurrency(selectedReport.orderItem?.unitPrice || 0)}</span>
                  <span>Order: #{selectedReport.orderItem?.order?.orderId}</span>
                </div>
                {selectedReport.orderItem?.product?.producer && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    Producer: <span className="font-semibold text-slate-800">{selectedReport.orderItem.product.producer.fullName}</span>
                    {selectedReport.orderItem.product.producer.producerProfile?.farmName && (
                      <span> ({selectedReport.orderItem.product.producer.producerProfile.farmName})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Customer Statement */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold  tracking-wider text-slate-400 block">
                  Customer Quality Complaint
                </span>
                <p className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-900 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.reason}
                </p>
                {selectedReport.fileUrl && (
                  <div className="pt-1">
                    <a
                      href={selectedReport.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 underline font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <span>View Uploaded Evidence</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Resolution Notes Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Administrative Resolution Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Record resolution notes or mediation details..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  disabled={selectedReport.status !== "Pending"}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              {selectedReport.status === "Pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    disabled={isResolving}
                    onClick={() => handleUpdateStatus("Rejected")}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    {isResolving ? "Updating..." : "Dismiss Claim"}
                  </button>
                  <button
                    disabled={isResolving}
                    onClick={() => handleUpdateStatus("Resolved")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    {isResolving ? "Updating..." : "Resolve Dispute"}
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  Status: {selectedReport.status}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
