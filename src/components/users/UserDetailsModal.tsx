"use client";

import React from "react";
import {
  X,
  ExternalLink,
  FileText,
  Truck,
  Sprout,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { DEFAULT_PROFILE_IMAGE } from "@/constants";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  user: any;
  userType: "producer" | "driver" | "buyer";
  onApproveAction?: () => void;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  userType,
  onApproveAction,
}: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const profile =
    userType === "producer"
      ? user.producerProfile
      : userType === "driver"
        ? user.driverProfile
        : null;

  const verificationStatus = profile?.verificationStatus || "Pending";

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const renderDocumentLink = (label: string, url?: string | null) => {
    if (!url) {
      return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-400">
          <span>{label}</span>
          <span className="italic text-[11px]">Not provided</span>
        </div>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-xs text-slate-700 hover:text-emerald-800 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
          <span>View File</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage || DEFAULT_PROFILE_IMAGE}
              alt={user.fullName || "User"}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.fullName}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile && renderStatusBadge(verificationStatus)}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* General Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                Full Name
              </span>
              <span className="font-semibold text-slate-900">{user.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                Email
              </span>
              <span className="font-medium text-slate-800 truncate block">{user.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                Phone
              </span>
              <span className="font-medium text-slate-800">{user.phoneNumber || "Not listed"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                City / Region
              </span>
              <span className="font-medium text-slate-800">
                {user.city ? `${user.city}, ${user.region || ""}` : "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                Address
              </span>
              <span className="font-medium text-slate-800 truncate block">{user.address || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold  tracking-wider text-slate-400 block mb-0.5">
                Account ID
              </span>
              <span className="font-mono text-slate-500 text-[11px] truncate block">{user.id}</span>
            </div>
          </div>

          {/* Rejection Reason Notice if any */}
          {profile?.rejectionReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <span className="font-bold text-[11px]  tracking-wide block">
                Previous Rejection Reason
              </span>
              <p>{profile.rejectionReason}</p>
            </div>
          )}

          {/* Producer-Specific Details */}
          {userType === "producer" && profile && (
            <div className="space-y-4">
              <div className="text-xs font-bold  tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Agricultural Farm Information</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Farm Name</span>
                  <span className="font-semibold text-slate-900">{profile.farmName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Producer Type</span>
                  <span className="font-semibold text-slate-900">{profile.producerType || "Private"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Farm Size</span>
                  <span className="font-semibold text-slate-900">{profile.farmSize ? `${profile.farmSize} Hectares` : "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Farm Location</span>
                  <span className="font-semibold text-slate-900">{profile.farmLocation || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Company Name</span>
                  <span className="font-semibold text-slate-900">{profile.companyName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">RCCM / SIREN</span>
                  <span className="font-semibold text-slate-900">{profile.rccmNo || profile.sirenNo || "N/A"}</span>
                </div>
              </div>

              {/* Uploaded Verification Certificates */}
              <div className="space-y-2">
                <span className="text-xs font-bold  tracking-wider text-slate-500 block">
                  Uploaded Certificates & Verification Documents
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {renderDocumentLink("National Identity Card (NID)", profile.nidUrl)}
                  {renderDocumentLink("Land Title / Certificate", profile.landCertificate)}
                  {renderDocumentLink("Company Certificate", profile.companyCertificate)}
                  {renderDocumentLink("Tax Clearance Document", profile.taxUrl)}
                  {renderDocumentLink("Farm Field Photo", profile.farmPhotoUrl)}
                </div>
              </div>
            </div>
          )}

          {/* Driver-Specific Details */}
          {userType === "driver" && profile && (
            <div className="space-y-4">
              <div className="text-xs font-bold  tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Vehicle & Logistics Credentials</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-sky-50/50 border border-sky-100">
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Vehicle Type</span>
                  <span className="font-bold text-sky-900">{profile.vehicleType || "Fleet"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Registration Number</span>
                  <span className="font-bold font-mono text-slate-900">{profile.registrationNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold  text-slate-400 block">Dispatch Availability</span>
                  <span className={`font-semibold ${profile.isAvailable ? "text-emerald-600" : "text-slate-500"}`}>
                    {profile.isAvailable ? "Available for Dispatch" : "Offline / On Route"}
                  </span>
                </div>
              </div>

              {/* Driver Licenses & Credentials */}
              <div className="space-y-2">
                <span className="text-xs font-bold  tracking-wider text-slate-500 block">
                  Driver Licenses & Clearance Documents
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {renderDocumentLink("National Identity (NID)", profile.nidUrl)}
                  {renderDocumentLink("Driving License Scan", profile.drivingLicenseUrl)}
                  {renderDocumentLink("Vehicle Registration Certificate", profile.vehicleRegistrationUrl)}
                  {renderDocumentLink("Insurance Policy", profile.insuranceUrl)}
                  {renderDocumentLink("Police Clearance Certificate", profile.policeClearanceUrl)}
                </div>
              </div>
            </div>
          )}

          {/* Buyer Details */}
          {userType === "buyer" && (
            <div className="space-y-3">
              <span className="text-xs font-bold  tracking-wider text-slate-500 block">
                Buyer Purchasing Activity
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900">{user._count?.orders ?? 0} Orders</div>
                  <div className="text-slate-500 text-[11px]">Lifetime transactions through platform</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Active Buyer
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close Window
          </button>

          {onApproveAction && verificationStatus === "Pending" && (
            <button
              onClick={() => {
                onClose();
                onApproveAction();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              Verify / Decision
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
