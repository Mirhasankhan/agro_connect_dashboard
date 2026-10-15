"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Coins,
  CheckCircle2,
  Clock,
  Sprout,
  Package,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import {
  TAdminProducerEarning,
  useTransferProducerEarningMutation,
} from "@/redux/features/admin/adminApi";
import { toast } from "react-toastify";
import TransferConfirmModal from "./TransferConfirmModal";

interface ProducerEarningDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  earning: TAdminProducerEarning | null;
}

export default function ProducerEarningDetailModal({
  isOpen,
  onClose,
  earning,
}: ProducerEarningDetailModalProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [transferProducerEarning, { isLoading: isTransferring }] =
    useTransferProducerEarningMutation();

  if (!isOpen || !earning) return null;

  const createdAtMs = earning.createdAt
    ? new Date(earning.createdAt).getTime()
    : Date.now();
  const is24HoursPassed = createdAtMs + 24 * 60 * 60 * 1000 <= Date.now();
  const hoursRemaining = Math.max(
    0,
    Math.ceil((createdAtMs + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60))
  );

  const handleTransfer = async () => {
    try {
      const res = await transferProducerEarning(earning.id).unwrap();
      toast.success(res.message || "Producer earning transferred successfully!");
      setIsConfirmOpen(false);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to transfer earning."
      );
      throw err;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Coins className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Producer Payout Details
                </h3>
                <p className="text-xs text-emerald-100/90 font-mono">
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
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 tracking-wider block">
                  Producer Payout
                </span>
                <span className="text-2xl font-black text-emerald-950">
                  {formatCurrency(earning.amount || 0)}{" "}
                  <span className="text-xs font-bold text-emerald-700">BDT</span>
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
                    <span>Escrow Clearance Pending</span>
                  </span>
                )}
              </div>
            </div>

            {/* Escrow & 24h Buffer Clearance Note */}
            {!earning.isTransferred && (
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                  is24HoursPassed
                    ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                    : "bg-amber-50/70 border-amber-200/80 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {is24HoursPassed ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>24-Hour Settlement Buffer Cleared</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        24-Hour Buffer Active (~{hoursRemaining}h remaining)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] opacity-90 pl-6">
                  {is24HoursPassed
                    ? "Order completion has passed the 24-hour buyer inspection window. This payout is ready for manual Stripe transfer."
                    : "AgroConnect policy requires 24 hours after delivery to allow buyers to report issues. Payouts initiated before 24 hours will be blocked by backend checks."}
                </p>
              </div>
            )}

            {/* Producer Profile Section */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  Producer Information
                </div>
                {earning.producer?.id && (
                  <Link
                    href={`/users/producers/${earning.producer.id}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                {earning.producer?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={earning.producer.profileImage}
                    alt={earning.producer.fullName || "Producer"}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-sm">
                    {earning.producer?.fullName
                      ? earning.producer.fullName.charAt(0).toUpperCase()
                      : "P"}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {earning.producer?.fullName || "Verified Agricultural Producer"}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>
                      {earning.producer?.producerProfile?.farmName ||
                        "Independent Agro Partner"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Produce Item Section */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="text-xs font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                Order Item Fulfilled
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">
                    Produce Item
                  </span>
                  <span className="text-slate-900 font-bold block truncate">
                    {earning.orderItem?.productName || "Direct Farm Produce"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">
                    Quantity & Unit
                  </span>
                  <span className="text-slate-900 font-bold block">
                    {earning.orderItem?.quantity || 1}{" "}
                    {earning.orderItem?.sellingUnit || "units"}
                  </span>
                </div>
              </div>

              {earning.orderItem?.subtotal !== undefined && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-slate-500 font-medium">
                    Item Subtotal Value
                  </span>
                  <span className="text-slate-900 font-bold">
                    {formatCurrency(earning.orderItem.subtotal)}
                  </span>
                </div>
              )}
            </div>

            {/* Transfer Timeline & Dates */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="text-xs font-bold tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Ledger Timestamps
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Record Created</span>
                <span className="font-semibold text-slate-800">
                  {earning.createdAt
                    ? format(
                        new Date(earning.createdAt),
                        "MMMM dd, yyyy · HH:mm:ss"
                      )
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Transfer Settlement Date</span>
                <span className="font-semibold text-slate-800">
                  {earning.paidAt
                    ? format(
                        new Date(earning.paidAt),
                        "MMMM dd, yyyy · HH:mm:ss"
                      )
                    : "Pending final escrow settlement"}
                </span>
              </div>
            </div>

            {/* Security & Escrow Note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Farmer revenue settlements are secured through Stripe Connect
                escrow. Payouts are transferred directly into verified bank
                accounts upon customer delivery confirmation.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Close Details
            </button>

            {!earning.isTransferred && (
              <button
                onClick={() => setIsConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Transfer Funds Manually</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <TransferConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleTransfer}
        type="Producer"
        earningId={earning.id}
        recipientName={earning.producer?.fullName || "Agricultural Producer"}
        recipientSubtitle={
          earning.producer?.producerProfile?.farmName || "Direct Farm Partner"
        }
        amount={earning.amount || 0}
        createdAt={earning.createdAt}
        isLoading={isTransferring}
      />
    </>
  );
}
