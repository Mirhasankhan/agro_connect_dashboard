"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetAllProductsQuery,
  useToggleProductFeaturedMutation,
} from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/admin/adminApi";
import { SellingUnit } from "@/types";
import { toast } from "react-toastify";
import {
  Search,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Sprout,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export default function ProductsCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedFeatured, setSelectedFeatured] = useState<string>("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Toggle product featured mutation
  const [toggleProductFeatured] = useToggleProductFeaturedMutation();

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      setTogglingId(productId);
      const res = await toggleProductFeatured(productId).unwrap();
      toast.success(
        res.message ||
          (currentFeatured
            ? "Product removed from featured"
            : "Product marked as featured")
      );
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update featured status"
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Categories for filter
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];

  // Query parameters
  const queryParams = {
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    sellingUnit: (selectedUnit as SellingUnit) || undefined,
    isFeatured: selectedFeatured || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllProductsQuery(queryParams);
  const products = data?.data?.products || [];
  const meta = data?.data?.meta;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Product Catalog
            </h1>
            <p className="text-xs text-slate-500">
              Explore farmer produce listings, bulk pricing tiers, stock availability, and detailed performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
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
              placeholder="Search products by name or description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Selling Unit Filter */}
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="">All Units</option>
              <option value="KG">Kilogram (KG)</option>
              <option value="BAG">Bag</option>
              <option value="PIECE">Piece</option>
              <option value="BUNDLE">Bundle</option>
              <option value="LITER">Liter</option>
              <option value="DOZEN">Dozen</option>
            </select>

            {/* Featured Filter */}
            <select
              value={selectedFeatured}
              onChange={(e) => {
                setSelectedFeatured(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="">All Featured Status</option>
              <option value="true">Featured Only ⭐</option>
              <option value="false">Standard (Not Featured)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              Loading marketplace harvests...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No products match current filters.</div>
              <p className="text-slate-400">Try clearing filters or search queries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Produce</th>
                    <th className="py-3.5 px-4">Farm / Producer</th>
                    <th className="py-3.5 px-4">Price per Unit</th>
                    <th className="py-3.5 px-4">Stock & Sold</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 text-center">Featured</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => {
                    const farmName =
                      prod.producer?.producerProfile?.farmName ||
                      prod.producer?.producerProfile?.companyName ||
                      prod.producer?.fullName ||
                      "Certified Farm";

                    const location =
                      prod.producer?.city ||
                      prod.producer?.producerProfile?.city ||
                      "Ivory Coast";

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product Info */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/products/${prod.id}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
                              {prod.imageUrls?.[0] ? (
                                <img
                                  src={prod.imageUrls[0]}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate flex items-center gap-1.5">
                                <span>{prod.name}</span>
                                {prod.isCertified && (
                                  <span title="Certified Harvest">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                <span>Unit: {prod.sellingUnit || "Unit"}</span>
                                {prod.category?.name && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-500 font-medium">{prod.category.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Producer Farm */}
                        <td className="py-3.5 px-4 text-slate-800">
                          {prod.producer?.id ? (
                            <Link
                              href={`/users/producers/${prod.producer.id}`}
                              className="group block"
                            >
                              <div className="font-semibold flex items-center gap-1.5 truncate max-w-[200px] group-hover:text-emerald-700 transition-colors">
                                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{farmName}</span>
                                <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {location}
                              </div>
                            </Link>
                          ) : (
                            <div>
                              <div className="font-semibold flex items-center gap-1.5 truncate max-w-[200px]">
                                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{farmName}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {location}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatCurrency(prod.pricePerUnit || 0)}
                          </span>
                          <span className="text-slate-400 text-[11px]"> / {prod.sellingUnit}</span>
                        </td>

                        {/* Stock & Sold */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span
                              className={`font-semibold ${(prod.availableQuantity || 0) > 10
                                  ? "text-emerald-700"
                                  : (prod.availableQuantity || 0) > 0
                                  ? "text-amber-600"
                                  : "text-rose-600"
                                }`}
                            >
                              {(prod.availableQuantity || 0).toLocaleString()} {prod.sellingUnit} in stock
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {(prod.sold || 0).toLocaleString()} sold
                            </span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{prod.avgRating ? prod.avgRating.toFixed(1) : "5.0"}</span>
                            <span className="text-amber-500 font-normal">
                              ({prod.totalReviews ?? 0})
                            </span>
                          </div>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(prod.id, Boolean(prod.isFeatured))}
                            disabled={togglingId === prod.id}
                            title={
                              prod.isFeatured
                                ? "Click to remove from homepage featured section"
                                : "Click to showcase on homepage featured section"
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                              prod.isFeatured
                                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs"
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                            } ${togglingId === prod.id ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            {togglingId === prod.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            ) : (
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  prod.isFeatured
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-slate-400"
                                }`}
                              />
                            )}
                            <span>{prod.isFeatured ? "Featured" : "Standard"}</span>
                          </button>
                        </td>

                        {/* Action: Link to dedicated Product Details Page */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/products/${prod.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all font-semibold shadow-2xs group"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            <span>Details</span>
                          </Link>
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
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} products)
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= (meta.totalPage || meta.totalPages || 1)}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
