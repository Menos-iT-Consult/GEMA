"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Organization } from "@/lib/db/schema";

export default function OrganizationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/organizations?slug=${encodeURIComponent(slug)}&pageSize=1`);
        if (!response.ok) throw new Error(`Organization request failed (${response.status})`);
        const data = await response.json();
        if (active) setOrg(data.items?.[0] ?? null);
      } catch (e) {
        console.error("Error loading organization:", e);
        if (active) setOrg(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gema-50 text-navy-950 p-8">
        <p className="text-slate-600">Loading organization…</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-gema-50 text-navy-950 p-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-navy-950 mb-4">Organization</h1>
          <p className="text-slate-600">Organization not found</p>
          <Link href="/directory" className="bg-ochre-600 text-white px-4 py-2 rounded mt-4">Back to Directory</Link>
        </div>
      </div>
    );
  }

  const logoUrl = org.logoR2Key
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${org.logoR2Key}`
    : null;
  const socialLinks = org.socialLinks ?? {};

  return (
    <div className="min-h-screen bg-gema-50 text-navy-950">
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl mb-8">
          {logoUrl && (
            <div className="relative h-64 bg-gema-50 overflow-hidden mb-6">
              <img
                src={logoUrl}
                alt={org.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          <div>
            <h1 className="text-4xl font-serif font-bold text-navy-950 mb-1">{org.name}</h1>
            <p className="text-slate-600 mb-4">{org.missionStatement || "No mission statement added."}</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Region</p>
                <p className="text-lg text-navy-950">{org.region}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Denomination</p>
                <p className="text-lg text-navy-950">{org.denomination}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Status</p>
                <span className={`gm-badge ${org.status === "APPROVED" ? "bg-gema-100 text-gema-700" : "bg-royal-100 text-royal-700"}`}>
                  {org.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Email</p>
                <p className="text-navy-950">{org.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Phone</p>
                <p className="text-navy-950">{org.phonePrimary}{org.phoneSecondary ? ` / ${org.phoneSecondary}` : ""}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Location</p>
                <p className="text-navy-950">{org.cityTown}</p>
              </div>
            </div>

            {org.ministryFocus && org.ministryFocus.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Ministry Focus</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {org.ministryFocus.map((focus) => (
                    <span
                      key={focus}
                      className="rounded-full px-3 py-1.5 text-xs font-bold bg-gema-100 text-gema-700"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(socialLinks).length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-600">Social Links</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["facebook", "instagram", "twitter", "youtube"] as const).map((key) => {
                    const url = socialLinks[key];
                    if (url) {
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-gema-50"
                        >
                          {/* SVG icons would go here */}
                          <span>{key.replace(/\(/g, "").replace(/\)/g, "")}</span>
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="gm-card p-6">
            <h3 className="text-xl font-bold text-navy-950 mb-4">Ministry Overview</h3>
            <p className="text-slate-600 mb-4">
              {org.registrationNumber ? `Registration: ${org.registrationNumber}` : "No registration number on file"}
            </p>
            <p className="text-slate-600 mb-4">
              {org.umbrellaBody} • {org.umbrellaBody === "Independent" ? "Standalone ministry" : "Part of " + org.umbrellaBody}
            </p>
            <p className="text-slate-600 mb-4">
              <strong>Founded:</strong> {org.createdAt ? new Date(org.createdAt).toLocaleDateString("en-GB", { year: "numeric" }) : "Unknown"}
            </p>
          </div>

          <div className="gm-card p-6 mt-6">
            <h3 className="text-xl font-bold text-navy-950 mb-4">Connect</h3>
            <div className="space-y-3 text-slate-600">
              <a
                href={`mailto:${org.email}`}
                className="flex items-center gap-2 hover:text-gema-600 transition"
              >
                <span className="text-lg">Email</span>
              </a>
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gema-600 transition"
                >
                  <span className="text-lg">Website</span>
                </a>
              )}
              {org.phonePrimary && (
                <a
                  href={`tel:${org.phonePrimary}`}
                  className="flex items-center gap-2 hover:text-gema-600 transition"
                >
                  <span className="text-lg">Call</span>
                </a>
              )}
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}