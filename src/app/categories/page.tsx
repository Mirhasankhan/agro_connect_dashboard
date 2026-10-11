"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateCategoryModal from "@/components/categories/CreateCategoryModal";
import {
  useGetAllCategoriesQuery,
  useToggleCategoryStatusMutation,
} from "@/redux/features/admin/adminApi";
import {
  Grid,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

export default function CategoriesManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetAllCategoriesQuery();
  const [toggleCategoryStatus, { isLoading: isToggling }] = useToggleCategoryStatusMutation();

  const categories = data?.data?.categories || [];

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? cat.isActive !== false
        : cat.isActive === false;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleCategoryStatus(id).unwrap();
      toast.success(res.message || "Category status updated successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update status.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Product Taxonomy
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Categories Management
            </h1>
            <p className="text-xs text-slate-500">
              Create, organize, and activate marketplace classifications for agricultural harvests.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category name or slug..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Deactivated Only</option>
            </select>
          </div>
        </div>

        {/* Categories Grid Display */}
        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
            Loading market categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
            <Grid className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-800">No categories found.</div>
            <p className="text-slate-400">Click &quot;Create Category&quot; to add your first classification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCategories.map((category) => {
              const isActive = category.isActive !== false;

              return (
                <div
                  key={category.id}
                  className={`rounded-2xl bg-white border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? "border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300"
                      : "border-slate-200 bg-slate-50/60 opacity-80"
                  }`}
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                          <Grid className="w-8 h-8" />
                        </div>
                      )}

                      {/* Status pill badge on top of image */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm ${
                            isActive
                              ? "bg-emerald-600/90 text-white border border-emerald-400/40"
                              : "bg-rose-700/90 text-white border border-rose-400/40"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-slate-900 text-sm">{category.name}</h3>
                        <p className="font-mono text-[11px] text-emerald-700 font-semibold">
                          /{category.slug}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {category.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Status Control</span>

                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        isActive
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-rose-500" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </DashboardLayout>
  );
}
