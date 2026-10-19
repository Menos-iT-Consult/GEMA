"use client";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrgCard from "@/components/OrgCard";
import ProfileModal from "@/components/ProfileModal";
import RegionHub from "@/components/RegionHub";
import { GHANA_REGIONS, DENOMINATIONS, UMBRELLA_BODIES, MINISTRY_FOCUS_OPTIONS } from "@/lib/constants";
import type { Organization } from "@/lib/db/schema";
import { LayoutGrid, List, Search } from "lucide-react";

export default function DirectoryPage() {
  const [items, setItems] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [denom, setDenom] = useState("");
  const [umbrella, setUmbrella] = useState("");
  const [focus, setFocus] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Organization | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams({ status: "APPROVED", pageSize: "48" });
    if (q) p.set("q", q);
    if (region) p.set("region", region);
    if (denom) p.set("denomination", denom);
    if (umbrella) p.set("umbrellaBody", umbrella);
    if (focus) p.set("focus", focus);
    return p.toString();
  }, [q, region, denom, umbrella, focus]);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/organizations?${query}`);
      const data = await res.json();
      if (!dead) { setItems(data.items ?? []); setTotal(data.total ?? 0); setLoading(false); }
    }, 300);
    return () => { dead = true; clearTimeout(t); };
  }, [query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of items) c[o.region] = (c[o.region] ?? 0) + 1;
    return c;
  }, [items]);

  const clear = () => { setQ(""); setRegion(""); setDenom(""); setUmbrella(""); setFocus(""); };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy-950">Ministry Directory</h1>
            <p className="mt-1 text-sm text-slate-600">{loading ? "Searching…" : `${total} verified`}</p>
          </div>
          <div className="flex rounded-xl border bg-white p-1">
            <button onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-navy-950 text-white" : "text-slate-500"}`} aria-label="Grid"><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-navy-950 text-white" : "text-slate-500"}`} aria-label="List"><List className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="gm-card mt-5 p-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-6">
            <label className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, leader, city…" className="gm-input !pl-9" />
            </label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="gm-input"><option value="">All Regions</option>{GHANA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
            <select value={denom} onChange={(e) => setDenom(e.target.value)} className="gm-input"><option value="">All Denominations</option>{DENOMINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            <select value={umbrella} onChange={(e) => setUmbrella(e.target.value)} className="gm-input"><option value="">All Umbrella</option>{UMBRELLA_BODIES.map((u) => <option key={u} value={u}>{u}</option>)}</select>
            <select value={focus} onChange={(e) => setFocus(e.target.value)} className="gm-input"><option value="">All Focus</option>{MINISTRY_FOCUS_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}</select>
          </div>
          {(q || region || denom || umbrella || focus) && <button onClick={clear} className="mt-3 text-xs font-bold uppercase tracking-wider text-royal-600 hover:underline">Clear filters</button>}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loading ? <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map((i) => <div key={i} className="gm-card h-56 animate-pulse bg-slate-100" />)}</div>
            : items.length === 0 ? <div className="gm-card p-10 text-center"><p className="font-serif text-xl font-bold text-navy-950">No ministries found</p></div>
            : <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "grid gap-3"}>{items.map((o) => <OrgCard key={o.id} org={o} layout={view} onSelect={setSelected} />)}</div>}
          </div>
          <aside><RegionHub counts={counts} /></aside>
        </div>
      </main>
      <ProfileModal org={selected} onClose={() => setSelected(null)} />
      <Footer />
    </>
  );
}
