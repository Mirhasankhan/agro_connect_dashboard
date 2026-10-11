"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AssignDriverModal from "@/components/orders/AssignDriverModal";
import {
  useGetAllOrdersQuery,
  TAdminOrder,
} from "@/redux/features/admin/adminApi";
import { OrderStatus } from "@/types";
import {
  Search,
  ShoppingBag,
  Truck,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

export default function OrdersManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Selected order for driver dispatch
  const [selectedOrder, setSelectedOrder] = useState<TAdminOrder | null>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Query parameters
  const queryParams = {
    search: search.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching, refetch } = useGetAllOrdersQuery(queryParams);
  const orders = data?.data?.orders || [];
  const meta = data?.data?.meta;

  const totalVolume = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              Platform Commerce Operations
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Orders & Delivery Dispatch
            </h1>
            <p className="text-xs text-slate-500">
              Track paid buyer orders, monitor regional hub status, and assign verified delivery drivers.
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

        {/* Quick Highlights Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Orders Logged
              </span>
              <span className="text-xl font-bold text-slate-900">
                {meta?.total ?? orders.length} Orders
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Payment Verification
              </span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Pre-Paid via Stripe</span>
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Page Volume Sample
              </span>
              <span className="text-xl font-bold text-slate-900">
                {totalVolume.toLocaleString()} XOF
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
              <DollarSign className="w-5 h-5" />
            </div>
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
              placeholder="Search by Order ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="Active">Active (Ready for Dispatch)</option>
              <option value="Pending">Pending Processing</option>
              <option value="Shipped">In Delivery (Shipped)</option>
              <option value="Delivered">Delivered Successfully</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              Loading paid customer orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-800">No orders found.</div>
              <p className="text-slate-400">Try adjusting your search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Buyer Customer</th>
                    <th className="py-3.5 px-4">Destination Address</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                          #{order.orderId?.slice(-8) || order.id?.slice(-8)}
                        </span>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {order.customer?.fullName?.charAt(0) || "B"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {order.customer?.fullName || "Buyer Customer"}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Paid Account
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.shippingAddress?.city || "Abidjan"}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {order.shippingAddress?.addressLine || "Address on record"}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {order._count?.items ?? 1} items
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {(order.totalAmount || 0).toLocaleString()} XOF
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {order.createdAt
                          ? format(new Date(order.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setDispatchModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Assign Driver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && (meta.totalPage > 1 || (meta.totalPages && meta.totalPages > 1)) && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing page <span className="font-semibold text-slate-800">{meta.page}</span> of{" "}
                <span className="font-semibold text-slate-800">{meta.totalPage || meta.totalPages}</span> ({meta.total} orders)
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

      {/* Driver Assignment Modal */}
      {selectedOrder && (
        <AssignDriverModal
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          order={selectedOrder}
          onSuccess={() => refetch()}
        />
      )}
    </DashboardLayout>
  );
}
