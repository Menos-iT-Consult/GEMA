"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrgCard from "@/components/OrgCard";
import RegionHub from "@/components/RegionHub";
import {
  DENOMINATIONS,
  GHANA_REGIONS,
  MINISTRY_FOCUS_OPTIONS,
  UMBRELLA_BODIES
} from "@/lib/constants";
import type { Organization } from "@/lib/db/schema";
import { LayoutGrid, List, Search } from "lucide-react";

const NAVY = "rgb(10, 19, 55)";
const OCHRE = "rgb(244, 119, 40)";
const ROYAL = "rgb(30, 132, 115)";

export default function DirectoryPage() {
  const [items, setItems] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [denom, setDenom] = useState("");
  const [umbrella, setUmbrella] = useState("");
  const [focus, setFocus] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({ status: "APPROVED", pageSize: "48" });
    if (q) params.set("q", q);
    if (region) params.set("region", region);
    if (denom) params.set("denomination", denom);
    if (umbrella) params.set("umbrellaBody", umbrella);
    if (focus) params.set("focus", focus);
    return params.toString();
  }, [q, region, denom, umbrella, focus]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/organizations?${query}`);
        if (!response.ok) throw new Error(`Directory request failed (${response.status})`);
        const data = await response.json();
        if (active) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (requestError) {
        if (active) {
          setItems([]);
          setTotal(0);
          setError(requestError instanceof Error ? requestError.message : "Could not load ministries.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const organization of items) {
      result[organization.region] = (result[organization.region] ?? 0) + 1;
    }
    return result;
  }, [items]);

  const clear = () => {
    setQ("");
    setRegion("");
    setDenom("");
    setUmbrella("");
    setFocus("");
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-{ROYAL}">
              Discover the network
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-{NAVY}">
              Missions Directory
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Searching…" : `${total} verified ministries`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/register" className="bg-{OCHRE} text-{NAVY} px-4 py-2 rounded-lg font-medium transition hover:bg-{OCHRE}500">
              Register Your Ministry
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 rounded-xl">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-6">
            <label className="relative">
              <span className="sr-only">Search ministries</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search name, leader, city…"
                className="gm-input !pl-9"
              />
            </label>
            <select aria-label="Region" value={region} onChange={(event) => setRegion(event.target.value)} className="gm-input">
              <option value="">All Regions</option>
              {GHANA_REGIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select aria-label="Denomination" value={denom} onChange={(event) => setDenom(event.target.value)} className="gm-input">
              <option value="">All Denominations</option>
              {DENOMINATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select aria-label="Umbrella body" value={umbrella} onChange={(event) => setUmbrella(event.target.value)} className="gm-input">
              <option value="">All Umbrella Bodies</option>
              {UMBRELLA_BODIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select aria-label="Ministry focus" value={focus} onChange={(event) => setFocus(event.target.value)} className="gm-input">
              <option value="">All Focus Areas</option>
              {MINISTRY_FOCUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {(q || region || denom || umbrella || focus) && (
            <button onClick={clear} className="mt-3 text-xs font-bold uppercase tracking-wider text-{ROYAL} hover:underline">
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {error ? (
              <div role="alert" className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <p className="font-serif text-xl font-bold text-{NAVY}">
                  Directory unavailable
                </p>
                <p className="mt-2 text-sm text-slate-500">{error}</p>
              </div>
            ) : loading ? (
              <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading ministries">
                {[1, 2, 3, 4].map((item) => <div key={item} className="gm-card h-48 bg-navy-50" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <p className="font-serif text-xl font-bold text-{NAVY}">
                  No ministries found
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((organization) => (
                  <OrgCard key={organization.id} org={organization} layout="grid" />
                ))}
              </div>
            )}
          </div>
          <aside>
            <RegionHub counts={counts} />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}