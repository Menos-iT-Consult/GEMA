"use client";
import { useState } from "react";
import { Plus, UserMinus, UserCheck, ShieldCheck, X } from "lucide-react";
import type { PortalData } from "@/lib/portal-types";
import { fmtDate } from "@/lib/portal-types";

type Props = {
  data: PortalData;
  onChanged: () => void;
};

const ROLE_LABEL: Record<string, string> = {
  ORG_ADMIN: "Admin",
  MEMBER_VIEWER: "Viewer"
};

const ROLE_BADGE: Record<string, string> = {
  ORG_ADMIN: "bg-royal-100 text-royal-700",
  MEMBER_VIEWER: "bg-gema-100 text-gema-700"
};

export default function PortalMembers({ data, onChanged }: Props) {
  const canManage = data.me.role === "ORG_ADMIN";
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "MEMBER_VIEWER" });

  const members = data.members;
  const activeCount = members.filter((m) => m.isActive === 1).length;

  async function call(method: "POST" | "PATCH", body: unknown) {
    const r = await fetch("/api/portal/members", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.error ?? `Request failed (${r.status})`);
    return j;
  }

  async function addMember() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await call("POST", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });
      setMsg(`${form.fullName.trim()} was added to your portal team.`);
      setForm({ fullName: "", email: "", password: "", role: "MEMBER_VIEWER" });
      setShowAdd(false);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not add member");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(id: string, isActive: number) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await call("PATCH", { userId: id, isActive: isActive === 1 ? 0 : 1 });
      setMsg(isActive === 1 ? "Member deactivated." : "Member activated.");
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update member");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id: string, role: string) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await call("PATCH", { userId: id, role });
      setMsg("Member role updated.");
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update member");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Members</p>
          <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{members.length}</p>
        </div>
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active</p>
          <p className="mt-1 font-serif text-3xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Admins</p>
          <p className="mt-1 font-serif text-3xl font-bold text-navy-950">
            {members.filter((m) => m.role === "ORG_ADMIN").length}
          </p>
        </div>
      </div>

      {msg && (
        <p className="rounded-xl bg-gema-50 px-4 py-2.5 text-sm font-semibold text-gema-700">
          {msg}
        </p>
      )}
      {err && (
        <p className="rounded-xl bg-ochre-50 px-4 py-2.5 text-sm font-semibold text-ochre-700">{err}</p>
      )}

      {canManage && (
        <div className="gm-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Add Team Member</h3>
            <button
              onClick={() => setShowAdd((s) => !s)}
              className="gm-btn-gold !px-3 !py-2 text-xs"
            >
              {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showAdd ? "Close" : "Add Member"}
            </button>
          </div>

          {showAdd && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMember();
              }}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <div>
                <label className="gm-label" htmlFor="m-name">
                  Full name *
                </label>
                <input
                  id="m-name"
                  className="gm-input"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="gm-label" htmlFor="m-email">
                  Email *
                </label>
                <input
                  id="m-email"
                  type="email"
                  className="gm-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="gm-label" htmlFor="m-password">
                  Temporary password *
                </label>
                <input
                  id="m-password"
                  type="text"
                  className="gm-input"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="gm-label" htmlFor="m-role">
                  Portal role
                </label>
                <select
                  id="m-role"
                  className="gm-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="MEMBER_VIEWER">Viewer — read-only</option>
                  <option value="ORG_ADMIN">Admin — can edit the profile</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="gm-btn-primary" disabled={busy}>
                  <Plus className="h-4 w-4" /> {busy ? "Adding…" : "Add Member"}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  Share the credentials securely. The member signs in at the portal with this
                  email and password.
                </p>
              </div>
            </form>
          )}
        </div>
      )}
      <div className="gm-card p-5">
        <h3 className="font-bold text-navy-950">Team</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 font-bold">Name</th>
                <th className="pb-2 font-bold">Email</th>
                <th className="pb-2 font-bold">Role</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold">Added</th>
                <th className="pb-2 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                    No team members yet.
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <tr key={m.id} className={m.isActive === 1 ? "" : "opacity-60"}>
                  <td className="py-3 font-semibold text-navy-950">{m.fullName}</td>
                  <td className="py-3 text-slate-600">{m.email}</td>
                  <td className="py-3">
                    {canManage ? (
                      <select
                        className="gm-input !w-auto !py-1.5 text-xs"
                        value={m.role}
                        disabled={busy}
                        onChange={(e) => changeRole(m.id, e.target.value)}
                        aria-label={`Role for ${m.fullName}`}
                      >
                        <option value="ORG_ADMIN">Admin</option>
                        <option value="MEMBER_VIEWER">Viewer</option>
                      </select>
                    ) : (
                      <span className={`gm-badge ${ROLE_BADGE[m.role] ?? "bg-gema-100 text-gema-700"}`}>
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
className={`gm-badge ${
                        m.isActive === 1
                          ? "bg-gema-100 text-gema-700"
                          : "bg-gema-100 text-gema-700"
                        }`}
                    >
                      {m.isActive === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{fmtDate(m.createdAt)}</td>
                  <td className="py-3">
                    {canManage ? (
                      <button
                        onClick={() => toggleActive(m.id, m.isActive ?? 1)}
                        disabled={busy}
                        className="gm-btn-ghost !px-3 !py-1.5 text-xs"
                      >
                        {m.isActive === 1 ? (
                          <>
                            <UserMinus className="h-3.5 w-3.5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" /> Activate
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!canManage && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            You have view-only access to the team list. Ask your organisation admin to add or
            update members.
          </p>
        )}
      </div>
    </div>
  );
}
