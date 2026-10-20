"use client";
import { MINISTRY_FOCUS_OPTIONS } from "@/lib/constants";
import { uploadViaPresign } from "@/lib/upload";
import type { RegForm } from "./RegTypes";

type P = {
  f: RegForm;
  setF: React.Dispatch<React.SetStateAction<RegForm>>;
  busy: boolean; setBusy: (b: boolean) => void; setErr: (s: string | null) => void;
  step: number;
};

export default function RegisterSteps2({ f, setF, setBusy, setErr, step }: P) {
  const set = (k: keyof RegForm, v: string | boolean | string[]) =>
    setF((p) => ({ ...p, [k]: v }));
  const toggle = (v: string) =>
    set("focus", f.focus.includes(v) ? f.focus.filter((x) => x !== v) : [...f.focus, v]);

  async function pick(kind: "logos" | "banners" | "legal-docs", key: "logoKey" | "bannerKey" | "legalKey", file: File | undefined) {
    if (!file) return;
    setBusy(true); setErr(null);
    try { set(key, await uploadViaPresign(file, kind)); }
    catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  }

  if (step === 2) return (
    <div className="mt-5 grid gap-4">
      <div><label className="gm-label">Mission statement</label><textarea className="gm-input" rows={3} value={f.mission} onChange={(e) => set("mission", e.target.value)} /></div>
      <div><label className="gm-label">Head / Leader name</label><input className="gm-input" value={f.leader} onChange={(e) => set("leader", e.target.value)} /></div>
      <div><span className="gm-label">Ministry focus</span><div className="flex flex-wrap gap-2">{MINISTRY_FOCUS_OPTIONS.map((m) => <button type="button" key={m} onClick={() => toggle(m)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${f.focus.includes(m) ? "bg-gema-700 text-white" : "bg-slate-100 text-slate-600"}`}>{m}</button>)}</div></div>
      <div className="grid gap-3 rounded-xl border border-slate-200 p-4">
        <span className="gm-label">Website & social media <span className="font-normal normal-case text-slate-500">(optional)</span></span>
        <input className="gm-input" placeholder="Website — https://example.com" value={f.website} onChange={(e) => set("website", e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="gm-input" placeholder="Facebook page URL" value={f.facebook} onChange={(e) => set("facebook", e.target.value)} />
          <input className="gm-input" placeholder="Instagram URL" value={f.instagram} onChange={(e) => set("instagram", e.target.value)} />
          <input className="gm-input" placeholder="X (Twitter) URL" value={f.twitter} onChange={(e) => set("twitter", e.target.value)} />
          <input className="gm-input" placeholder="YouTube channel URL" value={f.youtube} onChange={(e) => set("youtube", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={`cursor-pointer rounded-xl border border-dashed p-4 text-center text-sm hover:bg-slate-50 ${!f.logoKey ? "border-red-300" : ""}`}>Logo *<br /><span className={`text-xs ${f.logoKey ? "text-slate-500" : "font-semibold text-red-600"}`}>{f.logoKey ? "Uploaded" : "Required — click to upload"}</span><input type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => pick("logos", "logoKey", e.target.files?.[0])} /></label>
        <label className="cursor-pointer rounded-xl border border-dashed p-4 text-center text-sm hover:bg-slate-50">Banner<br /><span className="text-xs text-slate-500">{f.bannerKey ? "Uploaded" : "Click to upload"}</span><input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={(e) => pick("banners", "bannerKey", e.target.files?.[0])} /></label>
        <label className="cursor-pointer rounded-xl border border-dashed p-4 text-center text-sm hover:bg-slate-50">Legal cert<br /><span className="text-xs text-slate-500">{f.legalKey ? "Uploaded" : "PDF / image"}</span><input type="file" className="hidden" accept=".pdf,image/png,image/jpeg" onChange={(e) => pick("legal-docs", "legalKey", e.target.files?.[0])} /></label>
      </div>
    </div>
  );

  return (
    <div className="mt-5 grid gap-4">
      <div className="rounded-xl bg-ochre-50 p-4 text-sm leading-relaxed text-slate-700">We affirm Scripture&apos;s authority, the Trinity, salvation by grace through faith in Christ, and the Great Commission mandate.</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="gm-label">Signatory name *</label><input className="gm-input" value={f.signer} onChange={(e) => set("signer", e.target.value)} /></div>
        <div><label className="gm-label">Signatory title *</label><input className="gm-input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="General Overseer" /></div>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm">
        <input type="checkbox" checked={f.accept} onChange={(e) => set("accept", e.target.checked)} className="mt-1 h-4 w-4" />
        <span>I affirm the statement of faith. Timestamp + signatory will be recorded.</span>
      </label>
    </div>
  );
}
