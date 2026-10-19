"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetProductDetailsQuery,
  useToggleProductFeaturedMutation,
} from "@/redux/features/product/productApi";
import {
  Package,
  ArrowLeft,
  RefreshCw,
  Star,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
  TrendingUp,
  ShoppingBag,
  User,
  MapPin,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  FileText,
  ChevronRight,
  Eye,
  AlertCircle,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { DEFAULT_PROFILE_IMAGE } from "@/constants";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "producer" | "orders" | "reviews">("overview");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [togglingFeatured, setTogglingFeatured] = useState(false);

  // Filter state for order history
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("ALL");

  const { data, isLoading, isFetching, refetch, error } = useGetProductDetailsQuery(id, {
    skip: !id,
  });

  const [toggleProductFeatured] = useToggleProductFeaturedMutation();

  const product = data?.data?.product;
  const revenue = data?.data?.revenue ?? 0;
 

  const handleToggleFeatured = async () => {
    if (!product) return;
    try {
      setTogglingFeatured(true);
      const res = await toggleProductFeatured(product.id).unwrap();
      toast.success(
        res.message ||
          (product.isFeatured
            ? "Product removed from homepage featured list"
            : "Product marked as homepage featured")
      );
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update featured status"
      );
    } finally {
      setTogglingFeatured(false);
    }
  };

  const renderStockBadge = (quantity: number) => {
    if (quantity > 10) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>In Stock ({quantity.toLocaleString()} available)</span>
        </span>
      );
    }
    if (quantity > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          <span>Low Stock ({quantity} remaining)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" />
        <span>Out of Stock (0 remaining)</span>
      </span>
    );
  };

  const renderItemStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span>Shipped</span>
          </span>
        );
      case "Pending":
      case "Assigned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case "Cancelled":
      case "Refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">
            Loading harvest specifications and sales data...
          </p>
          <p className="text-xs text-slate-400">
            Fetching product metrics, farm records, and order ledger.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">
              The produce harvest record you requested does not exist or may have been deleted.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const orderItems = product.orderItems || [];
  const reviews = product.reviews || [];
  const pricingTiers = product.pricingTiers || [];
  const farmProfile = product.producer?.producerProfile;
  const imageUrls = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];

  // Filtered order items
  const filteredOrderItems =
    orderFilterStatus === "ALL"
      ? orderItems
      : orderItems.filter((item) => item.status === orderFilterStatus);

  // Total order units across all order history
  const totalOrderedUnits = orderItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalGrossOrderVolume = orderItems.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
              title="Return to Product Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Produce Listing</span>
                <span className="text-slate-300">•</span>              
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                <span>{product.name}</span>
                {product.isCertified && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold"
                    title="Certified Farm Harvest"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Certified</span>
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFeatured}
              disabled={togglingFeatured}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs cursor-pointer ${
                product.isFeatured
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                  : "bg-white hover:bg-amber-50 text-amber-800 border-amber-200"
              } ${togglingFeatured ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {togglingFeatured ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Star
                  className={`w-3.5 h-3.5 ${
                    product.isFeatured ? "fill-white text-white" : "fill-amber-400 text-amber-500"
                  }`}
                />
              )}
              <span>{product.isFeatured ? "Featured Harvest" : "Mark as Featured"}</span>
            </button>
          </div>
        </div>

        {/* Hero Section: Gallery & Key Stat Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Product Photo Showcase */}
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3">
              <div className="relative aspect-4/3 w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group">
                {imageUrls.length > 0 ? (
                  <img
                    src={imageUrls[selectedImageIndex] || imageUrls[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-300">
                    <Package className="w-16 h-16 mx-auto mb-2 text-slate-200" />
                    <span className="text-xs font-medium text-slate-400">No photography uploaded</span>
                  </div>
                )}

                {/* Floating category & stock tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {product.category?.name && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
                      {product.category.name}
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {imageUrls.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-mono">
                    {selectedImageIndex + 1} / {imageUrls.length}
                  </div>
                )}
              </div>

              {/* Thumbnails strip */}
              {imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-102"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Status and Meta Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>{renderStockBadge(product.availableQuantity || 0)}</div>
                <div className="text-slate-400 text-[11px]">
                  Listed {product.createdAt ? format(new Date(product.createdAt), "MMM dd, yyyy") : "N/A"}
                </div>
              </div>
            </div>

            {/* Quick Producer Origin Preview Card */}
            {product.producer && (
              <div className="rounded-2xl bg-linear-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 p-4 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={product.producer.profileImage || DEFAULT_PROFILE_IMAGE}
                      alt={product.producer.fullName || "Producer"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-700 tracking-wider">
                      PRODUCER / FARM ORIGIN
                    </span>
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {farmProfile?.farmName || farmProfile?.companyName || product.producer.fullName || "Certified Farmer"}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{farmProfile?.farmLocation || product.producer.address || product.producer.city || "Ivory Coast"}</span>
                    </div>
                  </div>
                </div>

                {product.producer.id && (
                  <Link
                    href={`/users/producers/${product.producer.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-semibold shadow-2xs transition-all shrink-0"
                  >
                    <span>View Farm</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Key KPI Cards & Quick Specs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Stat KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Card 1: Base Price */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold">Base Price</span>
                  <Tag className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {formatCurrency(product.pricePerUnit || 0)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Per {product.sellingUnit || "Unit"}
                </div>
              </div>

              {/* Card 2: Delivered Revenue */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold">Delivered Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-700">
                  {formatCurrency(revenue || 0)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Gross: {formatCurrency(totalGrossOrderVolume)}
                </div>
              </div>

              {/* Card 3: Stock Inventory */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold">Available Stock</span>
                  <Package className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {(product.availableQuantity || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Units of {product.sellingUnit}
                </div>
              </div>

              {/* Card 4: Total Sold */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold">Units Sold</span>
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {(product.sold || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {totalOrderedUnits.toLocaleString()} in order items
                </div>
              </div>

              {/* Card 5: Rating */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold">Customer Rating</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{product.avgRating ? product.avgRating.toFixed(1) : "5.0"}</span>
                  <span className="text-xs text-amber-500 font-normal">/ 5.0</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {product.totalReviews || reviews.length} verified review{reviews.length === 1 ? "" : "s"}
                </div>
              </div>

              {/* Card 6: Orders Count */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold">Total Orders</span>
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {product._count?.orderItems ?? orderItems.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Marketplace transactions
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Harvest Description & Quality Specifications
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Category: {product.category?.name || "Uncategorized"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {product.description || "No specific agricultural or quality notes provided for this harvest listing."}
              </p>
            </div>

            {/* Bulk Pricing Tiers Quick Card */}
            {pricingTiers.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Wholesale Bulk Pricing Tiers</h4>
                      <p className="text-[11px] text-slate-500">Tiered incentives configured for commercial and institutional buyers.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {pricingTiers.length} Tier{pricingTiers.length > 1 ? "s" : ""} Active
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Order Volume</th>
                        <th className="py-2.5 px-3">Tier Price</th>
                        <th className="py-2.5 px-3">Savings per Unit</th>
                        <th className="py-2.5 px-3 text-right">Discount Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pricingTiers.map((tier, idx) => {
                        const basePrice = product.pricePerUnit || 1;
                        const tierPrice = tier.pricePerUnit || 0;
                        const savings = Math.max(0, basePrice - tierPrice);
                        const discountPct = basePrice > 0 ? ((savings / basePrice) * 100).toFixed(0) : 0;

                        return (
                          <tr key={tier.id || idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {tier.quantity}+ {product.sellingUnit}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700">
                              {formatCurrency(tierPrice)} / {product.sellingUnit}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              Save {formatCurrency(savings)} / {product.sellingUnit}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                -{discountPct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tabs Navigation */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto bg-slate-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "overview"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Full Specifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("producer")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "producer"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Farm & Producer Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "orders"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orderItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "reviews"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Customer Reviews ({reviews.length})</span>
            </button>
          </div>

          <div className="p-6">
            {/* TAB 1: FULL SPECIFICATIONS */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Specifications Table */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900  tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Product System Metadata</span>
                    </h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Produce Name</span>
                        <span className="font-semibold text-slate-900">{product.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Category</span>
                        <span className="font-semibold text-slate-900">{product.category?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Selling Unit</span>
                        <span className="font-semibold text-slate-900">{product.sellingUnit}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Base Unit Price</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(product.pricePerUnit || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Inventory Status</span>
                        <div>{renderStockBadge(product.availableQuantity || 0)}</div>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Certified Produce</span>
                        <span className="font-semibold text-slate-900">
                          {product.isCertified ? "Yes (Certified Quality Harvest)" : "Standard Quality"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Product Visibility</span>
                        <span className="font-semibold text-slate-900">
                          {product.isActive !== false ? "Active in Marketplace" : "Hidden / Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Homepage Showcase</span>
                        <span className="font-semibold text-slate-900">
                          {product.isFeatured ? "Featured Produce ⭐" : "Standard Listing"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operational & Revenue Statistics */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900  tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Financial & Sales Statistics</span>
                    </h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Total Delivered Revenue</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {formatCurrency(revenue || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Total Gross Transactions Value</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(totalGrossOrderVolume)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Recorded Quantity Sold</span>
                        <span className="font-semibold text-slate-900">
                          {(product.sold || 0).toLocaleString()} {product.sellingUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Units in Customer Orders</span>
                        <span className="font-semibold text-slate-900">
                          {totalOrderedUnits.toLocaleString()} {product.sellingUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Total Purchase Orders</span>
                        <span className="font-semibold text-slate-900">
                          {orderItems.length} order items
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-slate-500">Creation Date</span>
                        <span className="font-medium text-slate-700">
                          {product.createdAt ? format(new Date(product.createdAt), "PPP 'at' p") : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <span className="text-slate-500">Last Modified</span>
                        <span className="font-medium text-slate-700">
                          {product.updatedAt ? format(new Date(product.updatedAt), "PPP 'at' p") : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

             
               
              </div>
            )}

            {/* TAB 2: FARM & PRODUCER PROFILE */}
            {activeTab === "producer" && (
              <div className="space-y-6">
                {product.producer ? (
                  <div className="space-y-6">
                    {/* Producer Main Card */}
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={product.producer.profileImage || DEFAULT_PROFILE_IMAGE}
                            alt={product.producer.fullName || "Producer"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {farmProfile?.farmName || product.producer.fullName || "Certified Producer"}
                            </h3>
                            {farmProfile?.verificationStatus === "Accepted" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Farm</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Account owner: {product.producer.fullName}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                            {product.producer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{product.producer.email}</span>
                              </div>
                            )}
                            {product.producer.phoneNumber && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{product.producer.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {product.producer.id && (
                        <Link
                          href={`/users/producers/${product.producer.id}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors shrink-0"
                        >
                          <User className="w-4 h-4" />
                          <span>Open Full Producer Audit</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    {/* Detailed Producer Specifications Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                        <h4 className="text-xs font-bold text-slate-900  tracking-wider flex items-center gap-2">
                          <Building className="w-4 h-4 text-emerald-600" />
                          <span>Farm Enterprise Details</span>
                        </h4>
                        <div className="divide-y divide-slate-100 text-xs">
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Farm / Cooperative Name</span>
                            <span className="font-semibold text-slate-900">{farmProfile?.farmName || "N/A"}</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Corporate Name</span>
                            <span className="font-semibold text-slate-900">{farmProfile?.companyName || "N/A"}</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Producer Classification</span>
                            <span className="font-semibold text-slate-900">{farmProfile?.producerType || "Agricultural Farmer"}</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Cultivated Farm Size</span>
                            <span className="font-semibold text-slate-900">
                              {farmProfile?.farmSize ? `${farmProfile.farmSize} Hectares` : "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                        <h4 className="text-xs font-bold text-slate-900  tracking-wider flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>Geographic & Regional Location</span>
                        </h4>
                        <div className="divide-y divide-slate-100 text-xs">
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Farm Address / Location</span>
                            <span className="font-semibold text-slate-900">{farmProfile?.farmLocation || product.producer.address || "N/A"}</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">City / Municipality</span>
                            <span className="font-semibold text-slate-900">{product.producer.city || "Ivory Coast"}</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Region</span>
                            <span className="font-semibold text-slate-900">{product.producer.region || "National"}</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="text-slate-500">Authorization Status</span>
                            <span className="font-semibold text-slate-900">
                              {farmProfile?.verificationStatus || "Pending Review"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No producer information associated with this produce listing.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ORDER HISTORY & SALES TRANSACTIONS */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900  tracking-wider">
                      Product Order Ledger
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Marketplace customer orders containing this specific harvest.
                    </p>
                  </div>

                  {/* Status filter tabs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["ALL", "Delivered", "Shipped", "Pending", "Cancelled"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setOrderFilterStatus(status)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          orderFilterStatus === status
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrderItems.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="font-semibold text-slate-700">No orders recorded for this filter.</div>
                    <p className="text-slate-400">
                      {orderItems.length === 0
                        ? "This harvest has not yet been ordered by customers."
                        : `No orders found with status '${orderFilterStatus}'.`}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Destination</th>
                          <th className="py-3 px-4">Order Date</th>
                          <th className="py-3 px-4">Quantity</th>
                          <th className="py-3 px-4">Unit Price</th>
                          <th className="py-3 px-4">Subtotal</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrderItems.map((item, idx) => {
                          const customer = item.order?.customer;
                          const shipping = customer?.shippingAddresses?.[0];
                          const orderId = item.orderId || item.order?.id;

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                              {/* Order ID */}
                              <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                                {orderId ? (
                                  <Link
                                    href={`/orders/${orderId}`}
                                    className="hover:text-emerald-700 hover:underline flex items-center gap-1 group"
                                  >
                                    <span>#{orderId.slice(-6).toUpperCase()}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                                  </Link>
                                ) : (
                                  <span>#{String(idx + 1).padStart(4, "0")}</span>
                                )}
                              </td>

                              {/* Customer */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    <img
                                      src={customer?.profileImage || DEFAULT_PROFILE_IMAGE}
                                      alt={customer?.fullName || "Customer"}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">
                                      {customer?.fullName || "Verified Customer"}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {customer?.email || customer?.phoneNumber || "Customer"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Destination */}
                              <td className="py-3 px-4 text-slate-600">
                                <div className="font-medium text-slate-800">
                                  {shipping?.city || "Ivory Coast"}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {shipping?.addressLine || "Local Delivery"}
                                </div>
                              </td>

                              {/* Date */}
                              <td className="py-3 px-4 text-slate-600">
                                {item.createdAt ? format(new Date(item.createdAt), "MMM dd, yyyy") : "N/A"}
                                <div className="text-[10px] text-slate-400">
                                  {item.createdAt ? format(new Date(item.createdAt), "HH:mm") : ""}
                                </div>
                              </td>

                              {/* Quantity */}
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                {item.quantity} {product.sellingUnit}
                              </td>

                              {/* Unit Price */}
                              <td className="py-3 px-4 text-slate-700">
                                {formatCurrency(item.unitPrice || product.pricePerUnit || 0)}
                              </td>

                              {/* Subtotal */}
                              <td className="py-3 px-4 font-bold text-emerald-700">
                                {formatCurrency(item.subtotal || 0)}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                {renderItemStatusBadge(item.status)}
                              </td>

                              {/* Action */}
                              <td className="py-3 px-4 text-right">
                                {orderId ? (
                                  <Link
                                    href={`/orders/${orderId}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-semibold text-[11px]"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Inspect</span>
                                  </Link>
                                ) : (
                                  <span className="text-slate-300 text-[11px]">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CUSTOMER REVIEWS & RATINGS */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
              

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                    <Star className="w-8 h-8 text-amber-300 mx-auto" />
                    <div className="font-semibold text-slate-700">No buyer reviews yet.</div>
                    <p className="text-slate-400">
                      When customers receive and rate this harvest, their feedback will display here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((rev, idx) => (
                      <div
                        key={rev.id || idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              <img
                                src={rev.buyer?.profileImage || DEFAULT_PROFILE_IMAGE}
                                alt={rev.buyer?.fullName || "Buyer"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {rev.buyer?.fullName || "Verified Buyer"}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {rev.createdAt ? format(new Date(rev.createdAt), "MMM dd, yyyy") : "Verified Purchase"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {rev.comment ? `“${rev.comment}”` : "Buyer gave a rating without written feedback."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
