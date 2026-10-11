"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ApprovalModal from "@/components/users/ApprovalModal";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import {
  useGetAllDriversQuery,
  useAcceptRejectDriverMutation,
  TDriverUser,
} from "@/redux/features/admin/adminApi";
import { VerificationStatus, DriverVehicleType } from "@/types";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Car,
} from "lucide-react";
import { toast } from "react-toastify";

export default function DriverManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "ALL">("ALL");
  const [vehicleFilter, setVehicleFilter] = useState<DriverVehicleType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Selected driver
  const [selectedDriver, setSelectedDriver] = useState<TDriverUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalDefaultAction, setApprovalDefaultAction] = useState<"accept" | "reject">("accept");

  // Query params
  const queryParams = {
    search: search.trim() || undefined,
    verificationStatus: statusFilter === "ALL" ? undefined : statusFilter,
    vehicleType: vehicleFilter === "ALL" ? undefined : vehicleFilter,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllDriversQuery(queryParams);
  const [acceptRejectDriver, { isLoading: isMutating }] = useAcceptRejectDriverMutation();

  const drivers = data?.data?.drivers || [];
  const meta = data?.data?.meta;

  const handleApprovalSubmit = async (isAccept: boolean, rejectReason?: string) => {
    if (!selectedDriver) return;
    try {
      const res = await acceptRejectDriver({
        accountId: selectedDriver.id,
        isAccept,
        rejectReason,
      }).unwrap();
      toast.success(res.message || `Driver account ${isAccept ? "approved" : "rejected"} successfully.`);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200 mb-1">
              <Truck className="w-3.5 h-3.5 text-sky-600" />
              Logistics & Delivery Fleet
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Driver Management
            </h1>
            <p className="text-xs text-slate-500">
              Audit driver credentials, vehicle registrations, and manage fleet authorization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-sky-600" : ""}`} />
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
              placeholder="Search by driver name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-600"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Accepted">Accepted / Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Vehicle Type Filter */}
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-600"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="BIKE">Bicycle / E-Bike</option>
              <option value="THREE_WHEELER">Three Wheeler</option>
              <option value="VAN">Delivery Van</option>
              <option value="PICKUP">Pickup Truck</option>
              <option value="TRUCK">Heavy Truck</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto mb-2" />
              Loading fleet drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No drivers found.</div>
              <p className="text-slate-400">Try adjusting your vehicle or verification filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Driver</th>
                    <th className="py-3.5 px-4">Vehicle Type</th>
                    <th className="py-3.5 px-4">Reg Number</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((driver) => {
                    const profile = driver.driverProfile;
                    const status = profile?.verificationStatus || "Pending";
                    const isAvailable = profile?.isAvailable;

                    return (
                      <tr key={driver.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Driver */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {driver.fullName?.charAt(0) || "D"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">
                                {driver.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {driver.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Type */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-100">
                            <Car className="w-3 h-3 text-sky-600" />
                            <span>{profile?.vehicleType || "Fleet"}</span>
                          </span>
                        </td>

                        {/* Registration Number */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {profile?.registrationNumber || "N/A"}
                        </td>

                        {/* Dispatch Availability */}
                        <td className="py-3.5 px-4">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Available</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Offline / Busy</span>
                            </span>
                          )}
                        </td>

                        {/* Verification Status */}
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
                            {/* Inspect Details Button */}
                            <button
                              onClick={() => {
                                setSelectedDriver(driver);
                                setDetailsOpen(true);
                              }}
                              title="Inspect Driver Documents & License"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Pending Quick Actions */}
                            {status === "Pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDriver(driver);
                                    setApprovalDefaultAction("accept");
                                    setApprovalOpen(true);
                                  }}
                                  title="Approve Driver"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedDriver(driver);
                                    setApprovalDefaultAction("reject");
                                    setApprovalOpen(true);
                                  }}
                                  title="Reject Driver"
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <X className="w-4 h-4" />
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

          {/* Pagination */}
          {meta && (meta.totalPage > 1 || (meta.totalPages && meta.totalPages > 1)) && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing page <span className="font-semibold text-slate-800">{meta.page}</span> of{" "}
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} drivers)
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
      {selectedDriver && (
        <UserDetailsModal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title="Driver License & Fleet Details"
          user={selectedDriver}
          userType="driver"
          onApproveAction={() => {
            setApprovalDefaultAction("accept");
            setApprovalOpen(true);
          }}
        />
      )}

      {/* Approval Modal */}
      {selectedDriver && (
        <ApprovalModal
          isOpen={approvalOpen}
          onClose={() => setApprovalOpen(false)}
          onConfirm={handleApprovalSubmit}
          accountName={selectedDriver.fullName}
          accountType="Driver"
          defaultAction={approvalDefaultAction}
          isLoading={isMutating}
        />
      )}
    </DashboardLayout>
  );
}
