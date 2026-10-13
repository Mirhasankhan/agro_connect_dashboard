"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AssignDriverModal from "@/components/orders/AssignDriverModal";
import { useGetOrderDetailsQuery } from "@/redux/features/admin/adminApi";
import {
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  User,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ExternalLink,
  Sprout,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetOrderDetailsQuery(id, {
    skip: !id,
  });

  const order = data?.data?.order;
  const customer = order?.customer;
  const shippingAddress = order?.shippingAddress;
  const deliveries = order?.deliveries || [];
  const activeDelivery = deliveries[0];
  const driver = activeDelivery?.driver;
  const items = order?.items || [];

  // Financial calculations
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const deliveryFee = order?.deliveryCharge ?? 50;

  const renderOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered Successfully</span>
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Delivery (Shipped)</span>
          </span>
        );
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Active (Ready for Hub Dispatch)</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled Order</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{status || "Pending Processing"}</span>
          </span>
        );
    }
  };

  const renderItemStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "SentToHub":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Package className="w-3 h-3" />
            <span>Arrived at Regional Hub</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>{status || "Pending Hub Delivery"}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <div className="font-semibold text-slate-700 text-sm">Loading complete order details...</div>
          <p className="text-slate-400">Fetching customer destination, logistics dispatch, and manifest.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-500 space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Order Not Found</h2>
          <p className="text-slate-500">
            The requested order ID could not be found in the commerce database.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Orders List</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              title="Back to Orders"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                <Link href="/orders" className="hover:text-emerald-700 transition-colors">
                  Orders
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-mono font-medium">#{order.orderId || order.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Order #{order.orderId?.slice(-8) || order.id.slice(-8)}</span>
                {renderOrderStatusBadge(order.status)}
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

            {/* If order is Active and driver not yet assigned */}
            {order?.status === "Active" && (!activeDelivery || !driver) && (
              <button
                onClick={() => setAssignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Assign Driver</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial & Status Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Total Order Amount
              </span>
              <span className="text-2xl font-bold text-emerald-700">
                {formatCurrency(order.totalAmount || 0)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Items: {formatCurrency(itemsSubtotal)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Payment Verification
              </span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Pre-Paid via Stripe</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-mono truncate max-w-[180px]">
                {order.stripePaymentIntentId || "Stripe Verified"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Delivery Surcharge
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(deliveryFee)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Dispatched to carrier driver
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                Order Placement Date
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-1">
                {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {order.createdAt ? format(new Date(order.createdAt), "HH:mm:ss") : ""}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid: Customer Destination & Logistics Dispatch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer & Shipping Destination */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Buyer Customer & Destination</span>
              </h3>
              {customer?.id && (
                <Link
                  href={`/users/buyers/${customer.id}`}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <span>Customer Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 text-base font-bold flex items-center justify-center shrink-0">
                {customer?.fullName?.charAt(0) || "B"}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {customer?.fullName || "Buyer Customer"}
                </div>
                <div className="text-xs text-slate-500 truncate">{customer?.email}</div>
                {customer?.phoneNumber && (
                  <div className="text-xs text-slate-400">{customer.phoneNumber}</div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-1">
                Delivery Address on Record
              </span>
              <div className="flex items-start gap-2 text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {shippingAddress?.city || customer?.city || "Abidjan"}
                  </span>
                  <p className="text-slate-600">{shippingAddress?.addressLine || customer?.address || "Address not provided"}</p>
                  {shippingAddress?.postCode && (
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Postal Code: {shippingAddress.postCode}
                    </span>
                  )}
                </div>
              </div>
              {shippingAddress?.instruction && (
                <div className="pt-2 border-t border-slate-200/60 text-slate-600 italic">
                  <span className="not-italic font-bold text-slate-700 text-[11px] block">
                    Delivery Instructions:
                  </span>
                  &ldquo;{shippingAddress.instruction}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Carrier Dispatch */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Logistics & Fleet Dispatch</span>
              </h3>
              {driver?.id && (
                <Link
                  href={`/users/drivers/${driver.id}`}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                >
                  <span>Driver Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 text-base font-bold flex items-center justify-center shrink-0">
                    {driver.fullName?.charAt(0) || "D"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{driver.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">{driver.email}</div>
                    {driver.phoneNumber && (
                      <div className="text-xs text-slate-400">{driver.phoneNumber}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                      Vehicle Type
                    </span>
                    <span className="font-semibold text-slate-900">
                      {driver.driverProfile?.vehicleType || "Fleet Vehicle"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                      Plate / Registration
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {driver.driverProfile?.registrationNumber || "On File"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs flex items-center justify-between text-sky-800">
                  <span className="font-medium">Delivery Dispatch Status:</span>
                  <span className="font-bold">{activeDelivery.status}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-800">
                  {order?.status === "Delivered"
                    ? "Order Delivered"
                    : "No Carrier Assigned Yet"}
                </div>
                <p className="text-slate-400 max-w-xs mx-auto">
                  {order?.status === "Delivered"
                    ? "This order has been fulfilled and delivered to the customer."
                    : "This order is ready for dispatch. Assign a verified fleet driver to transport packages from hub to customer."}
                </p>
                {order?.status === "Active" && (
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Assign Fleet Driver</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Items Manifest Table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ordered Agricultural Products Manifest</h3>
              <p className="text-xs text-slate-500">
                Detailed breakdown of crops, supplier farms, unit prices, and fulfillment status.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">{items.length} items logged</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold  tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Item Product</th>
                  <th className="py-3 px-4">Origin Farm / Producer</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Hub Fulfillment Status</th>
                  <th className="py-3 px-4">Producer Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {item.product?.imageUrls && item.product.imageUrls.length > 0 ? (
                            <img
                              src={item.product.imageUrls[0]}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          {item.product?.category?.name && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              {item.product.category.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Producer & Farm */}
                    <td className="py-3.5 px-4">
                      {item.product?.producer ? (
                        <div>
                          <Link
                            href={`/users/producers/${item.product.producer.id}`}
                            className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Sprout className="w-3 h-3 text-emerald-600" />
                            <span>{item.product.producer.fullName}</span>
                          </Link>
                          <div className="text-[10px] text-slate-400">
                            {item.product.producer.producerProfile?.farmName || "Registered Farm"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Local farm supplier</span>
                      )}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {formatCurrency(item.unitPrice || 0)}{" "}
                      <span className="text-[10px] text-slate-400">/ {item.sellingUnit}</span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.quantity} {item.sellingUnit}
                    </td>

                    {/* Subtotal */}
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatCurrency(item.subtotal || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{renderItemStatusBadge(item.status)}</td>

                    {/* Producer Payout */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.producerEarning ? (
                        <div>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(item.producerEarning.amount)}
                          </span>
                          <span className="text-[10px] block text-emerald-600 font-medium">
                            {item.producerEarning.isTransferred ? "Transferred" : "Pending transfer"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financial Reconciliation */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Payment Method: <span className="font-semibold text-slate-800">Stripe Escrow Pre-Paid</span>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-slate-500">
                Items Subtotal:{" "}
                <span className="font-semibold text-slate-800">{formatCurrency(itemsSubtotal)}</span>
              </div>
              <div className="text-slate-500">
                Logistics & Carrier Fee:{" "}
                <span className="font-semibold text-slate-800">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="text-sm font-bold text-emerald-800 pt-1 border-t border-slate-200">
                Grand Total: {formatCurrency(order.totalAmount || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {order && (
        <AssignDriverModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          order={order}
          onSuccess={() => refetch()}
        />
      )}
    </DashboardLayout>
  );
}
