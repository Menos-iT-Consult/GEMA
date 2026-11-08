"use client";
import { useState } from "react";
import { X, Building2, Upload, Loader2 } from "lucide-react";
import {
  GHANA_REGIONS,
  DENOMINATIONS,
  UMBRELLA_BODIES,
  MINISTRY_FOCUS_OPTIONS,
  ORG_STATUSES
} from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { uploadViaPresign } from "@/lib/upload";

type Props = {
  onClose: () => void;
  onCreated: (slug: string, message: string) => void;
  defaultRegion?: string | null;
  allowStatusEdit: boolean;
};

const normUrl = (v: string) => {
  const t = v.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

export default function AddOrgModal({
  onClose,
  onCreated,
  defaultRegion,
  allowStatusEdit
}: Props) {
  const [f, setF] = useState({
    name: "",
    slug: "",
    denomination: "Pentecostal",
    umbrellaBody: "Independent",
    regNo: "",
    email: "",
    phone: "",
    phone2: "",
    website: "",
    region: defaultRegion || "Greater Accra",
    city: "",
    gps: "",
    address: "",
    mission: "",
    leader: "",
    focus: [] as string[],
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    status: allowStatusEdit ? "APPROVED" : "PENDING_REVIEW",
    logoKey: "",
    bannerKey: "",
    legalKey: "",
    makeUser: false,
    userName: "",
    userEmail: "",
    userPassword: ""
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: string | boolean | string[]) =>
    setF((p) => ({ ...p, [k]: v }));

  const toggleFocus = (v: string) =>
    set(
      "focus",
      f.focus.includes(v) ? f.focus.filter((x) => x !== v) : [...f.focus, v]
    );

  async function pick(
    kind: "logos" | "banners" | "legal-docs",
    key: "logoKey" | "bannerKey" | "legalKey",
    file: File | undefined
  ) {
    if (!file) return;
    setUploading(key);
    setErr(null);
    try {
      set(key, await uploadViaPresign(file, kind));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }
  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      // Light client-side checks so obvious mistakes never reach the API.
      if (f.name.trim().length < 2) throw new Error("Organization name is required.");
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim()))
        throw new Error("Enter a valid email address.");
      if (f.phone.trim().length < 7) throw new Error("Enter a valid primary phone number.");
      if (!f.city.trim()) throw new Error("City / town is required.");
      if (f.address.trim().length < 3) throw new Error("Physical address is required.");
      if (f.makeUser) {
        if (f.userName.trim().length < 2) throw new Error("Enter the login user's full name.");
        if (!/^\S+@\S+\.\S+$/.test(f.userEmail.trim()))
          throw new Error("Enter a valid login email address.");
        if (f.userPassword.length < 8)
          throw new Error("The login password must be at least 8 characters.");
      }

      const payload: Record<string, unknown> = {
        name: f.name,
        slug: f.slug || slugify(f.name),
        denomination: f.denomination,
        umbrellaBody: f.umbrellaBody,
        registrationNumber: f.regNo || null,
        email: f.email,
        phonePrimary: f.phone,
        phoneSecondary: f.phone2 || null,
        website: normUrl(f.website) || null,
        region: f.region,
        cityTown: f.city,
        digitalAddress: f.gps || null,
        physicalAddress: f.address,
        logoR2Key: f.logoKey || null,
        bannerR2Key: f.bannerKey || null,
        legalDocR2Key: f.legalKey || null,
        missionStatement: f.mission || null,
        leaderName: f.leader || null,
        ministryFocus: f.focus,
        socialLinks: Object.fromEntries(
          Object.entries({
            facebook: f.facebook,
            instagram: f.instagram,
            twitter: f.twitter,
            youtube: f.youtube
          })
            .map(([k, v]) => [k, normUrl(v)])
            .filter(([, v]) => v !== "")
        ),
        status: f.status
      };
      if (f.makeUser) {
        payload.adminUser = {
          fullName: f.userName,
          email: f.userEmail,
          password: f.userPassword
        };
      }

      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error ?? `Request failed (${r.status})`);
      onCreated(
        j?.organization?.slug ?? "",
        `${f.name} added${f.makeUser ? " with portal login" : ""}`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-navy-950 px-6 py-5 text-white">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <Building2 className="h-5 w-5 text-ochre-400" /> Add Organization
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/15 p-2 hover:bg-white/25"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {err && (
          <p className="mx-6 mt-4 rounded-xl bg-ochre-50 p-3 text-sm text-ochre-700">{err}</p>
        )}

        <div className="grid gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="gm-label">Organization name *</label>
              <input
                className="gm-input"
                value={f.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!f.slug) set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <label className="gm-label">Slug</label>
              <input
                className="gm-input font-mono"
                value={f.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
                placeholder="auto-generated"
              />
            </div>
<div>
              <label className="gm-label">Status</label>
              <select
                className="gm-input"
                value={f.status}
                disabled={!allowStatusEdit}
                onChange={(e) => set("status", e.target.value)}
              >
                {ORG_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {!allowStatusEdit && (
                <p className="mt-1 text-xs text-gema-500">
                  Only a super admin can set the status directly.
                </p>
              )}
            </div>
            <div>
              <label className="gm-label">Denomination</label>
              <select
                className="gm-input"
                value={f.denomination}
                onChange={(e) => set("denomination", e.target.value)}
              >
                {DENOMINATIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="gm-label">Umbrella body</label>
              <select
                className="gm-input"
                value={f.umbrellaBody}
                onChange={(e) => set("umbrellaBody", e.target.value)}
              >
                {UMBRELLA_BODIES.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="gm-label">Registration number</label>
              <input
                className="gm-input"
                value={f.regNo}
                onChange={(e) => set("regNo", e.target.value)}
              />
            </div>
            <div>
              <label className="gm-label">Email *</label>
              <input
                className="gm-input"
                type="email"
                value={f.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className="gm-label">Primary phone *</label>
              <input
                className="gm-input"
                value={f.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="gm-label">Secondary phone</label>
              <input
                className="gm-input"
                value={f.phone2}
                onChange={(e) => set("phone2", e.target.value)}
              />
            </div>
            <div>
              <label className="gm-label">Region *</label>
              <select
                className="gm-input"
                value={f.region}
                disabled={Boolean(defaultRegion)}
                onChange={(e) => set("region", e.target.value)}
              >
                {GHANA_REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              {defaultRegion && (
                <p className="mt-1 text-xs text-slate-500">
                  Locked to your assigned region.
                </p>
              )}
            </div>
            <div>
              <label className="gm-label">City / town *</label>
              <input
                className="gm-input"
                value={f.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className="gm-label">GhanaPost GPS</label>
              <input
                className="gm-input font-mono"
                value={f.gps}
                onChange={(e) => set("gps", e.target.value.toUpperCase())}
                placeholder="GA-123-4567"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="gm-label">Physical address *</label>
              <textarea
                className="gm-input"
                rows={2}
                value={f.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="gm-label">Leader / head</label>
              <input
                className="gm-input"
                value={f.leader}
                onChange={(e) => set("leader", e.target.value)}
              />
            </div>
            <div>
              <label className="gm-label">Website</label>
              <input
                className="gm-input"
                value={f.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="gm-label">Mission statement</label>
              <textarea
                className="gm-input"
                rows={2}
                value={f.mission}
                onChange={(e) => set("mission", e.target.value)}
              />
            </div>
          </div>

          <div>
            <span className="gm-label">Ministry focus</span>
            <div className="flex flex-wrap gap-2">
              {MINISTRY_FOCUS_OPTIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => toggleFocus(m)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    f.focus.includes(m)
                      ? "bg-gema-700 text-white"
                      : "bg-gema-100 text-gema-600 hover:bg-gema-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-slate-200 p-4">
            <span className="gm-label">
              Social media{" "}
              <span className="font-normal normal-case text-slate-500">(optional)</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="gm-input"
                placeholder="Facebook page URL"
                value={f.facebook}
                onChange={(e) => set("facebook", e.target.value)}
              />
              <input
                className="gm-input"
                placeholder="Instagram URL"
                value={f.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
              <input
                className="gm-input"
                placeholder="X (Twitter) URL"
                value={f.twitter}
                onChange={(e) => set("twitter", e.target.value)}
              />
              <input
                className="gm-input"
                placeholder="YouTube channel URL"
                value={f.youtube}
                onChange={(e) => set("youtube", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["logos", "logoKey", "Logo", "image/png,image/jpeg,image/webp,image/svg+xml"],
                ["banners", "bannerKey", "Banner", "image/png,image/jpeg,image/webp"],
                ["legal-docs", "legalKey", "Legal cert", ".pdf,image/png,image/jpeg"]
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
                      {f[key] ? "Uploaded" : "Click to upload"}
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

          <div className="rounded-xl border border-slate-200 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={f.makeUser}
                onChange={(e) => set("makeUser", e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="font-semibold">Also create a portal login</span>
                <span className="block text-xs text-slate-500">
                  Adds an ORG_ADMIN account linked to this organization.
                </span>
              </span>
            </label>
            {f.makeUser && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="gm-label">Full name *</label>
                  <input
                    className="gm-input"
                    value={f.userName}
                    onChange={(e) => set("userName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="gm-label">Login email *</label>
                  <input
                    className="gm-input"
                    type="email"
                    value={f.userEmail}
                    onChange={(e) => set("userEmail", e.target.value)}
                  />
                </div>
                <div>
                  <label className="gm-label">Password *</label>
                  <input
                    className="gm-input"
                    type="text"
                    value={f.userPassword}
                    onChange={(e) => set("userPassword", e.target.value)}
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="gm-btn-ghost" disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="gm-btn-gold"
            disabled={busy || uploading !== null}
          >
            {busy ? "Saving…" : "Add Organization"}
          </button>
        </div>
      </div>
    </div>
  );
}
