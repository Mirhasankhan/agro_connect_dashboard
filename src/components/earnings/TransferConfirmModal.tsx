"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  DollarSign,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

interface TransferConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type: "Producer" | "Driver";
  earningId: string;
  recipientName: string;
  recipientSubtitle?: string;
  amount: number;
  createdAt: string;
  isLoading?: boolean;
}

export default function TransferConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  earningId,
  recipientName,
  recipientSubtitle,
  amount,
  createdAt,
  isLoading = false,
}: TransferConfirmModalProps) {
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const createdAtDate = createdAt ? new Date(createdAt) : new Date();
  const createdAtMs = createdAtDate.getTime();
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const is24HoursPassed = createdAtMs + twentyFourHoursMs <= now;
  const hoursRemaining = Math.max(
    0,
    Math.ceil((createdAtMs + twentyFourHoursMs - now) / (1000 * 60 * 60))
  );

  const handleConfirm = async () => {
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.message ||
          "Failed to process manual transfer."
      );
    }
  };

  const isProducer = type === "Producer";
  const themeColor = isProducer ? "emerald" : "sky";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                isProducer
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-sky-50 text-sky-600 border border-sky-100"
              }`}
            >
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Confirm Manual Transfer
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {type} Payout ID: {earningId.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-5 space-y-4">
          {/* Recipient and Amount Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Recipient ({type})
              </span>
              <span className="font-bold text-slate-800 text-right">
                {recipientName}
              </span>
            </div>

            {recipientSubtitle && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Details</span>
                <span className="text-slate-600 text-right font-medium">
                  {recipientSubtitle}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Disbursement Amount
              </span>
              <span
                className={`text-xl font-black ${
                  isProducer ? "text-emerald-700" : "text-sky-700"
                }`}
              >
                {formatCurrency(amount)}{" "}
                <span className="text-xs font-bold text-slate-400">BDT</span>
              </span>
            </div>
          </div>

          {/* 24-Hour Policy Clearance Check */}
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              is24HoursPassed
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {is24HoursPassed ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24-Hour Dispute Clearance Passed</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Escrow Buffer Active (~{hoursRemaining}h remaining)</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90 pl-6">
              {is24HoursPassed
                ? `Created on ${format(
                    createdAtDate,
                    "MMM dd, yyyy HH:mm"
                  )}. Escrow time requirement satisfied. No unresolved dispute found.`
                : `Created on ${format(
                    createdAtDate,
                    "MMM dd, yyyy HH:mm"
                  )}. AgroConnect requires a 24-hour buyer inspection window before payout. Backend verification will reject early release if 24 hours have not passed.`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all ${
              isProducer
                ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-emerald-400"
                : "bg-sky-600 hover:bg-sky-700 active:scale-95 disabled:bg-sky-400"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <>
                <span>Confirm & Disburse Funds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
