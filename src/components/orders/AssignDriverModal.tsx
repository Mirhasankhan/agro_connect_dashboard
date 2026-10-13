"use client";

import React, { useState } from "react";
import {
  X,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MapPin,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  TAdminOrder,
  useGetAllDriversQuery,
  useAssignDriverMutation,
} from "@/redux/features/admin/adminApi";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatters";

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TAdminOrder | null;
  onSuccess?: () => void;
}

export default function AssignDriverModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: AssignDriverModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [hubConfirmed, setHubConfirmed] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch verified drivers
  const { data: driversData, isLoading: isLoadingDrivers, refetch: refetchDrivers } =
    useGetAllDriversQuery(
      { verificationStatus: "Accepted", limit: 50 },
      { skip: !isOpen }
    );

  const [assignDriver, { isLoading: isAssigning }] = useAssignDriverMutation();

  if (!isOpen || !order) return null;

  const allDrivers = driversData?.data?.drivers || [];
  // Filter for available drivers
  const availableDrivers = allDrivers.filter((d) => d.driverProfile?.isAvailable);
  const busyDrivers = allDrivers.filter((d) => !d.driverProfile?.isAvailable);
  const isDelivered = order.status === "Delivered";

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isDelivered) {
      setError("This order has already been delivered to the customer and cannot be assigned to a driver.");
      return;
    }

    if (!selectedDriverId) {
      setError("Please select a verified driver from the available fleet.");
      return;
    }

    if (!hubConfirmed) {
      setError("You must confirm all items have arrived at the regional hub before assigning a driver.");
      return;
    }

    try {
      const res = await assignDriver({
        orderId: order.id,
        driverId: selectedDriverId,
      }).unwrap();

      toast.success(res.message || "Driver successfully assigned to order delivery!");
      refetchDrivers();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to assign driver. Ensure order items are marked 'SentToHub' and driver is available.";
      setError(message);
      toast.error(message);
    }
  };

  const selectedDriver = allDrivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign Delivery Driver
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Order #{order.orderId?.slice(-8) || order.id?.slice(-8)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isAssigning}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleAssign} className="p-6 space-y-5 text-xs text-slate-700">
          {/* Order Details Brief */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dispatch Order Summary
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Buyer
                </span>
                <span className="font-semibold text-slate-900 truncate block">
                  {order.customer?.fullName || "Buyer"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Total Amount
                </span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(order.totalAmount || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Item Count
                </span>
                <span className="font-semibold text-slate-900">
                  {order._count?.items ?? 1} items
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-800">
                  {order.shippingAddress?.addressLine || "Address on file"}, {order.shippingAddress?.city || "Abidjan"}
                </span>
                <span className="text-slate-400 block text-[11px]">Destination Address</span>
              </div>
            </div>
          </div>

          {/* Regional Hub Prerequisite Check */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Regional Hub Logistics Verification</span>
              </div>
              <input
                type="checkbox"
                id="hubCheck"
                checked={hubConfirmed}
                onChange={(e) => setHubConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
            </div>
            <label htmlFor="hubCheck" className="text-slate-600 text-[11px] block cursor-pointer leading-relaxed">
              Confirm all harvest items for this order have arrived at the regional collection hub (Status: <code className="font-semibold text-emerald-800">SentToHub</code>). The backend rejects driver assignment if items are still in transit from farmers.
            </label>
          </div>

          {/* Driver Fleet Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Select Verified Fleet Driver <span className="text-rose-500">*</span>
            </label>

            {isLoadingDrivers ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading available verified fleet drivers...</span>
              </div>
            ) : availableDrivers.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">No available drivers at this moment</div>
                  <p className="text-[11px] mt-0.5">
                    All accepted drivers are currently offline or busy with active deliveries. Check back soon or verify newly registered drivers.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  required
                  value={selectedDriverId}
                  onChange={(e) => {
                    setSelectedDriverId(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                >
                  <option value="">-- Choose from {availableDrivers.length} Available Drivers --</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName} • Vehicle: {driver.driverProfile?.vehicleType || "Fleet"} • Reg: {driver.driverProfile?.registrationNumber || "N/A"}
                    </option>
                  ))}
                </select>

                {/* Selected Driver Card Preview */}
                {selectedDriver && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                        {selectedDriver.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{selectedDriver.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {selectedDriver.phoneNumber || selectedDriver.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready for Dispatch</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Busy Drivers Informational Note */}
          {busyDrivers.length > 0 && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>{busyDrivers.length} verified drivers are currently unavailable on delivery routes.</span>
            </div>
          )}

          {/* Order Delivered Banner */}
          {isDelivered && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Order Already Delivered</span>
                <span>This order has already been fulfilled and delivered to the buyer. Driver dispatch is disabled.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Assignment Blocked</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Sticky Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAssigning || isDelivered || !selectedDriverId || availableDrivers.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-emerald-600/20"
            >
              {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm & Dispatch Driver</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
