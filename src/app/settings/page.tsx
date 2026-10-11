"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Settings,
  Bell,
  Save,
  Loader2,
  KeyRound,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications">("general");

  // General settings state
  const [platformName, setPlatformName] = useState("AgroConnect Côte d'Ivoire");
  const [baseDeliveryFee, setBaseDeliveryFee] = useState("5000");
  const [hubCity, setHubCity] = useState("Yamoussoukro");
  const [currency, setCurrency] = useState("XOF");

  // Security password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      const res = await changePassword({ oldPassword, newPassword }).unwrap();
      toast.success(res.message || "Admin password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update password.";
      setPasswordError(msg);
      toast.error(msg);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform logistics settings saved successfully.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 mb-1">
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              Administrative Controls
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Platform Settings
            </h1>
            <p className="text-xs text-slate-500">
              System logistics fees, regional hub configurations, and admin security settings.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "general"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Platform Logistics</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "security"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "notifications"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts & Notifications</span>
          </button>
        </div>

        {/* Tab 1: General Platform Logistics */}
        {activeTab === "general" && (
          <form onSubmit={handleSaveGeneral} className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Platform Logistics Configuration</h2>
              <p className="text-xs text-slate-500">
                Default transport parameters applied to new order calculation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Platform Title</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Operating Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="XOF">XOF - West African CFA Franc (CFA)</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Standard Delivery Surcharge (XOF)
                </label>
                <input
                  type="number"
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
                <span className="text-[11px] text-slate-400">Default baseline fee per route.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Central Agricultural Intake Hub
                </label>
                <select
                  value={hubCity}
                  onChange={(e) => setHubCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Yamoussoukro">Yamoussoukro Central Agricultural Terminal</option>
                  <option value="Abidjan">Abidjan Autonomous Distribution Terminal</option>
                  <option value="San-Pédro">San-Pédro Maritime Agro-Hub</option>
                  <option value="Bouaké">Bouaké Valley Depot</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Logistics Config</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6 text-xs max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Change Admin Password</h2>
              <p className="text-xs text-slate-500">
                Update your administrative account password across all sessions.
              </p>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {isChangingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Alerts & Notifications */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Admin Notification Preferences</h2>
              <p className="text-xs text-slate-500">
                Configure administrative broadcast and dispatch notifications.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">New Producer Registration Alerts</div>
                  <div className="text-slate-500 text-[11px]">
                    Receive instant notification when a producer uploads farm documents.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">Driver License Clearance Alerts</div>
                  <div className="text-slate-500 text-[11px]">
                    Notify admin whenever a new vehicle driver registers for the fleet.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">Quality Incident Notifications</div>
                  <div className="text-slate-500 text-[11px]">
                    Immediate escalation when a buyer files a damaged harvest dispute.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
