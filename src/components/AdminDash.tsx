"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Organization } from "@/lib/db/schema";
import { ORG_STATUSES, GHANA_REGIONS } from "@/lib/constants";
import {
  Search,
  RefreshCw,
  LogOut,
  Plus,
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  Banknote,
  Users as UsersIcon
} from "lucide-react";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  region: string;
  cityTown: string;
  email: string;
  denomination: string;
  umbrellaBody: string;
  createdAt: string;
};
type DuesRow = {
  id: string;
  orgId: string;
  orgName: string | null;
  year: number;
  amountGhs: number;
  status: string;
  paymentReference: string | null;
  paidAt: string | null;
  createdAt: string;
};
type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: number | null;
  assignedRegion: string | null;
  orgName: string | null;
  createdAt: string;
};
type Data = {
  me: { email: string; role: string; assignedRegion: string | null };
  stats: {
    total: number;
    approved: number;
    pending: number;
    underVetting: number;
    suspended: number;
    renewalDue: number;
    duesCollected: number;
    duesTotalGhs: number;
    duesPending: number;
    duesOverdue: number;
    newThisMonth: number;
  };
  statusCounts: Record<string, number>;
  byRegion: { key: string; count: number }[];
  byDenomination: { key: string; count: number }[];
  byUmbrella: { key: string; count: number }[];
  pendingQueue: Organization[];
  orgs: OrgRow[];
  dues: DuesRow[];
  users: UserRow[];
};

const TABS = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Approvals", icon: ClipboardCheck },
  { id: "Organizations", icon: Building2 },
  { id: "Dues", icon: Banknote },
  { id: "Users", icon: UsersIcon }
] as const;
type TabId = (typeof TABS)[number]["id"];

const BADGE: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  UNDER_VETTING: "bg-blue-100 text-blue-700",
  SUSPENDED: "bg-red-100 text-red-700",
  RENEWAL_DUE: "bg-purple-100 text-purple-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700"
};

function Badge({ value }: { value: string }) {
  return (
    <span className={`gm-badge ${BADGE[value] ?? "bg-slate-100 text-slate-700"}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

const fmtDate = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
const ghs = (n: number) => `GHS ${Number(n).toLocaleString("en-US")}`;


export default function AdminDash() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabId>("Overview");
  const [q, setQ] = useState("");
  const [oq, setOq] = useState("");
  const [ost, setOst] = useState("");
  const [oreg, setOreg] = useState("");
  const [duesForm, setDuesForm] = useState({
    orgId: "",
    year: String(new Date().getFullYear()),
    amountGhs: "",
    status: "PENDING",
    paymentReference: ""
  });
  const router = useRouter();

  const load = async () => {
    try {
      const r = await fetch("/api/admin");
      if (!r.ok)
        throw new Error(r.status === 401 ? "Login required" : `Failed to load (${r.status})`);
      setD(await r.json());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = async (payload: Record<string, unknown>, okMsg: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error ?? `Request failed (${r.status})`);
      }
      setMsg(okMsg);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const addDues = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (!duesForm.orgId) throw new Error("Choose an organisation");
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: duesForm.orgId,
          year: Number(duesForm.year),
          amountGhs: Number(duesForm.amountGhs),
          status: duesForm.status,
          paymentReference: duesForm.paymentReference || null
        })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error ?? `Request failed (${r.status})`);
      }
      setMsg("Dues record created");
      setDuesForm({ ...duesForm, amountGhs: "", paymentReference: "" });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const filteredQueue = d
    ? d.pendingQueue.filter((o) => {
        const s = q.toLowerCase();
        return (
          !s ||
          o.name.toLowerCase().includes(s) ||
          o.email.toLowerCase().includes(s) ||
          o.region.toLowerCase().includes(s) ||
          o.cityTown.toLowerCase().includes(s)
        );
      })
    : [];

  const filteredOrgs = d
    ? d.orgs.filter((o) => {
        const s = oq.toLowerCase();
        return (
          (!s ||
            o.name.toLowerCase().includes(s) ||
            o.email.toLowerCase().includes(s) ||
            o.slug.includes(s)) &&
          (!ost || o.status === ost) &&
          (!oreg || o.region === oreg)
        );
      })
    : [];

  const csv = () => {
    const rows = [
      ["name", "slug", "region", "city", "status", "email", "denomination", "umbrella", "joined"],
      ...filteredOrgs.map((o) => [
        o.name, o.slug, o.region, o.cityTown, o.status, o.email,
        o.denomination, o.umbrellaBody, o.createdAt
      ])
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "organizations.csv";
    a.click();
  };

  if (err)
    return (
      <div className="gm-card p-8">
        Error: {err}{" "}
        <a href="/admin/login" className="text-royal-600 underline">
          Login
        </a>
      </div>
    );
  if (!d)
    return (
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="gm-card h-28 animate-pulse" />
        ))}
      </div>
    );

  const s = d.stats;
  const statCards: [string, string | number][] = [
    ["Total Orgs", s.total],
    ["Approved", s.approved],
    ["Pending Review", s.pending],
    ["Suspended", s.suspended],
    ["Under Vetting", s.underVetting],
    ["Renewal Due", s.renewalDue],
    ["New This Month", s.newThisMonth],
    ["Dues Paid", s.duesCollected]
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          Signed in as <b className="text-navy-950">{d.me.email}</b>
          <span className="gm-badge ml-2 bg-navy-950 text-white">
            {d.me.role.replace(/_/g, " ")}
          </span>
          {d.me.assignedRegion && (
            <span className="ml-2 text-slate-500">• {d.me.assignedRegion}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="gm-btn-ghost !px-3 !py-2 text-xs" disabled={busy}>

            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button onClick={logout} className="gm-btn-ghost !px-3 !py-2 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-navy-950 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.id}
            {t.id === "Approvals" && d.pendingQueue.length > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 text-xs ${
                  tab === t.id ? "bg-ochre-500 text-white" : "bg-amber-100 text-amber-700"
                }`}
              >
                {d.pendingQueue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-xl bg-royal-50 px-4 py-2.5 text-sm font-semibold text-royal-700">
          {msg}
        </p>
      )}

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(([l, v]) => (
              <div key={l} className="gm-card p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{l}</p>
                <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{v}</p>
              </div>
            ))}
          </div>

          <div className="gm-card p-5">
            <h3 className="font-bold text-navy-950">Dues Collection</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Collected</p>
                <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                  {ghs(s.duesTotalGhs)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending</p>
                <p className="mt-1 font-serif text-2xl font-bold text-amber-700">{s.duesPending}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Overdue</p>
                <p className="mt-1 font-serif text-2xl font-bold text-red-700">{s.duesOverdue}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="gm-card p-5 lg:col-span-2">
              <h3 className="font-bold text-navy-950">By Region</h3>
              <div className="mt-3 space-y-2">
                {d.byRegion.length === 0 && (
                  <p className="text-sm text-slate-500">No organizations yet.</p>
                )}
                {d.byRegion.map((r) => {
                  const count = Number(r.count);
                  const max = Math.max(1, ...d.byRegion.map((x) => Number(x.count)));
                  return (
                    <div key={r.key} className="flex items-center gap-3 text-sm">
                      <span className="w-36 shrink-0 truncate text-slate-700">{r.key}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-royal-500"
                          style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                        />
                      </div>
                      <b className="w-8 text-right text-navy-950">{count}</b>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="gm-card p-5">
                <h3 className="font-bold text-navy-950">By Denomination</h3>
                <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
                  {d.byDenomination.map((r) => (
                    <div key={r.key} className="flex justify-between text-sm">
                      <span>{r.key}</span>
                      <b>{Number(r.count)}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gm-card p-5">
                <h3 className="font-bold text-navy-950">By Umbrella Body</h3>
                <div className="mt-2 space-y-2">
                  {d.byUmbrella.map((r) => (
                    <div key={r.key} className="flex justify-between text-sm">
                      <span>{r.key}</span>
                      <b>{Number(r.count)}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="gm-card p-5">
            <h3 className="font-bold text-navy-950">Recent Dues Payments</h3>
            <div className="mt-3 space-y-2">
              {d.dues.length === 0 && <p className="text-sm text-slate-500">No dues records yet.</p>}
              {d.dues.slice(0, 8).map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-navy-950">{r.orgName ?? "Unknown org"}</p>
                    <p className="text-xs text-slate-600">
                      {r.year} • {ghs(r.amountGhs)} • {fmtDate(r.paidAt ?? r.createdAt)}
                    </p>
                  </div>
                  <Badge value={r.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Approvals" && (
        <div className="gm-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Approval Queue ({filteredQueue.length})</h3>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="gm-input !w-64 !py-2 pl-9"
                placeholder="Search name, region, email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {filteredQueue.length === 0 && <p className="text-sm text-slate-500">Queue clear.</p>}
            {filteredQueue.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-bold">
                    {o.name} <Badge value={o.status} />
                  </p>
                  <p className="text-xs text-slate-600">
                    {o.cityTown}, {o.region} — {o.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    onClick={() =>
                      patch({ id: o.id, status: "UNDER_VETTING" }, `${o.name} → under vetting`)
                    }
                    className="gm-btn-ghost text-xs"
                  >
                    Vet
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => patch({ id: o.id, status: "APPROVED" }, `${o.name} approved`)}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => patch({ id: o.id, status: "SUSPENDED" }, `${o.name} rejected`)}
                    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Organizations" && (
        <div className="gm-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Organizations ({filteredOrgs.length})</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="gm-input !w-56 !py-2 pl-9"
                  placeholder="Search…"
                  value={oq}
                  onChange={(e) => setOq(e.target.value)}
                />
              </div>
              <select
                className="gm-input !w-44 !py-2"
                value={ost}
                onChange={(e) => setOst(e.target.value)}
              >
                <option value="">All statuses</option>
                {ORG_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select
                className="gm-input !w-40 !py-2"
                value={oreg}
                onChange={(e) => setOreg(e.target.value)}
              >
                <option value="">All regions</option>
                {GHANA_REGIONS.map((rg) => (
                  <option key={rg} value={rg}>
                    {rg}
                  </option>
                ))}
              </select>
              <button onClick={csv} className="gm-btn-ghost text-xs">
                CSV
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Region</th>
                  <th className="py-2 pr-3">Denomination</th>
                  <th className="py-2 pr-3">Joined</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No organizations found.
                    </td>
                  </tr>
                )}
                {filteredOrgs.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-navy-950">{o.name}</p>
                      <p className="text-xs text-slate-500">{o.email}</p>
                    </td>
                    <td className="py-2.5 pr-3">{o.region}</td>
                    <td className="py-2.5 pr-3">{o.denomination}</td>
                    <td className="py-2.5 pr-3">{fmtDate(o.createdAt)}</td>
                    <td className="py-2.5 pr-3">
                      <select
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                        value={o.status}
                        disabled={busy}
                        onChange={(e) =>
                          patch({ id: o.id, status: e.target.value }, `${o.name} → ${e.target.value}`)
                        }
                      >
                        {ORG_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Dues" && (
        <div className="space-y-4">
          <div className="gm-card p-5">
            <h3 className="font-bold text-navy-950">Record Dues Payment</h3>
            <form onSubmit={addDues} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <select
                className="gm-input lg:col-span-2"
                value={duesForm.orgId}
                onChange={(e) => setDuesForm({ ...duesForm, orgId: e.target.value })}
              >
                <option value="">Select organization…</option>
                {d.orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.region})
                  </option>
                ))}
              </select>
              <input
                className="gm-input"
                type="number"
                min={2000}
                max={2100}
                placeholder="Year"
                value={duesForm.year}
                onChange={(e) => setDuesForm({ ...duesForm, year: e.target.value })}
              />
              <input
                className="gm-input"
                type="number"
                min={1}
                placeholder="Amount (GHS)"
                value={duesForm.amountGhs}
                onChange={(e) => setDuesForm({ ...duesForm, amountGhs: e.target.value })}
              />
              <select
                className="gm-input"
                value={duesForm.status}
                onChange={(e) => setDuesForm({ ...duesForm, status: e.target.value })}
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <input
                className="gm-input lg:col-span-3"
                placeholder="Payment reference (optional)"
                value={duesForm.paymentReference}
                onChange={(e) => setDuesForm({ ...duesForm, paymentReference: e.target.value })}
              />
              <button type="submit" disabled={busy} className="gm-btn-gold lg:col-span-2">
                <Plus className="h-4 w-4" /> {busy ? "Saving…" : "Add Record"}
              </button>
            </form>
          </div>

          <div className="gm-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-navy-950">Dues Records ({d.dues.length})</h3>
              <p className="text-sm text-slate-600">
                Collected: <b className="text-emerald-700">{ghs(s.duesTotalGhs)}</b> • Pending:{" "}
                <b className="text-amber-700">{s.duesPending}</b> • Overdue:{" "}
                <b className="text-red-700">{s.duesOverdue}</b>
              </p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-3">Organization</th>
                    <th className="py-2 pr-3">Year</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Reference</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.dues.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No dues records yet.
                      </td>
                    </tr>
                  )}
                  {d.dues.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-semibold text-navy-950">
                        {r.orgName ?? "Unknown org"}
                      </td>
                      <td className="py-2.5 pr-3">{r.year}</td>
                      <td className="py-2.5 pr-3">{ghs(r.amountGhs)}</td>
                      <td className="py-2.5 pr-3 text-xs text-slate-600">
                        {r.paymentReference ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge value={r.status} />
                      </td>
                      <td className="py-2.5 pr-3">
                        {r.status === "PAID" ? (
                          <span className="text-xs text-slate-500">{fmtDate(r.paidAt)}</span>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() => patch({ duesId: r.id, status: "PAID" }, "Dues marked as paid")}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "Users" && (
        <div className="gm-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Users ({d.users.length})</h3>
            {d.me.role !== "SUPER_ADMIN" && (
              <p className="text-xs text-slate-500">User management is super admin only.</p>
            )}
          </div>
          {d.users.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">No users to display.</p>
          )}
          {d.users.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Region</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Joined</th>
                    <th className="py-2 pr-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.users.map((u) => {
                    const own = u.email === d.me.email;
                    return (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2.5 pr-3">
                          <p className="font-semibold text-navy-950">{u.fullName}</p>
                          {u.orgName && <p className="text-xs text-slate-500">{u.orgName}</p>}
                        </td>
                        <td className="py-2.5 pr-3">{u.email}</td>
                        <td className="py-2.5 pr-3">
                          <select
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                            value={u.role}
                            disabled={busy || own}
                            onChange={(e) =>
                              patch({ userId: u.id, role: e.target.value }, "Role updated")
                            }
                          >
                            {["SUPER_ADMIN", "REGIONAL_OVERSEER", "ORG_ADMIN", "MEMBER_VIEWER"].map(
                              (r) => (
                                <option key={r} value={r}>
                                  {r.replace(/_/g, " ")}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                        <td className="py-2.5 pr-3">{u.assignedRegion ?? "—"}</td>
                        <td className="py-2.5 pr-3">
                          <span
                            className={`gm-badge ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">{fmtDate(u.createdAt)}</td>
                        <td className="py-2.5 pr-3">
                          <button
                            disabled={busy || own}
                            onClick={() =>
                              patch(
                                { userId: u.id, isActive: u.isActive ? 0 : 1 },
                                u.isActive ? "User deactivated" : "User activated"
                              )
                            }
                            className="gm-btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40"
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
