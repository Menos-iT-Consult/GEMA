"use client";
import { useState } from "react";
import { Save, Lock, Upload, Loader2, Info } from "lucide-react";
import type { PortalData } from "@/lib/portal-types";
import { MINISTRY_FOCUS_OPTIONS } from "@/lib/constants";
import { uploadViaPresign } from "@/lib/upload";
import { ORG_BADGE } from "@/lib/portal-types";

type Props = {
  data: PortalData;
  onSaved: () => void;
};

export default function PortalProfile({ data, onSaved }: Props) {
  const org = data.organization;
  const canEdit = data.me.role === "ORG_ADMIN";

  const [f, setF] = useState({
    email: org.email,
    phonePrimary: org.phonePrimary,
    phoneSecondary: org.phoneSecondary ?? "",
    website: org.website ?? "",
    digitalAddress: org.digitalAddress ?? "",
    physicalAddress: org.physicalAddress,
    missionStatement: org.missionStatement ?? "",
    leaderName: org.leaderName ?? "",
    focus: (org.ministryFocus ?? []) as string[],
    facebook: org.socialLinks?.facebook ?? "",
    instagram: org.socialLinks?.instagram ?? "",
    twitter: org.socialLinks?.twitter ?? "",
    youtube: org.socialLinks?.youtube ?? "",
    logoKey: org.logoR2Key ?? "",
    bannerKey: org.bannerR2Key ?? ""
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: string | string[]) =>
    setF((p) => ({ ...p, [k]: v }) as typeof p);

  const toggleFocus = (v: string) =>
    set(
      "focus",
      f.focus.includes(v) ? f.focus.filter((x) => x !== v) : [...f.focus, v]
    );

  async function pick(kind: "logos" | "banners", key: "logoKey" | "bannerKey", file?: File) {
    if (!file) return;
    setUploading(key);
    setErr(null);
    try {
      const r2Key = await uploadViaPresign(file, kind);
      setMsg(
        `${key === "logoKey" ? "Logo" : "Banner"} uploaded — press Save to apply.`
      );
      set(key, r2Key);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) throw new Error("Enter a valid email address.");
      if (f.phonePrimary.trim().length < 7) throw new Error("Enter a valid primary phone number.");
      if (!f.physicalAddress.trim()) throw new Error("Physical address is required.");
      if (f.website.trim() && !/^https?:\/\//i.test(f.website.trim()))
        throw new Error("Website must start with http:// or https://");

      const r = await fetch("/api/portal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.email.trim(),
          phonePrimary: f.phonePrimary.trim(),
          phoneSecondary: f.phoneSecondary.trim() || null,
          website: f.website.trim() || null,
          digitalAddress: f.digitalAddress.trim() || null,
          physicalAddress: f.physicalAddress.trim(),
          missionStatement: f.missionStatement.trim() || null,
          leaderName: f.leaderName.trim() || null,
          ministryFocus: f.focus,
          logoR2Key: f.logoKey || null,
          bannerR2Key: f.bannerKey || null,
          socialLinks: {
            facebook: f.facebook.trim() || undefined,
            instagram: f.instagram.trim() || undefined,
            twitter: f.twitter.trim() || undefined,
            youtube: f.youtube.trim() || undefined
          }
        })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error ?? `Update failed (${r.status})`);
      }
      setMsg("Profile updated successfully.");
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <div className="gm-card p-5">
        <h3 className="flex items-center gap-2 font-bold text-navy-950">
          <Lock className="h-4 w-4 text-slate-400" /> Registered Identity
        </h3>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          These details are verified by the Secretariat. Contact them to request a correction.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Organisation", org.name],
            ["Registration No.", org.registrationNumber ?? "—"],
            ["Region", org.region],
            ["City / Town", org.cityTown],
            ["Denomination", org.denomination],
            ["Umbrella Body", org.umbrellaBody]
          ].map(([l, v]) => (
            <div key={l}>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{l}</dt>
              <dd className="mt-0.5 font-semibold text-navy-950">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</span>
          <span className={`gm-badge ${ORG_BADGE[org.status] ?? "bg-slate-100 text-slate-700"}`}>
            {org.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canEdit) save();
        }}
        className="gm-card p-5"
      >
        <h3 className="font-bold text-navy-950">Public Profile</h3>
        <p className="mt-1 text-xs text-slate-500">
          These details appear on your organisation&rsquo;s public directory listing.
        </p>

        {msg && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
            {msg}
          </p>
        )}
        {err && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            {err}
          </p>
        )}

        <fieldset disabled={!canEdit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="gm-label" htmlFor="email">
              Public email *
            </label>
            <input
              id="email"
              type="email"
              className="gm-input"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="phonePrimary">
              Primary phone *
            </label>
            <input
              id="phonePrimary"
              className="gm-input"
              value={f.phonePrimary}
              onChange={(e) => set("phonePrimary", e.target.value)}
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="phoneSecondary">
              Secondary phone
            </label>
            <input
              id="phoneSecondary"
              className="gm-input"
              value={f.phoneSecondary}
              onChange={(e) => set("phoneSecondary", e.target.value)}
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="website">
              Website
            </label>
            <input
              id="website"
              className="gm-input"
              placeholder="https://"
              value={f.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="digitalAddress">
              GhanaPost GPS
            </label>
            <input
              id="digitalAddress"
              className="gm-input"
              placeholder="GA-123-4567"
              value={f.digitalAddress}
              onChange={(e) => set("digitalAddress", e.target.value)}
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="leaderName">
              Leader name
            </label>
            <input
              id="leaderName"
              className="gm-input"
              value={f.leaderName}
              onChange={(e) => set("leaderName", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="gm-label" htmlFor="physicalAddress">
              Physical address *
            </label>
            <input
              id="physicalAddress"
              className="gm-input"
              value={f.physicalAddress}
              onChange={(e) => set("physicalAddress", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="gm-label" htmlFor="missionStatement">
              Mission statement
            </label>
            <textarea
              id="missionStatement"
              rows={4}
              className="gm-input"
              value={f.missionStatement}
              onChange={(e) => set("missionStatement", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <span className="gm-label">Ministry focus</span>
            <div className="flex flex-wrap gap-2">
              {MINISTRY_FOCUS_OPTIONS.map((o) => {
                const active = f.focus.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggleFocus(o)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-gema-700 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className="gm-label">Social links</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["facebook", "Facebook"],
                  ["instagram", "Instagram"],
                  ["twitter", "X (Twitter)"],
                  ["youtube", "YouTube"]
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor={k}>
                    {label}
                  </label>
                  <input
                    id={k}
                    className="gm-input !py-2"
                    placeholder="https://"
                    value={f[k]}
                    onChange={(e) => set(k, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </fieldset>
        <div className="mt-5 border-t border-slate-200 pt-5">
          <span className="gm-label">Brand assets</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["logos", "logoKey", "Logo", "image/png,image/jpeg,image/webp,image/svg+xml"],
                ["banners", "bannerKey", "Banner", "image/png,image/jpeg,image/webp"]
              ] as const
            ).map(([kind, key, label, accept]) => (
              <label
                key={key}
                className="cursor-pointer rounded-xl border border-dashed p-4 text-center text-sm transition hover:bg-slate-50"
              >
                {label}
                <br />
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  {uploading === key ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3" />
                      {f[key] ? "Uploaded — click to replace" : "Click to upload"}
                    </>
                  )}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={(e) => pick(kind, key, e.target.files?.[0])}
                />
              </label>
            ))}
          </div>
        </div>

        {canEdit ? (
          <div className="mt-6 flex justify-end">
            <button type="submit" className="gm-btn-primary" disabled={busy || uploading !== null}>
              <Save className="h-4 w-4" />
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            You have view-only access to this profile. Ask your organisation admin to make
            changes.
          </p>
        )}
      </form>
    </div>
  );
}
