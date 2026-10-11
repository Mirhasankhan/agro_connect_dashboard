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
} from "lucide-react";
import { toast } from "react-toastify";

interface MockReport {
  id: string;
  reportId: string;
  buyerName: string;
  buyerEmail: string;
  productName: string;
  orderId: string;
  reason: string;
  status: "Pending" | "Resolved" | "Rejected";
  createdAt: string;
  evidenceUrl?: string;
}

const initialReports: MockReport[] = [
  {
    id: "1",
    reportId: "RPT-1042",
    buyerName: "Amadou Touré",
    buyerEmail: "amadou.toure@gmail.com",
    productName: "Fresh Cassava Roots (25 KG)",
    orderId: "ORD-948102",
    reason: "A portion of the cassava roots were damaged and damp due to poor transit ventilation.",
    status: "Pending",
    createdAt: "2026-10-10",
  },
  {
    id: "2",
    reportId: "RPT-1043",
    buyerName: "Fatou Diop",
    buyerEmail: "fatou.diop@ci-markets.com",
    productName: "Organic Cocoa Beans (50 KG)",
    orderId: "ORD-948088",
    reason: "Delivery was delayed by 36 hours beyond hub delivery estimate.",
    status: "Pending",
    createdAt: "2026-10-09",
  },
  {
    id: "3",
    reportId: "RPT-1040",
    buyerName: "Kouamé N'Guessan",
    buyerEmail: "kouame.nguessan@yopougon.ci",
    productName: "Ripe Plantains (30 BUNDLE)",
    orderId: "ORD-947990",
    reason: "Quantity delivered was 2 bundles short of the order invoice.",
    status: "Resolved",
    createdAt: "2026-10-06",
  },
  {
    id: "4",
    reportId: "RPT-1038",
    buyerName: "Marie Claire Konan",
    buyerEmail: "marie.konan@gmail.com",
    productName: "Fresh Tomatoes (20 KG)",
    orderId: "ORD-947820",
    reason: "Claim of bruised tomatoes was evaluated. Evidence did not substantiate seller defect.",
    status: "Rejected",
    createdAt: "2026-10-04",
  },
];

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<MockReport[]>(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Resolved" | "Rejected">("ALL");

  const [selectedReport, setSelectedReport] = useState<MockReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportId.toLowerCase().includes(search.toLowerCase()) ||
      r.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: "Resolved" | "Rejected") => {
    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success(`Dispute ${newStatus.toLowerCase()} successfully.`);
    setModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 mb-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Customer Protection & Quality
            </div>
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
              <span>{reports.filter((r) => r.status === "Pending").length} Pending Disputes</span>
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dispute ID, customer, produce item..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-rose-600"
            >
              <option value="ALL">All Dispute Statuses</option>
              <option value="Pending">Pending Decision</option>
              <option value="Resolved">Resolved / Refunded</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
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
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Dispute ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                        #{report.reportId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{report.buyerName}</div>
                      <div className="text-[11px] text-slate-400">{report.buyerEmail}</div>
                    </td>

                    {/* Produce */}
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      <div>{report.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Ref: {report.orderId}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {report.reason}
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
                        onClick={() => {
                          setSelectedReport(report);
                          setModalOpen(true);
                        }}
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
        </div>
      </div>

      {/* Detail & Resolution Modal */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dispute #{selectedReport.reportId}
                  </h3>
                  <p className="text-xs text-slate-500">Filed by {selectedReport.buyerName}</p>
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
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Reported Product
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedReport.productName}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Order: #{selectedReport.orderId}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Customer Statement & Quality Complaint
                </span>
                <p className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-900 leading-relaxed">
                  {selectedReport.reason}
                </p>
              </div>

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
                    onClick={() => handleUpdateStatus(selectedReport.id, "Rejected")}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors"
                  >
                    Dismiss Claim
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "Resolved")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Resolve & Refund
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  Case status: {selectedReport.status}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
