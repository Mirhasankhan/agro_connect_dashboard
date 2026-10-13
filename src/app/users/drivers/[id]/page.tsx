"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ApprovalModal from "@/components/users/ApprovalModal";
import {
  useGetDriverDetailsQuery,
  useAcceptRejectDriverMutation,
} from "@/redux/features/admin/adminApi";
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  FileText,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  BadgeCheck,
  Radio,
  Navigation,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "react-toastify";

export default function DriverDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"fleet" | "deliveries" | "earnings">("fleet");
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalDefaultAction, setApprovalDefaultAction] = useState<"accept" | "reject">("accept");

  const { data, isLoading, isFetching, refetch } = useGetDriverDetailsQuery(id, {
    skip: !id,
  });

  const [acceptRejectDriver, { isLoading: isMutating }] = useAcceptRejectDriverMutation();

  const driver = data?.data?.driver;
  const profile = driver?.driverProfile;
  const deliveries = driver?.deliveries || [];
  const earnings = driver?.driverEarnings || [];

  const verificationStatus = profile?.verificationStatus || "Pending";
  const isAvailable = profile?.isAvailable;

  // Financial calculations
  const totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const transferredEarnings = earnings
    .filter((item) => item.isTransferred)
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingEarnings = totalEarnings - transferredEarnings;

  // Delivery metrics
  const completedDeliveries = deliveries.filter((d) => d.status === "Delivered").length;
  const activeDeliveries = deliveries.filter((d) => d.status === "Assigned" || d.status === "PickedUp").length;

  const handleApprovalSubmit = async (isAccept: boolean, rejectReason?: string) => {
    if (!driver) return;
    try {
      const res = await acceptRejectDriver({
        accountId: driver.id,
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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized Fleet Driver</span>
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Application Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const renderDocumentItem = (label: string, url?: string | null) => {
    if (!url) {
      return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-300" />
            <span>{label}</span>
          </div>
          <span className="italic text-[11px] text-slate-400">Not provided</span>
        </div>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/20 text-xs text-slate-700 hover:text-sky-800 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-sky-600 font-semibold text-[11px] shrink-0">
          <span>View Credential</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <div className="font-semibold text-slate-700 text-sm">Loading driver profile & fleet records...</div>
          <p className="text-slate-400">Fetching vehicle credentials, trip logs, and delivery earnings.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!driver) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-500 space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Driver Not Found</h2>
          <p className="text-slate-500">
            The requested driver profile could not be located in the database.
          </p>
          <Link
            href="/users/drivers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Driver Fleet</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumbs & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/users/drivers"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              title="Back to Drivers"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                <Link href="/users/drivers" className="hover:text-sky-700 transition-colors">
                  Drivers
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">{driver.fullName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>{driver.fullName}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                  <span>{profile?.vehicleType || "Driver"}</span>
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-sky-600" : ""}`} />
              <span>Refresh</span>
            </button>

            {verificationStatus === "Pending" && (
              <>
                <button
                  onClick={() => {
                    setApprovalDefaultAction("accept");
                    setApprovalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Driver</span>
                </button>

                <button
                  onClick={() => {
                    setApprovalDefaultAction("reject");
                    setApprovalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition-all active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Driver Banner & Header Card */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-sky-800 via-blue-900 to-slate-900 relative">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border-2 border-white shrink-0 overflow-hidden">
                  {driver.profileImage ? (
                    <img
                      src={driver.profileImage}
                      alt={driver.fullName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-sky-100 text-sky-800 text-2xl font-bold flex items-center justify-center rounded-xl">
                      {driver.fullName?.charAt(0) || "D"}
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{driver.fullName}</h2>
                    {renderStatusBadge(verificationStatus)}
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span>Ready for Dispatch</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <span>Unavailable / Offline</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Vehicle: {profile?.vehicleType || "General Vehicle"} &bull; Reg: {profile?.registrationNumber || profile?.licensePlate || "Pending Plate"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact & Geographic Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate">{driver.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{driver.phoneNumber || "No phone listed"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate">
                  {[driver.address, driver.city, driver.region].filter(Boolean).join(", ") || "Ivory Coast"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Registered {profile?.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "2026"}
                </span>
              </div>
            </div>

            {/* Rejection Notice if applicable */}
            {verificationStatus === "Rejected" && profile?.rejectionReason && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Rejection Reason:</span>
                  <p className="text-rose-700">{profile.rejectionReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logistics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Deliveries
              </span>
              <span className="text-2xl font-bold text-slate-900">{deliveries.length}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {completedDeliveries} completed safely
              </span>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Trips
              </span>
              <span className="text-2xl font-bold text-emerald-700">{activeDeliveries}</span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                En route to hub or customer
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Navigation className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Delivery Earnings
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalEarnings)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                From logistics charges
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Transferred Payouts
              </span>
              <span className="text-2xl font-bold text-emerald-700">
                {formatCurrency(transferredEarnings)}
              </span>
              <span className="text-[11px] text-amber-600 font-medium block mt-0.5">
                {pendingEarnings > 0 ? `${formatCurrency(pendingEarnings)} pending` : "All paid out"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${
              activeTab === "fleet"
                ? "text-sky-700 border-b-2 border-sky-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Vehicle Specifications & Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab("deliveries")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${
              activeTab === "deliveries"
                ? "text-sky-700 border-b-2 border-sky-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Assigned Deliveries ({deliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${
              activeTab === "earnings"
                ? "text-sky-700 border-b-2 border-sky-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Driver Payout Ledger ({earnings.length})</span>
          </button>
        </div>

        {/* TAB 1: Vehicle & Credentials */}
        {activeTab === "fleet" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Fleet Vehicle Specifications</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Vehicle Type
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.vehicleType || "Not configured"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Registration / Plate
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {profile?.registrationNumber || profile?.licensePlate || "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Driver License No.
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {profile?.drivingLicenseNumber || "On file"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Operating Region
                    </span>
                    <span className="font-semibold text-slate-900 truncate block">
                      {driver.city || driver.region || "Abidjan, Ivory Coast"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Account Status
                    </span>
                    <span className="font-semibold text-slate-900">
                      {driver.status || "Active"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Dispatch Availability
                    </span>
                    <span className="font-semibold text-slate-900">
                      {isAvailable ? "Available" : "Busy / Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Credentials Documents */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-sky-600" />
                    <span>Audit Legal Driving Credentials</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verify government licenses, registration cards, and insurance policies.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {renderDocumentItem("Commercial Driving License", profile?.drivingLicenseUrl)}
                  {renderDocumentItem("Vehicle Registration Certificate", profile?.vehicleRegistrationUrl)}
                  {renderDocumentItem("Commercial Cargo Insurance", profile?.insuranceUrl)}
                  {renderDocumentItem("National Identity Document (NID)", profile?.nidUrl)}
                  {renderDocumentItem("Police Clearance Background Check", profile?.policeClearanceUrl)}

                  {/* Additional licenseUrls */}
                  {profile?.licenseUrls && profile.licenseUrls.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                        Additional Permits ({profile.licenseUrls.length})
                      </span>
                      {profile.licenseUrls.map((licenseUrl, index) =>
                        renderDocumentItem(`Permit / Endorsement #${index + 1}`, licenseUrl)
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Assigned Deliveries */}
        {activeTab === "deliveries" && (
          <div className="space-y-4">
            {deliveries.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-800">No Deliveries Assigned Yet</div>
                <p className="text-slate-400">
                  This driver has not been dispatched to any platform orders.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              Delivery #{delivery.id.slice(-8)}
                            </span>
                            {delivery.order?.orderId && (
                              <Link
                                href={`/orders/${delivery.order.orderId}`}
                                className="text-xs text-sky-600 hover:underline font-medium"
                              >
                                (Order #{delivery.order.orderId.slice(-8)})
                              </Link>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Destination: {delivery.order?.shippingAddress?.city || "Local"} &bull;{" "}
                            {delivery.order?.shippingAddress?.addressLine || "Address on record"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {delivery.status === "Delivered" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Delivered Successfully</span>
                          </span>
                        ) : delivery.status === "PickedUp" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>In Transit</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Assigned</span>
                          </span>
                        )}
                        <span className="font-bold text-slate-900 text-xs">
                          {formatCurrency(delivery.order?.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Cargo manifest items in this delivery */}
                    {delivery.order?.items && delivery.order.items.length > 0 && (
                      <div className="bg-slate-50/80 p-3.5 rounded-xl text-xs space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Cargo Items in Delivery ({delivery.order.items.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {delivery.order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-white border border-slate-200/60 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-semibold text-slate-800 block">{item.productName}</span>
                                <span className="text-[11px] text-slate-500">
                                  {item.quantity} {item.sellingUnit} &times; {formatCurrency(item.unitPrice || 0)}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900 text-xs">
                                {formatCurrency(item.subtotal || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Driver Earnings */}
        {activeTab === "earnings" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Driver Logistics Payouts</h3>
                  <p className="text-xs text-slate-500">
                    Delivery charge ledger for completed order dispatches.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-sky-700 block">
                    Total: {formatCurrency(totalEarnings)}
                  </span>
                </div>
              </div>

              {earnings.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-800">No Earnings Recorded</div>
                  <p className="text-slate-400">
                    No delivery commissions or payouts have been logged for this driver yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Order Reference</th>
                        <th className="py-3 px-4">Order Delivery Fee</th>
                        <th className="py-3 px-4">Net Driver Amount</th>
                        <th className="py-3 px-4">Transfer Status</th>
                        <th className="py-3 px-4">Disbursed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {earnings.map((earn, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {earn.createdAt ? format(new Date(earn.createdAt), "MMM dd, yyyy") : "N/A"}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                            {earn.order?.orderId ? `#${earn.order.orderId.slice(-8)}` : "Logistics dispatch"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {earn.order?.deliveryCharge ? formatCurrency(earn.order.deliveryCharge) : "Standard"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-sky-700">
                            {formatCurrency(earn.amount || 0)}
                          </td>
                          <td className="py-3.5 px-4">
                            {earn.isTransferred ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Transferred</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>Pending Payout</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {earn.paidAt ? format(new Date(earn.paidAt), "MMM dd, yyyy HH:mm") : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approval / Rejection Modal */}
      {driver && (
        <ApprovalModal
          isOpen={approvalOpen}
          onClose={() => setApprovalOpen(false)}
          onConfirm={handleApprovalSubmit}
          accountName={driver.fullName}
          accountType="Driver"
          defaultAction={approvalDefaultAction}
          isLoading={isMutating}
        />
      )}
    </DashboardLayout>
  );
}
