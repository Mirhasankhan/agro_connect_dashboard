"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { TAdminDriverEarning } from "@/redux/features/admin/adminApi";

interface DriverEarningDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  earning: TAdminDriverEarning | null;
}

export default function DriverEarningDetailModal({
  isOpen,
  onClose,
  earning,
}: DriverEarningDetailModalProps) {
  if (!isOpen || !earning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Truck className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Driver Compensation Details
              </h3>
              <p className="text-xs text-sky-100/90 font-mono">
                ID: {earning.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status & Amount Highlight */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-sky-800  tracking-wider block">
                Delivery Route Fee
              </span>
              <span className="text-2xl font-black text-sky-955">
                {formatCurrency(earning.amount || 0)}{" "}
                <span className="text-xs font-bold text-sky-700">BDT</span>
              </span>
            </div>
            <div>
              {earning.isTransferred ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Settled & Transferred</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending Transfer</span>
                </span>
              )}
            </div>
          </div>

          {/* Driver Profile Section */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold  tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                Fleet Driver Profile
              </div>
              {earning.driver?.id && (
                <Link
                  href={`/users/drivers/${earning.driver.id}`}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 hover:underline"
                >
                  <span>View Driver Record</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {earning.driver?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={earning.driver.profileImage}
                  alt={earning.driver.fullName || "Driver"}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-base shadow-sm">
                  {earning.driver?.fullName
                    ? earning.driver.fullName.charAt(0).toUpperCase()
                    : "D"}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {earning.driver?.fullName || "Verified Logistics Driver"}
                  </h4>
                  {earning.driver?.driverProfile?.vehicleType && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {earning.driver.driverProfile.vehicleType}
                    </span>
                  )}
                </div>
                {earning.driver?.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{earning.driver.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dispatched Order Details */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold  tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                Dispatched Shipment Order
              </div>
              {earning.order?.orderId && (
                <Link
                  href={`/orders/${earning.order.orderId}`}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 hover:underline font-mono"
                >
                  <span>#{earning.order.orderId}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {earning.order?.totalAmount !== undefined && (
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Order Total Value</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(earning.order.totalAmount)}
                </span>
              </div>
            )}

            {earning.order?.items && earning.order.items.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold  tracking-wider text-slate-400 block">
                  Delivered Items ({earning.order.items.length})
                </span>
                <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50">
                  {earning.order.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 block truncate">
                          {item.productName}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {item.quantity} {item.sellingUnit}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700">
                        {formatCurrency(item.subtotal || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ledger Timestamps */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
            <div className="text-xs font-bold  tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Settlement Timestamps
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Dispatch Registered</span>
              <span className="font-semibold text-slate-800">
                {earning.createdAt
                  ? format(new Date(earning.createdAt), "MMMM dd, yyyy · HH:mm:ss")
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Transfer Settlement Date</span>
              <span className="font-semibold text-slate-800">
                {earning.paidAt
                  ? format(new Date(earning.paidAt), "MMMM dd, yyyy · HH:mm:ss")
                  : "Pending route cycle payout"}
              </span>
            </div>
          </div>

          {/* Logistics Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-900 text-xs">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Driver trip compensations are automatically disbursed to registered driver accounts upon validated delivery verification and hub dispatch confirmation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
