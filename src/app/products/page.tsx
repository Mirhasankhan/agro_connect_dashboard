"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetAllProductsQuery,
  useGetProductDetailsQuery,
} from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/admin/adminApi";
import { SellingUnit } from "@/types";
import {
  Search,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Sprout,
  X,
  Tag,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export default function ProductsCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [page, setPage] = useState(1);

  // Selected product for details inspection
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Categories for filter
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];

  // Query parameters
  const queryParams = {
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    sellingUnit: (selectedUnit as SellingUnit) || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllProductsQuery(queryParams);
  const products = data?.data?.products || [];
  const meta = data?.data?.meta;

  // Product details query
  const { data: detailsData, isLoading: isLoadingDetails } = useGetProductDetailsQuery(
    selectedProductId || "",
    { skip: !selectedProductId }
  );
  const detailedProduct = detailsData?.data?.product;

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
              Explore farmer produce listings, bulk pricing tiers, stock availability, and ratings.
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
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Produce</th>
                    <th className="py-3.5 px-4">Farm / Producer</th>
                    <th className="py-3.5 px-4">Price per Unit</th>
                    <th className="py-3.5 px-4">Available Stock</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => {
                    const farmName =
                      prod.producer?.producerProfile?.farmName ||
                      prod.producer?.producerProfile?.companyName ||
                      "Certified Farm";

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.imageUrls?.[0] ? (
                                <img
                                  src={prod.imageUrls[0]}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{prod.name}</div>
                              <div className="text-[11px] text-slate-400 truncate">
                                Selling by {prod.sellingUnit || "Unit"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Producer Farm */}
                        <td className="py-3.5 px-4 text-slate-800">
                          <div className="font-semibold flex items-center gap-1.5 truncate max-w-[200px]">
                            <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{farmName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {(prod.producer as any)?.city || prod.producer?.producerProfile?.city || "Ivory Coast"}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatCurrency(prod.pricePerUnit || 0)}
                          </span>
                          <span className="text-slate-400 text-[11px]"> / {prod.sellingUnit}</span>
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-semibold ${
                              (prod.availableQuantity || 0) > 10
                                ? "text-emerald-700"
                                : "text-amber-600"
                            }`}
                          >
                            {(prod.availableQuantity || 0).toLocaleString()} {prod.sellingUnit}
                          </span>
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

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              setDetailsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
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
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} products)
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

      {/* Product Details Drawer Modal */}
      {detailsModalOpen && selectedProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {detailedProduct?.name || "Product Details"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Harvest overview and wholesale tier structure.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              {isLoadingDetails ? (
                <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading product specifications...</span>
                </div>
              ) : detailedProduct ? (
                <>
                  {/* Image Gallery */}
                  {detailedProduct.imageUrls && detailedProduct.imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Product Photography
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {detailedProduct.imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={url}
                              alt={`${detailedProduct.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing & Stock Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Base Price
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {formatCurrency(detailedProduct.pricePerUnit || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Selling Unit
                      </span>
                      <span className="font-semibold text-slate-800">
                        {detailedProduct.sellingUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Stock Available
                      </span>
                      <span className="font-semibold text-slate-800">
                        {detailedProduct.availableQuantity} {detailedProduct.sellingUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Quantity Sold
                      </span>
                      <span className="font-semibold text-slate-800">
                        {detailedProduct.sold ?? 0} {detailedProduct.sellingUnit}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Description & Agricultural Notes
                    </span>
                    <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-slate-700">
                      {detailedProduct.description || "No description provided."}
                    </p>
                  </div>

                  {/* Pricing Tiers if available */}
                  {detailedProduct.pricingTiers && detailedProduct.pricingTiers.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bulk Pricing Tiers</span>
                      </span>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3 font-semibold">Min Quantity</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Discounted Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {detailedProduct.pricingTiers.map((tier: any, idx: number) => (
                              <tr key={idx}>
                                <td className="py-2.5 px-3 font-medium text-slate-800">
                                  {tier.quantity}+ {detailedProduct.sellingUnit}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                                  {formatCurrency(tier.pricePerUnit || 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
