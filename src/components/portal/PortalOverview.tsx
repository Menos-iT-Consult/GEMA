"use client";
import { Mail, MapPin, Phone, Users } from "lucide-react";
import type { PortalData } from "@/lib/portal-types";

type Props = {
  data: PortalData;
  onNavigate: (tab: "Overview" | "Profile" | "Members") => void;
};

export default function PortalOverview({ data, onNavigate }: Props) {
  const org = data.organization;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Members</p>
          <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{data.members.length}</p>
        </div>
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active</p>
          <p className="mt-1 font-serif text-3xl font-bold text-emerald-700">
            {data.members.filter((m) => m.isActive === 1).length}
          </p>
        </div>
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</p>
          <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{org.status}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="gm-card p-5 lg:col-span-2">
          <h3 className="font-bold text-navy-950">Organization Summary</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {org.missionStatement || "No mission statement has been added yet."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="gm-card p-5">
            <h3 className="font-bold text-navy-950">Contact Details</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <dd className="break-all text-slate-700">{org.email}</dd>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <dd className="text-slate-700">
                  {org.phonePrimary}
                  {org.phoneSecondary ? ` / ${org.phoneSecondary}` : ""}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <dd className="text-slate-700">
                  {org.cityTown}, {org.region}
                  {org.digitalAddress ? ` (${org.digitalAddress})` : ""}
                </dd>
              </div>
            </dl>
            <button
              onClick={() => onNavigate("Profile")}
              className="gm-btn-ghost mt-4 !py-2 text-xs"
            >
              Update profile
            </button>
          </div>

          <div className="gm-card p-5">
            <h3 className="font-bold text-navy-950">Membership</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-50 text-royal-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="font-serif text-2xl font-bold text-navy-950">
                  {data.members.length}
                </p>
                <p className="text-xs text-slate-600">
                  {data.members.filter((m) => m.isActive === 1).length} active
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("Members")}
              className="gm-btn-ghost mt-4 !py-2 text-xs"
            >
              Manage members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
