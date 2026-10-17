"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useGetBuyerDetailsQuery } from "@/redux/features/admin/adminApi";
import {
  ShoppingBag,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

export default function BuyerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");

  const { data, isLoading, isFetching, refetch } = useGetBuyerDetailsQuery(id, {
    skip: !id,
  });

  const buyer = data?.data?.buyer;
  const orders = buyer?.orders || [];
  const addresses = buyer?.shippingAddresses || [];

  // Financial calculations
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;


  const renderOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "Active":
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Truck className="w-3 h-3" />
            <span>{status === "Shipped" ? "In Transit" : "Active Dispatch"}</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>{status || "Pending"}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <div className="font-semibold text-slate-700 text-sm">Loading buyer profile...</div>
          <p className="text-slate-400">Fetching order history, shipping destinations, and account details.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!buyer) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-500 space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Buyer Not Found</h2>
          <p className="text-slate-500">
            The requested buyer profile could not be located in the database.
          </p>
          <Link
            href="/users/buyers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Buyer List</span>
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
              href="/users/buyers"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              title="Back to Buyers"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                <Link href="/users/buyers" className="hover:text-emerald-700 transition-colors">
                  Buyers
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">{buyer.fullName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>{buyer.fullName}</span>
              </h1>
            </div>
          </div>      
        </div>

        {/* Buyer Profile & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-5 relative">
              <div className="flex items-center gap-4 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg border-2 border-white shrink-0 overflow-hidden">
                  {buyer.profileImage ? (
                    <img
                      src={buyer.profileImage}
                      alt={buyer.fullName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-100 text-emerald-800 text-2xl font-bold flex items-center justify-center rounded-xl">
                      {buyer.fullName?.charAt(0) || "B"}
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{buyer.fullName}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{buyer.status || "Active Customer"}</span>
                    </span>
                  </div>                 
                </div>
              </div>
            </div>

            {/* Quick Contact & Geographic Meta Details */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{buyer.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{buyer.phoneNumber || "No phone listed"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {[buyer.address, buyer.city, buyer.region].filter(Boolean).join(", ") || "Ivory Coast"}
                </span>
              </div>
            </div>
          </div>
          </div>

          {/* Customer Metrics KPI Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Total Orders Placed
              </span>
              <span className="text-2xl font-bold text-slate-900">{orders.length}</span>          
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Total Spent
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </span>             
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
               Average Order Value
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(Math.round(avgOrderValue))}
              </span>        
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Saved Delivery Addresses
              </span>
              <span className="text-2xl font-bold text-slate-900">{addresses.length}</span>             
            </div>
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${activeTab === "orders"
                ? "text-emerald-700 border-b-2 border-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${activeTab === "addresses"
                ? "text-emerald-700 border-b-2 border-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Shipping Addresses ({addresses.length})</span>
          </button>
        </div>

        {/* TAB 1: Order History */}
        {activeTab === "orders" && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Buyer Order Placements</h3>                
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-800">No Orders Placed Yet</div>
                <p className="text-slate-400">This buyer has not checked out any orders on the marketplace.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold  tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4">Items Manifest</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Date Placed</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <Link
                            href={`/orders/${order.id}`}
                            className="hover:text-emerald-700 hover:underline"
                          >
                            #{order.id.slice(-8)}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">{renderOrderStatusBadge(order.status)}</td>
                        <td className="py-3.5 px-4">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="text-slate-700 font-medium">
                                  {item.productName}{" "}
                                  <span className="text-slate-400 text-[11px]">
                                    ({item.quantity} {item.sellingUnit})
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  +{order.items.length - 2} more items
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Order items</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {formatCurrency(order.totalAmount || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                          >
                            <span>Inspect</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Shipping Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-800">No Shipping Addresses On File</div>
                <p className="text-slate-400">This buyer has not saved any delivery destinations yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400  tracking-wider">
                        Address #{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{addr.city || "Abidjan"}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{addr.addressLine}</p>
                      {addr.postCode && (
                        <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                          Postal Code: {addr.postCode}
                        </span>
                      )}
                    </div>

                    {addr.instruction && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                          Delivery Instructions
                        </span>
                        <p className="text-xs text-slate-500 italic">&ldquo;{addr.instruction}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
