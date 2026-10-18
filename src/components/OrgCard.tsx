"use client";
import { BadgeCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Organization } from "@/lib/db/schema";

function logoUrl(org: Organization): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  if (org.logoR2Key && base) return `${base}/${org.logoR2Key}`;
  return null;
}

export default function OrgCard({
  org,
  layout = "grid",
  onSelect
}: {
  org: Organization;
  layout?: "grid" | "list";
  onSelect?: (o: Organization) => void;
}) {
  const logo = logoUrl(org);
  const verified = org.status === "APPROVED";
  return (
    <button
      onClick={() => onSelect?.(org)}
      className={cn(
        "gm-card overflow-hidden text-left",
        layout === "list" && "flex gap-4 p-4"
      )}
    >
      {layout === "grid" ? (
        <>
          <div className="relative h-36 bg-gradient-to-br from-navy-950 via-navy-800 to-royal-600">
            <div className="absolute inset-0 flex items-center justify-center">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={org.name} className="h-20 w-20 rounded-2xl bg-white object-cover p-1" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/95 font-serif text-3xl font-bold text-navy-950">
                  {org.name.charAt(0)}
                </span>
              )}
            </div>
            {verified && (
              <span className="gm-badge absolute left-3 top-3 bg-emerald-600 text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            <span className="gm-badge absolute right-3 top-3 bg-ochre-100 text-ochre-600">
              {org.region}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-serif text-lg font-bold leading-snug text-navy-950">{org.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5" /> {org.cityTown}
              {org.digitalAddress ? ` • ${org.digitalAddress}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="gm-badge bg-royal-50 text-royal-600">{org.denomination}</span>
              <span className="gm-badge bg-slate-100 text-slate-700">{org.umbrellaBody}</span>
              {(org.ministryFocus ?? []).slice(0, 3).map((f) => (
                <span key={f} className="gm-badge bg-ochre-50 text-ochre-600">{f}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy-950 font-serif text-2xl font-bold text-ochre-300">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={org.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              org.name.charAt(0)
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-serif text-lg font-bold text-navy-950">
              {org.name}
              {verified && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
            </span>
            <span className="mt-0.5 block truncate text-sm text-slate-600">
              {org.cityTown}, {org.region} • {org.denomination} • {org.umbrellaBody}
            </span>
            <span className="mt-2 flex flex-wrap gap-1.5">
              {(org.ministryFocus ?? []).slice(0, 4).map((f) => (
                <span key={f} className="gm-badge bg-slate-100 text-slate-700">{f}</span>
              ))}
            </span>
          </span>
        </>
      )}
    </button>
  );
}
