"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, X } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isAccept: boolean, rejectReason?: string) => Promise<void>;
  accountName: string;
  accountType: "Producer" | "Driver";
  defaultAction?: "accept" | "reject";
  isLoading?: boolean;
}

export default function ApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  accountName,
  accountType,
  defaultAction = "accept",
  isLoading = false,
}: ApprovalModalProps) {
  const [action, setAction] = useState<"accept" | "reject">(defaultAction);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (action === "reject" && !rejectReason.trim()) {
      setError("Please provide a reason for rejecting this account verification.");
      return;
    }

    try {
      await onConfirm(action === "accept", action === "reject" ? rejectReason.trim() : undefined);
      setRejectReason("");
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to process approval request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              action === "accept"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}
          >
            {action === "accept" ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {action === "accept" ? "Approve" : "Reject"} {accountType} Account
            </h3>
            <p className="text-xs text-slate-500">
              Target partner: <span className="font-semibold text-slate-800">{accountName}</span>
            </p>
          </div>
        </div>

        {/* Action Toggle Switch */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
          <button
            type="button"
            onClick={() => {
              setAction("accept");
              setError("");
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              action === "accept"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approve Account
          </button>
          <button
            type="button"
            onClick={() => {
              setAction("reject");
              setError("");
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              action === "reject"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reject Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {action === "accept" ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-800 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verification Confirmation</span>
              </div>
              <p className="leading-relaxed">
                By approving this {accountType.toLowerCase()}, their account will immediately be marked as{" "}
                <span className="font-bold">Accepted</span>. They will gain authorization to list harvests or accept delivery dispatches.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Expired vehicle insurance document, missing National ID scan..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-500">
                This explanation will be recorded and communicated to the partner.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                action === "accept"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
              }`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{action === "accept" ? "Confirm Approval" : "Confirm Rejection"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
