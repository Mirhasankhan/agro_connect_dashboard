"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Ban,
  Loader2,
  DollarSign,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import {
  useAdminCancelOrderMutation,
  useAdminCancelOrderItemMutation,
} from "@/redux/features/admin/adminApi";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatters";

interface AdminCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "order" | "item";
  orderId: string;
  orderCode?: string;
  orderItemId?: string;
  targetName?: string;
  subtotal?: number;
  totalAmount?: number;
  onSuccess?: () => void;
}

const COMMON_ORDER_REASONS = [
  "Buyer requested cancellation via customer support",
  "Producer harvest failure / crop perishability",
  "Logistics / carrier unavailable in delivery region",
  "Administrative fraud check or system flag",
];

const COMMON_ITEM_REASONS = [
  "Out of stock / Producer unable to harvest",
  "Quality inspection failed at regional hub",
  "Buyer requested removal of this single item",
  "Product damaged during hub transit",
];

export default function AdminCancelModal({
  isOpen,
  onClose,
  mode,
  orderId,
  orderCode,
  orderItemId,
  targetName,
  subtotal = 0,
  totalAmount = 0,
  onSuccess,
}: AdminCancelModalProps) {
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState<"FULL" | "ITEMS_ONLY" | "CUSTOM" | "NONE">("FULL");
  const [customRefundAmount, setCustomRefundAmount] = useState<number>(0);
  const [itemRefundAmount, setItemRefundAmount] = useState<number>(subtotal);
  const [restoreInventory, setRestoreInventory] = useState(true);
  const [error, setError] = useState("");

  const [adminCancelOrder, { isLoading: isCancellingOrder }] = useAdminCancelOrderMutation();
  const [adminCancelOrderItem, { isLoading: isCancellingItem }] = useAdminCancelOrderItemMutation();

  const isSubmitting = isCancellingOrder || isCancellingItem;

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setRestoreInventory(true);
      if (mode === "order") {
        setRefundType("FULL");
        setCustomRefundAmount(totalAmount);
      } else {
        setItemRefundAmount(subtotal);
      }
    }
  }, [isOpen, mode, totalAmount, subtotal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Please provide a comprehensive cancellation reason for administrative records.");
      return;
    }

    try {
      if (mode === "order") {
        let payloadAmount: number | undefined = undefined;
        if (refundType === "CUSTOM") {
          if (customRefundAmount < 0 || customRefundAmount > totalAmount) {
            setError(`Custom refund must be between ৳0 and ৳${totalAmount}.`);
            return;
          }
          payloadAmount = Number(customRefundAmount);
        }

        await adminCancelOrder({
          id: orderId,
          payload: {
            reason: trimmedReason,
            refundType,
            customRefundAmount: payloadAmount,
            restoreInventory,
          },
        }).unwrap();

        toast.success(`Order #${orderCode || orderId.slice(-8)} has been cancelled successfully.`);
      } else {
        if (!orderItemId) {
          setError("Order item ID is missing.");
          return;
        }

        if (itemRefundAmount < 0 || itemRefundAmount > subtotal) {
          setError(`Refund amount must be between ৳0 and ৳${subtotal}.`);
          return;
        }

        await adminCancelOrderItem({
          id: orderItemId,
          payload: {
            reason: trimmedReason,
            refundAmount: Number(itemRefundAmount),
            restoreInventory,
          },
        }).unwrap();

        toast.success(`Item "${targetName || "Item"}" has been cancelled and refunded.`);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      const msg = apiErr?.data?.message || "Failed to process administrative cancellation.";
      setError(msg);
      toast.error(msg);
    }
  };

  const reasonChips = mode === "order" ? COMMON_ORDER_REASONS : COMMON_ITEM_REASONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === "order" ? "Cancel Entire Order (Admin)" : "Cancel Order Item (Admin)"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {mode === "order"
                  ? `Order #${orderCode || orderId.slice(-8)}`
                  : targetName || "Selected Item"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto">
          {/* Target Summary */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Administrative Override & Stripe Escrow Action</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {mode === "order"
                ? `Cancelling this order will release assigned drivers, optionally restore inventory stock, and process an immediate Stripe refund to the buyer's original payment method.`
                : `Cancelling "${targetName}" will issue a partial Stripe refund to the customer and update the order to Partially Cancelled without interrupting the remaining items.`}
            </p>
            <div className="flex items-center gap-4 pt-1 font-semibold text-slate-800 text-[11px]">
              {mode === "order" ? (
                <div>
                  <span className="text-slate-400 font-normal">Order Total: </span>
                  <span className="text-rose-700 font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              ) : (
                <div>
                  <span className="text-slate-400 font-normal">Item Subtotal: </span>
                  <span className="text-rose-700 font-bold">{formatCurrency(subtotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              Reason for Cancellation <span className="text-rose-600">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {reasonChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setReason(chip)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    reason === chip
                      ? "bg-rose-50 text-rose-700 border-rose-300 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed administrative reason for audit trails and customer notification..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs text-slate-800 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Refund Selection for Entire Order */}
          {mode === "order" && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Stripe Refund Strategy</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    type: "FULL",
                    label: "100% Full Refund",
                    desc: `Items + Delivery (${formatCurrency(totalAmount)})`,
                  },
                  {
                    type: "ITEMS_ONLY",
                    label: "Items Only Refund",
                    desc: "Deduct flat delivery charge",
                  },
                  {
                    type: "CUSTOM",
                    label: "Custom Amount",
                    desc: "Specify exact refund amount",
                  },
                  {
                    type: "NONE",
                    label: "No Refund",
                    desc: "Cancel without Stripe payout",
                  },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.type}
                    onClick={() => setRefundType(opt.type as typeof refundType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      refundType === opt.type
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/10"
                        : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {refundType === "CUSTOM" && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Custom Refund Amount (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={totalAmount}
                      value={customRefundAmount}
                      onChange={(e) => setCustomRefundAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Max refundable: {formatCurrency(totalAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Refund Selection for Single Item */}
          {mode === "item" && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Item Refund Amount (৳ BDT)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={subtotal}
                  value={itemRefundAmount}
                  onChange={(e) => setItemRefundAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Item subtotal: {formatCurrency(subtotal)}. Enter 0 if no refund should be issued.
              </span>
            </div>
          )}

          {/* Restock Inventory Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={restoreInventory}
                onChange={(e) => setRestoreInventory(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-800 block flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore Product Inventory</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Automatically add the cancelled quantity back to the producer&apos;s product stock.
                </span>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs leading-tight font-medium">{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Cancellation...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>{mode === "order" ? "Confirm Order Cancellation" : "Confirm Item Cancellation"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
