"use client";
import { useState } from "react";
import { GHANA_REGIONS, DENOMINATIONS, UMBRELLA_BODIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import RegisterSteps2 from "./RegisterSteps2";
import type { RegForm } from "./RegTypes";
const INIT: RegForm = { name: "", slug: "", denomination: "Pentecostal", umbrellaBody: "Independent", regNo: "", email: "", phone: "", website: "", region: "Greater Accra", city: "", gps: "", address: "", mission: "", leader: "", focus: [], facebook: "", instagram: "", twitter: "", youtube: "", logoKey: "", bannerKey: "", legalKey: "", accept: false, signer: "", title: "" };
const STEPS = ["Org", "Location", "Assets", "Faith"];
const normUrl = (v: string) => { const t = v.trim(); if (!t) return ""; return /^https?:\/\//i.test(t) ? t : `https://${t}`; };
export default function RegisterForm({ onDone }: { onDone: (s: string) => void }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState(INIT);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof RegForm, v: string) => setF((p) => ({ ...p, [k]: v }));
  async function submit() {
    setBusy(true); setErr(null);
    try {
      if (!f.logoKey) throw new Error("Logo is required — please upload your ministry logo.");
      const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, slug: f.slug || slugify(f.name), denomination: f.denomination, umbrellaBody: f.umbrellaBody, registrationNumber: f.regNo || null, email: f.email, phonePrimary: f.phone, website: normUrl(f.website) || null, region: f.region, cityTown: f.city, digitalAddress: f.gps || null, physicalAddress: f.address, logoR2Key: f.logoKey, bannerR2Key: f.bannerKey || null, legalDocR2Key: f.legalKey || null, missionStatement: f.mission || null, leaderName: f.leader || null, ministryFocus: f.focus, socialLinks: Object.fromEntries(Object.entries({ facebook: f.facebook, instagram: f.instagram, twitter: f.twitter, youtube: f.youtube }).map(([k, v]) => [k, normUrl(v)]).filter(([, v]) => v !== "")), statementOfFaithAccepted: f.accept, signedByLeaderName: f.signer, signedByLeaderTitle: f.title }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      onDone(d.organization.slug);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setBusy(false); }
  }
  return (
    <div className="gm-card mt-6 p-6">
      <ol className="flex gap-2">{STEPS.map((s, i) => <li key={s} className={`flex-1 rounded-lg px-2 py-2 text-center text-xs font-bold ${i === step ? "bg-navy-950 text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}. {s}</li>)}</ol>
      {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      {step === 0 && <div className="mt-5 grid gap-4">
        <div><label className="gm-label">Name *</label><input className="gm-input" value={f.name} onChange={(e) => { set("name", e.target.value); set("slug", slugify(e.target.value)); }} /></div>
        <div><label className="gm-label">Slug *</label><input className="gm-input font-mono" value={f.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="gm-label">Denomination</label><select className="gm-input" value={f.denomination} onChange={(e) => set("denomination", e.target.value)}>{DENOMINATIONS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="gm-label">Umbrella</label><select className="gm-input" value={f.umbrellaBody} onChange={(e) => set("umbrellaBody", e.target.value)}>{UMBRELLA_BODIES.map((u) => <option key={u}>{u}</option>)}</select></div>
        </div>
        <div><label className="gm-label">RGD number</label><input className="gm-input" value={f.regNo} onChange={(e) => set("regNo", e.target.value)} /></div>
      </div>}
      {step === 1 && <div className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="gm-label">Email *</label><input className="gm-input" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className="gm-label">Phone *</label><input className="gm-input" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="gm-label">Region</label><select className="gm-input" value={f.region} onChange={(e) => set("region", e.target.value)}>{GHANA_REGIONS.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div><label className="gm-label">City *</label><input className="gm-input" value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
        </div>
        <div><label className="gm-label">GhanaPost GPS</label><input className="gm-input font-mono" value={f.gps} onChange={(e) => set("gps", e.target.value.toUpperCase())} placeholder="GA-123-4567" /></div>
        <div><label className="gm-label">Address *</label><textarea className="gm-input" rows={3} value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
      </div>}
      {step >= 2 && <RegisterSteps2 f={f} setF={setF} busy={busy} setBusy={setBusy} setErr={setErr} step={step} />}
      <div className="mt-6 flex justify-between">
        <button disabled={step === 0 || busy} onClick={() => setStep(step - 1)} className="gm-btn-ghost">Back</button>
        {step < 3 ? <button disabled={busy || (step === 2 && !f.logoKey)} onClick={() => setStep(step + 1)} className="gm-btn-primary">Continue</button>
        : <button disabled={busy || !f.accept || !f.logoKey} onClick={submit} className="gm-btn-gold">{busy ? "Submitting" : "Submit"}</button>}
      </div>
    </div>
  );
}
