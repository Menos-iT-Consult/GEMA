"use client";
import { useEffect, useState } from "react";
import type { Organization } from "@/lib/db/schema";
type Data = { stats: { total: number; approved: number; pending: number; suspended: number; duesCollected: number }; byRegion: { region: string; count: number }[]; byDenomination: { denomination: string; count: number }[]; pendingQueue: Organization[] };
export default function AdminDash() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = async () => {
    try { const r = await fetch("/api/admin"); if (!r.ok) throw new Error("Login required"); setD(await r.json()); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
  };
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string) {
    await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  }
  if (err) return <div className="gm-card p-8">Error: {err} <a href="/admin/login" className="underline text-royal-600">Login</a></div>;
  if (!d) return <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="gm-card h-28 animate-pulse" />)}</div>;
  const cards: [string, number][] = [["Total", d.stats.total], ["Approved", d.stats.approved], ["Pending", d.stats.pending], ["Dues Paid", d.stats.duesCollected]];
  const csv = () => {
    const rows = [["name", "slug", "region", "status", "email"], ...d.pendingQueue.map((o) => [o.name, o.slug, o.region, o.status, o.email])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "pending.csv"; a.click();
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">{cards.map(([l, v]) => <div key={l} className="gm-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{l}</p><p className="mt-1 font-serif text-3xl font-bold text-navy-950">{v}</p></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="gm-card p-5"><h3 className="font-bold text-navy-950">By Region</h3>{d.byRegion.map((r) => <div key={r.region} className="mt-2 flex justify-between text-sm"><span>{r.region}</span><b>{r.count}</b></div>)}</div>
        <div className="gm-card p-5"><h3 className="font-bold text-navy-950">By Denomination</h3>{d.byDenomination.map((r) => <div key={r.denomination} className="mt-2 flex justify-between text-sm"><span>{r.denomination}</span><b>{r.count}</b></div>)}</div>
      </div>
      <div className="gm-card p-5">
        <div className="flex items-center justify-between"><h3 className="font-bold text-navy-950">Approvals ({d.pendingQueue.length})</h3><button onClick={csv} className="gm-btn-ghost text-xs">CSV</button></div>
        <div className="mt-4 space-y-3">{d.pendingQueue.length === 0 && <p className="text-sm text-slate-500">Queue clear.</p>}{d.pendingQueue.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
            <div><p className="font-bold">{o.name}</p><p className="text-xs text-slate-600">{o.cityTown}, {o.region} - {o.email}</p></div>
            <div className="flex gap-2">
              <button onClick={() => setStatus(o.id, "UNDER_VETTING")} className="gm-btn-ghost text-xs">Vet</button>
              <button onClick={() => setStatus(o.id, "APPROVED")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve</button>
              <button onClick={() => setStatus(o.id, "SUSPENDED")} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">Reject</button>
            </div>
          </div>))}</div>
      </div>
    </div>
  );
}

