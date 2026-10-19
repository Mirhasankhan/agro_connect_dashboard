"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  User,
  KeyRound,
  Bell,
  Camera,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Upload,
} from "lucide-react";
import {
  useChangePasswordMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // Fetch admin profile
  const {
    data: profileResponse,
    refetch: refetchProfile,
  } = useProfileQuery();

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const serverProfile = profileResponse?.data || user;

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sync profile data from server or Redux store
  useEffect(() => {
    if (serverProfile) {
      setFullName(serverProfile.fullName || "");
      setPhoneNumber(serverProfile.phoneNumber || "");
    }
  }, [serverProfile]);

  // Sync server profile to Redux when query resolves
  useEffect(() => {
    if (profileResponse?.data) {
      dispatch(updateProfileData(profileResponse.data));
    }
  }, [profileResponse, dispatch]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle local image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setProfileError("");
  };

  const handleRemoveSelectedPhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetProfileForm = () => {
    handleRemoveSelectedPhoto();
    setFullName(serverProfile?.fullName || "");
    setPhoneNumber(serverProfile?.phoneNumber || "");
    setProfileError("");
  };

  // Submit profile details
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      const msg = "Full name cannot be empty.";
      setProfileError(msg);
      toast.error(msg);
      return;
    }

    const formData = new FormData();
    formData.append("fullName", trimmedName);
    formData.append("phoneNumber", phoneNumber.trim());

    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    }

    try {
      const res = await updateProfile(formData).unwrap();
      const updatedUser = res?.data;

      // Update Redux state immediately
      dispatch(
        updateProfileData({
          fullName: trimmedName,
          phoneNumber: phoneNumber.trim(),
          ...(updatedUser?.profileImage
            ? { profileImage: updatedUser.profileImage }
            : {}),
        }),
      );

      toast.success(res?.message || "Admin profile updated successfully!");

      // Cleanup preview state
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      refetchProfile();
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to update admin profile.";
      setProfileError(msg);
      toast.error(msg);
    }
  };

  // Password submission
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
      const msg =
        err?.data?.message || err?.message || "Failed to update password.";
      setPasswordError(msg);
      toast.error(msg);
    }
  };

  const activeAvatarSrc =
    previewUrl ||
    serverProfile?.profileImage ||
    user?.profileImage;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>            
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Platform Settings
            </h1>
            <p className="text-xs text-slate-500">
              Manage your administrator identity, credentials, and notification preferences.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Admin Profile</span>
          </button>

          <button
            type="button"
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
            type="button"
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

        {/* Tab 1: Admin Profile */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleProfileSubmit}
            className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8 text-xs max-w-2xl"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Admin Profile Details</h2>              
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Update your administrative account avatar, display full name, and contact phone number.
              </p>
            </div>

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Profile Avatar Upload Section */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-900 ring-4 ring-emerald-500/20 shadow-md flex items-center justify-center">
                  {activeAvatarSrc ? (
                    <Image
                      src={activeAvatarSrc}
                      alt={fullName || "Admin Profile"}
                      width={96}
                      height={96}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-400">
                      {(fullName || user?.fullName || "A").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Camera quick-action overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all ring-2 ring-white"
                  title="Upload new profile image"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Upload metadata and buttons */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Administrator Avatar</h3>                 
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-semibold text-xs shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo</span>
                  </button>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveSelectedPhoto}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Discard Selection</span>
                    </button>
                  )}
                </div>

                {selectedFile && (
                  <div className="text-[11px] text-emerald-700 flex items-center justify-center sm:justify-start gap-1 font-medium pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>New photo chosen: &quot;{selectedFile.name}&quot; (Save to apply)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields: Full Name, Phone Number, Email */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-slate-400"
                  />
                </div>               
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    readOnly
                    value={serverProfile?.email || user?.email || ""}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed select-none"
                  />
                </div>               
              </div>
           
            </div>

            {/* Actions: Save & Reset */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetProfileForm}
                disabled={isUpdatingProfile}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6 text-xs max-w-xl"
          >
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
