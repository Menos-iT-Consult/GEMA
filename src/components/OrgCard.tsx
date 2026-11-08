"use client";
import Link from "next/link";
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
    <Link
      href={`/organization/${org.slug}`}
      className={cn(
        "group block rounded-xl overflow-hidden border border-slate-200 transition-colors hover:border-ochre-300 hover:bg-navy-50 cursor-pointer",
        layout === "grid" && "group-hover:shadow-xl group-hover:scale-105"
      )}
    >
      {layout === "grid" ? (
        <>
          {verified && (
            <span className="absolute left-2 top-2 bg-ochre-400 text-navy-950 rounded-sm text-xs font-semibold px-2 py-0.5">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
          <div className="relative h-48 bg-navy-50 flex items-center justify-center">
            {logo ? (
              <img
                src={logo}
                alt={org.name}
                className="h-24 w-24 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="h-24 w-24 rounded-lg bg-navy-50 flex items-center justify-center text-slate-400 text-2xl font-bold">
                {org.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-serif font-medium text-navy-950 line-clamp-2 line-clamp-collapsed">{org.name}</h3>
            {org.region && (
              <p className="mt-2 text-sm text-slate-500">
                <MapPin className="h-3 w-3 mr-1" /> {org.region}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="p-4">
            {logo ? (
              <img
                src={logo}
                alt={org.name}
                className="h-16 w-16 rounded-lg mx-auto mb-3 object-cover"
              />
            ) : (
              <span className="h-16 w-16 rounded-lg bg-navy-50 mx-auto mb-3 text-slate-400 text-2xl font-bold">
                {org.name.charAt(0)}
              </span>
            )}
            <h3 className="font-serif font-medium text-navy-950 line-clamp-2">{org.name}</h3>
            {org.region && (
              <p className="mt-2 text-sm text-slate-500">
                <MapPin className="mr-1 h-3 w-3" /> {org.region}
              </p>
            )}
            {verified && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-sm px-2 py-0.5 bg-ochre-400 text-navy-950 text-xs font-semibold">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
        </>
      )}
    </Link>
  );
}