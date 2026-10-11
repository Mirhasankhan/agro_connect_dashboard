"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Coins,
  Sprout,
  Clock,
  AlertCircle,
  Landmark,
} from "lucide-react";

export default function ProducerEarningsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Farmer & Cooperative Revenue
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Producer Earnings & Payouts
            </h1>
            <p className="text-xs text-slate-500">
              Direct agricultural revenue disbursements, escrow clearance, and Stripe Connect transfers.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>API Integration Reserved</span>
          </div>
        </div>

        {/* Development Notice Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Producer Earnings Route Ready
            </div>
            <p className="text-xs leading-relaxed text-emerald-700">
              The backend API for farmer payout calculation and Stripe Connect transfer tracking is currently under development. The route is reserved in the navigation and will display live financial settlements once the endpoint is released.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Total Harvest Value</span>
              <Sprout className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              18,450,000 XOF
            </div>
            <div className="text-xs text-slate-500">Disbursed to certified local growers</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Escrow in Transit</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              890,000 XOF
            </div>
            <div className="text-xs text-slate-500">Pending delivery completion confirmation</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Connected Bank Accounts</span>
              <Landmark className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              96.4% Verified
            </div>
            <div className="text-xs text-slate-500">Registered with valid Stripe Connect IDs</div>
          </div>
        </div>

        {/* Empty Standby Card */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Coins className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Producer Payout Ledger Standby
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When farmer payment transfers are confirmed through Stripe Connect, individual batch payouts, commission deductions, and receipt logs will be listed here.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
