"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ApprovalModal from "@/components/users/ApprovalModal";
import {
  useGetProducerDetailsQuery,
  useAcceptRejectProducerMutation,
} from "@/redux/features/admin/adminApi";
import { DEFAULT_PROFILE_IMAGE } from "@/constants";
import {
  Sprout,
  Building,
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
  Star,
  FileText,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  BadgeCheck,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "react-toastify";

export default function ProducerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "earnings">("overview");
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalDefaultAction, setApprovalDefaultAction] = useState<"accept" | "reject">("accept");

  const { data, isLoading, isFetching, refetch } = useGetProducerDetailsQuery(id, {
    skip: !id,
  });

  const [acceptRejectProducer, { isLoading: isMutating }] = useAcceptRejectProducerMutation();

  const producer = data?.data?.producer;
  const profile = producer?.producerProfile;
  const products = producer?.products || [];
  const earnings = producer?.producerEarnings || [];

  const verificationStatus = profile?.verificationStatus || "Pending";

  // Financial calculations
  const totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const transferredEarnings = earnings
    .filter((item) => item.isTransferred)
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingEarnings = totalEarnings - transferredEarnings;

  // Product metrics
  const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (p.availableQuantity || 0), 0);

  const handleApprovalSubmit = async (isAccept: boolean, rejectReason?: string) => {
    if (!producer) return;
    try {
      const res = await acceptRejectProducer({
        accountId: producer.id,
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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Producer</span>
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
            <span>Pending Authorization</span>
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
        className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-xs text-slate-700 hover:text-emerald-800 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px] shrink-0">
          <span>View Document</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <div className="font-semibold text-slate-700 text-sm">Loading producer profile & farm data...</div>
          <p className="text-slate-400">Fetching farm accreditation, product catalog, and earnings ledger.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!producer) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-500 space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Producer Not Found</h2>
          <p className="text-slate-500">
            The requested producer profile could not be located in the database.
          </p>
          <Link
            href="/users/producers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Producer List</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/users/producers"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              title="Back to Producers"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                <Link href="/users/producers" className="hover:text-emerald-700 transition-colors">
                  Producers
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">{producer.fullName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>{producer.fullName}</span>
                {profile?.producerType === "Company" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>Company</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sprout className="w-3 h-3 text-emerald-600" />
                    <span>Private Producer</span>
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
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
                  <span>Approve Producer</span>
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

        {/* Producer Profile & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-5 relative">
              <div className="flex items-center gap-4 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg border-2 border-white shrink-0 overflow-hidden">
                  <img
                    src={producer.profileImage || DEFAULT_PROFILE_IMAGE}
                    alt={producer.fullName || "Producer"}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                    }}
                  />
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{producer.fullName}</h2>
                    {renderStatusBadge(verificationStatus)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {profile?.farmName || "Registered Agricultural Producer"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact & Geographic Meta Details */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{producer.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{producer.phoneNumber || "No phone listed"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {[producer.address, producer.city, producer.region].filter(Boolean).join(", ") ||
                    profile?.farmLocation ||
                    "Ivory Coast"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Member since {profile?.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "2026"}
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

          {/* High-Level Financial & Volume KPI Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Total Products Listed
              </span>
              <span className="text-2xl font-bold text-slate-900">{products.length}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {totalStock} units currently in stock
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Total Units Sold
              </span>
              <span className="text-2xl font-bold text-slate-900">{totalSold}</span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                Fulfilled via platform orders
              </span>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Total Earnings
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalEarnings)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {earnings.length} payouts logged
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
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
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${activeTab === "overview"
                ? "text-emerald-700 border-b-2 border-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Farm Accreditation & Legal Docs</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${activeTab === "products"
                ? "text-emerald-700 border-b-2 border-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${activeTab === "earnings"
                ? "text-emerald-700 border-b-2 border-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Earnings ({earnings.length})</span>
          </button>
        </div>

        {/* TAB 1: Farm Accreditation & Documents */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Farm Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Agricultural Farm Specifications</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                      Farm Name
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.farmName || "Not specified"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                      Land Area / Size
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.farmSize ? `${profile.farmSize} Hectares` : "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                      Producer Type
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.producerType || "Private"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                      Years of Experience
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.experienceYears ? `${profile.experienceYears} Years` : "Established"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                      Farm Location / Region
                    </span>
                    <span className="font-semibold text-slate-900 truncate block">
                      {profile?.farmLocation || producer.region || producer.city || "Ivory Coast"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                      National ID / Identity
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {profile?.nationalId || "On file"}
                    </span>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1.5">
                      Farm Background & Bio
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Corporate Legal Registration (If company) */}
              {(profile?.companyName || profile?.rccmNo || profile?.sirenNo || profile?.taxId) && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-700" />
                    <span>Commercial & Corporate Registration</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                        Corporate Name
                      </span>
                      <span className="font-semibold text-slate-900">{profile.companyName || "N/A"}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                        RCCM Number
                      </span>
                      <span className="font-semibold text-slate-900 font-mono">{profile.rccmNo || "N/A"}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                        SIREN / Tax ID
                      </span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {profile.sirenNo || profile.taxId || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Accreditation Documents */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span>Submitted Verification Documents</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click any document below to audit official certificates & land titles.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {renderDocumentItem("Land Title / Certificate", profile?.landCertificate)}
                  {renderDocumentItem("National Identity Document (NID)", profile?.nidUrl)}
                  {renderDocumentItem("Company Incorporation Certificate", profile?.companyCertificate)}
                  {renderDocumentItem("Tax Clearance Document", profile?.taxUrl)}
                  {renderDocumentItem("Trade Registry (RCM/RCCM)", profile?.rcmUrl)}
                  {renderDocumentItem("Farm Land Photo / Survey", profile?.farmPhotoUrl)}

                  {/* Additional certificateUrls */}
                  {profile?.certificateUrls && profile.certificateUrls.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 block  tracking-wider">
                        Additional Certificates ({profile.certificateUrls.length})
                      </span>
                      {profile.certificateUrls.map((certUrl, index) =>
                        renderDocumentItem(`Accreditation Certificate #${index + 1}`, certUrl)
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Products Catalog */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-800">No Products Listed Yet</div>
                <p className="text-slate-400">
                  This producer has not published any agricultural products to the marketplace catalog.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="h-44 bg-slate-100 relative overflow-hidden">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-10 h-10" />
                          </div>
                        )}
                        {product.category?.name && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      {/* Info Body */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{product.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-emerald-700 block">
                              {formatCurrency(product.pricePerUnit || 0)}
                            </span>
                            <span className="text-[10px] text-slate-400">per {product.sellingUnit || "unit"}</span>
                          </div>
                        </div>

                        {/* Stock & Rating Metric Badges */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Stock</span>
                            <span className="font-semibold text-slate-800">
                              {product.availableQuantity} {product.sellingUnit}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Sold</span>
                            <span className="font-semibold text-slate-800">{product.sold || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Rating</span>
                            <span className="font-semibold text-amber-600 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{product.avgRating?.toFixed(1) || "5.0"}</span>
                              <span className="text-slate-400 text-[9px]">({product.totalReviews || 0})</span>
                            </span>
                          </div>
                        </div>

                        {/* Bulk Pricing Tiers */}
                        {product.pricingTiers && product.pricingTiers.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                              Wholesale Tiers
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {product.pricingTiers.map((tier, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-100"
                                >
                                  {tier.quantity}+ units: {formatCurrency(tier.pricePerUnit || 0)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Reviews Sample */}
                        {product.reviews && product.reviews.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                              Recent Customer Feedback
                            </span>
                            <div className="space-y-1.5">
                              {product.reviews.slice(0, 2).map((rev, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-slate-50 text-[11px] space-y-0.5">
                                  <div className="flex items-center justify-between font-semibold text-slate-800">
                                    <span>{rev.buyer?.fullName || "Buyer Customer"}</span>
                                    <span className="text-amber-600 flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                      <span>{rev.rating}</span>
                                    </span>
                                  </div>
                                  <p className="text-slate-600 italic line-clamp-1">&ldquo;{rev.comment}&rdquo;</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Earnings & Financial Ledger */}
        {activeTab === "earnings" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Producer Payout Ledger</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive transaction history per fulfilled order item.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 block">
                    Total: {formatCurrency(totalEarnings)}
                  </span>
                </div>
              </div>

              {earnings.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-800">No Earnings Recorded</div>
                  <p className="text-slate-400">
                    No order item disbursements have been generated for this producer yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold  tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Item Product</th>
                        <th className="py-3 px-4">Quantity / Unit</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Transfer Status</th>
                        <th className="py-3 px-4">Disbursed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {earnings.map((earn, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {earn.createdAt ? format(new Date(earn.createdAt), "MMM dd, yyyy") : "N/A"}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {earn.orderItem?.productName || "Order Fulfillment"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {earn.orderItem?.quantity || 1} {earn.orderItem?.sellingUnit || "units"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
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
      {producer && (
        <ApprovalModal
          isOpen={approvalOpen}
          onClose={() => setApprovalOpen(false)}
          onConfirm={handleApprovalSubmit}
          accountName={producer.fullName}
          accountType="Producer"
          defaultAction={approvalDefaultAction}
          isLoading={isMutating}
        />
      )}
    </DashboardLayout>
  );
}
