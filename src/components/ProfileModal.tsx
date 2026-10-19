"use client";
import { X, BadgeCheck, MapPin, Globe, Phone, Mail, ExternalLink } from "lucide-react";
import type { Organization } from "@/lib/db/schema";

export default function ProfileModal({
  org,
  onClose
}: {
  org: Organization | null;
  onClose: () => void;
}) {
  if (!org) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  const logo = org.logoR2Key && base ? `${base}/${org.logoR2Key}` : null;
  const legal = org.legalDocR2Key && base ? `${base}/${org.legalDocR2Key}` : null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-navy-950 to-royal-600 p-6 text-white sm:p-8">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white font-serif text-3xl font-bold text-navy-950">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={org.name} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                org.name.charAt(0)
              )}
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
                {org.name}
                {org.status === "APPROVED" && <BadgeCheck className="h-6 w-6 text-emerald-300" />}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-200">
                <MapPin className="h-4 w-4" /> {org.cityTown}, {org.region}
                {org.digitalAddress ? ` • GhanaPost GPS: ${org.digitalAddress}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/15 px-3 py-1">{org.denomination}</span>
                <span className="rounded-full bg-ochre-400 px-3 py-1 text-navy-950">{org.umbrellaBody}</span>
                <span className="rounded-full bg-white/15 px-3 py-1">{org.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
          <div className="space-y-3 sm:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{org.missionStatement || "—"}</p>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Ministry Focus</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(org.ministryFocus ?? []).map((f) => (
                <span key={f} className="gm-badge bg-ochre-50 text-ochre-600">{f}</span>
              ))}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Statement of Faith</h3>
            <p className="mt-2 text-sm text-slate-700">
              {org.statementOfFaithSignedAt
                ? `Affirmed by ${org.signedByLeaderName} (${org.signedByLeaderTitle}) on ${new Date(org.statementOfFaithSignedAt).toLocaleDateString("en-GH")}`
                : "Not yet affirmed"}
            </p>
            {legal && (
              <a href={legal} target="_blank" className="gm-btn-ghost mt-3 text-xs">
                View Legal Certificate <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="space-y-3 text-sm sm:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Leadership & Contact</h3>
            <p><span className="font-semibold">Leader:</span> {org.leaderName || org.signedByLeaderName || "—"}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {org.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {org.phonePrimary}{org.phoneSecondary ? ` / ${org.phoneSecondary}` : ""}</p>
            {org.website && (
              <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" /><a className="text-royal-600 underline" href={org.website} target="_blank">{org.website}</a></p>
            )}
            <p className="text-slate-600">{org.physicalAddress}</p>
            {org.registrationNumber && <p><span className="font-semibold">RGD No:</span> {org.registrationNumber}</p>}
            {org.socialLinks && Object.keys(org.socialLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(org.socialLinks as Record<string, string>).map(([k, v]) =>
                  v ? (
                    <a key={k} href={v} target="_blank" className="gm-btn-ghost !px-3 !py-1.5 text-xs capitalize">{k}</a>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
