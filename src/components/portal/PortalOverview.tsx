"use client";
import {
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  Users,
  Wallet,
  AlertTriangle
} from "lucide-react";
import type { PortalData } from "@/lib/portal-types";
import { ghs, fmtDate, DUES_BADGE } from "@/lib/portal-types";

type Props = {
  data: PortalData;
  onNavigate: (tab: "Overview" | "Profile" | "Dues" | "Members") => void;
};

export default function PortalOverview({ data, onNavigate }: Props) {
  const org = data.organization;
  const t = data.duesTotals;
  const currentYear = new Date().getFullYear();

  const stats: [string, string | number][] = [
    ["Members", data.members.length],
    ["Dues Paid", t.paid],
    ["Dues Pending", t.pending],
    ["Dues Overdue", t.overdue]
  ];

  const latest = data.dues.slice(0, 6);
  const currentYearRecord = data.dues.find((r) => r.year === currentYear);
  const outstanding = t.pending + t.overdue;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="gm-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{l}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{v}</p>
          </div>
        ))}
      </div>
      {outstanding > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">
                {outstanding} outstanding dues {outstanding === 1 ? "record" : "records"}
              </p>
              <p className="text-sm text-amber-800">
                {currentYearRecord
                  ? `Your ${currentYear} assessment of ${ghs(currentYearRecord.amountGhs)} is currently ${
                      currentYearRecord.status === "OVERDUE" ? "overdue" : "pending"
                    }.`
                  : `No ${currentYear} assessment has been issued yet.`}
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate("Dues")} className="gm-btn-gold !py-2 text-xs">
            View dues
          </button>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="gm-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Recent Dues Records</h3>
            <button
              onClick={() => onNavigate("Dues")}
              className="text-xs font-semibold text-royal-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {latest.length === 0 && (
              <p className="text-sm text-slate-500">No dues records yet.</p>
            )}
            {latest.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-navy-950">{r.year} assessment</p>
                  <p className="text-xs text-slate-600">
                    {ghs(r.amountGhs)} • {fmtDate(r.paidAt ?? r.createdAt)}
                    {r.paymentReference ? ` • Ref ${r.paymentReference}` : ""}
                  </p>
                </div>
                <span
                  className={`gm-badge ${DUES_BADGE[r.status] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
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
      <div className="gm-card p-5">
        <h3 className="flex items-center gap-2 font-bold text-navy-950">
          <Wallet className="h-4 w-4 text-gema-600" /> Dues Summary
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Total Paid
            </p>
            <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
              {ghs(t.amountPaid)}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending</p>
            <p className="mt-1 font-serif text-2xl font-bold text-amber-700">{t.pending}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Overdue</p>
            <p className="mt-1 font-serif text-2xl font-bold text-red-700">{t.overdue}</p>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <CalendarClock className="h-3.5 w-3.5" />
          Dues are assessed annually by the Secretariat. Contact the Secretariat to confirm a
          payment or request a receipt.
        </p>
      </div>
    </div>
  );
}
