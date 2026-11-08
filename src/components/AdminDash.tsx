"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Organization } from "@/lib/db/schema";
import { ORG_STATUSES, GHANA_REGIONS } from "@/lib/constants";
import AddOrgModal from "@/components/AddOrgModal";
import {
  Search,
  RefreshCw,
  LogOut,
  Plus,
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  Users as UsersIcon,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight
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
    newThisMonth: number;
  };
  statusCounts: Record<string, number>;
  byRegion: { key: string; count: number }[];
  byDenomination: { key: string; count: number }[];
  byUmbrella: { key: string; count: number }[];
  pendingQueue: Organization[];
  orgs: OrgRow[];
  users: UserRow[];
};

const TABS = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Approvals", icon: ClipboardCheck },
  { id: "Organizations", icon: Building2 },
  { id: "Users", icon: UsersIcon }
] as const;
type TabId = (typeof TABS)[number]["id"];

const BADGE: Record<string, string> = {
  APPROVED: "bg-gema-100 text-gema-700",
  PENDING_REVIEW: "bg-ochre-100 text-ochre-700",
  UNDER_VETTING: "bg-royal-100 text-royal-700",
  SUSPENDED: "bg-red-100 text-red-700",
  RENEWAL_DUE: "bg-purple-100 text-purple-700"
};

function Badge({ value }: { value: string }) {
  return (
    <span className={`gm-badge ${BADGE[value] ?? "bg-gema-100 text-gema-700"}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

const fmtDate = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

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
  const [showAddOrg, setShowAddOrg] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const r = await fetch("/api/admin");
      if (!r.ok) throw new Error(r.status === 401 ? "Login required" : `Failed to load (${r.status})`);
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
          (!s || o.name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s) || o.slug.includes(s)) &&
          (!ost || o.status === ost) &&
          (!oreg || o.region === oreg)
        );
      })
    : [];

  const csv = () => {
    const rows = [
      ["name", "slug", "region", "city", "status", "email", "denomination", "umbrella", "joined"],
      ...filteredOrgs.map((o) => [
        o.name,
        o.slug,
        o.region,
        o.cityTown,
        o.status,
        o.email,
        o.denomination,
        o.umbrellaBody,
        o.createdAt
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
    ["New This Month", s.newThisMonth]
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-royal-600">Operations overview</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-navy-950">Executive dashboard</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => load()} className="gm-btn-ghost !px-3 !py-2 text-xs" disabled={busy}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={logout} className="gm-btn-ghost !px-3 !py-2 text-xs">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-100 to-gema-100 text-royal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-navy-950">{d.me.email}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{d.me.role.replace(/_/g, " ")}</div>
            </div>
          </div>

          {d.me.assignedRegion && (
            <div className="inline-flex items-center gap-2 rounded-full bg-royal-50 px-3 py-1.5 text-sm font-medium text-royal-700">
              <Activity className="h-4 w-4" />
              {d.me.assignedRegion}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-navy-950 text-white shadow-sm"
                : "border border-gema-200 bg-white text-gema-700 hover:bg-gema-50"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.id}
            {t.id === "Approvals" && d.pendingQueue.length > 0 && (
              <span
className={`ml-1 rounded-full px-1.5 text-xs ${
                  tab === t.id ? "bg-ochre-500 text-white" : "bg-royal-100 text-royal-700"
                }`}
              >
                {d.pendingQueue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-2xl border border-gema-200 bg-gema-50 px-4 py-3 text-sm font-semibold text-gema-700">
          {msg}
        </p>
      )}

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gema-50 text-gema-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 font-serif text-3xl font-bold text-navy-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-navy-950">Growth by region</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-gema-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gema-700">
                  <ArrowUpRight className="h-3.5 w-3.5" /> Active
                </span>
              </div>

<div className="mt-4 space-y-3">
                {d.byRegion.length === 0 && (
                  <p className="text-sm text-gema-500">No organizations yet.</p>
                )}
                {d.byRegion.map((r) => {
                  const count = Number(r.count);
                  const max = Math.max(1, ...d.byRegion.map((x) => Number(x.count)));
                  return (
                    <div key={r.key} className="flex items-center gap-3 text-sm">
                      <span className="w-32 shrink-0 truncate text-gema-700">{r.key}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gema-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gema-400 to-royal-600"
                          style={{ width: `${Math.max(6, (count / max) * 100)}%` }}
                        />
                      </div>
                      <b className="w-8 text-right text-navy-950">{count}</b>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-navy-950">By denomination</h3>
                <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
                  {d.byDenomination.map((r) => (
                    <div key={r.key} className="flex justify-between text-sm text-slate-700">
                      <span>{r.key}</span>
                      <b className="text-navy-950">{Number(r.count)}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-navy-950">By umbrella body</h3>
                <div className="mt-3 space-y-2">
                  {d.byUmbrella.map((r) => (
                    <div key={r.key} className="flex justify-between text-sm text-slate-700">
                      <span>{r.key}</span>
                      <b className="text-navy-950">{Number(r.count)}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Approvals" && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Approval queue ({filteredQueue.length})</h3>
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
            {filteredQueue.length === 0 && (
              <p className="text-sm text-gema-500">No pending approvals.</p>
            )}
            {filteredQueue.map((o) => (
              <div key={o.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-950">{o.name}</p>
                    <p className="text-sm text-slate-500">
                      {o.cityTown}, {o.region} • {o.email}
                    </p>
                  </div>
                  <Badge value={o.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => patch({ id: o.id, status: "APPROVED" }, "Organisation approved")}
                    className="gm-btn-primary !px-3 !py-2 text-xs"
                    disabled={busy}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => patch({ id: o.id, status: "UNDER_VETTING" }, "Moved to under vetting")}
                    className="gm-btn-ghost !px-3 !py-2 text-xs"
                    disabled={busy}
                  >
                    Vetting
                  </button>
                  <button
                    onClick={() => patch({ id: o.id, status: "SUSPENDED" }, "Organisation suspended")}
                    className="gm-btn-ghost !px-3 !py-2 text-xs"
                    disabled={busy}
                  >
                    Suspend
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Organizations" && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-navy-950">Organizations</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="gm-input !w-48 !py-2 pl-9"
                  placeholder="Search orgs"
                  value={oq}
                  onChange={(e) => setOq(e.target.value)}
                />
              </div>
              <select className="gm-input !w-auto !py-2 text-xs" value={ost} onChange={(e) => setOst(e.target.value)}>
                <option value="">All statuses</option>
                {ORG_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
              <select className="gm-input !w-auto !py-2 text-xs" value={oreg} onChange={(e) => setOreg(e.target.value)}>
                <option value="">All regions</option>
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button onClick={() => setShowAddOrg((s) => !s)} className="gm-btn-gold !px-3 !py-2 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add org
              </button>
              <button onClick={csv} className="gm-btn-ghost !px-3 !py-2 text-xs">
                Export CSV
              </button>
            </div>
          </div>

          {showAddOrg && (
            <AddOrgModal
              onClose={() => setShowAddOrg(false)}
              onCreated={async () => {
                setShowAddOrg(false);
                await load();
              }}
              defaultRegion={null}
              allowStatusEdit={true}
            />
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-2 font-bold">Org</th>
                  <th className="pb-2 font-bold">Region</th>
                  <th className="pb-2 font-bold">Status</th>
                  <th className="pb-2 font-bold">Email</th>
                  <th className="pb-2 font-bold">Joined</th>
                </tr>
              </thead>
<tbody className="divide-y divide-gema-100">
                {filteredOrgs.map((o) => (
                  <tr key={o.id} className="hover:bg-gema-100">
                    <td className="py-3">
                      <div>
                        <p className="font-semibold text-navy-950">{o.name}</p>
                        <p className="text-xs text-gema-600">{o.slug}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gema-700">{o.region}</td>
                    <td className="py-3"><Badge value={o.status} /></td>
                    <td className="py-3 text-gema-700">{o.email}</td>
                    <td className="py-3 text-gema-700">{fmtDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Users" && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-navy-950">Users</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-2 font-bold">Name</th>
                  <th className="pb-2 font-bold">Email</th>
                  <th className="pb-2 font-bold">Role</th>
                  <th className="pb-2 font-bold">Org</th>
                  <th className="pb-2 font-bold">Status</th>
                </tr>
              </thead>
<tbody className="divide-y divide-gema-100">
                {d.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gema-100">
                    <td className="py-3 font-semibold text-navy-950">{u.fullName}</td>
                    <td className="py-3 text-gema-700">{u.email}</td>
                    <td className="py-3 text-gema-700">{u.role.replace(/_/g, " ")}</td>
                    <td className="py-3 text-gema-700">{u.orgName ?? "—"}</td>
                    <td className="py-3">
                      <span className={`gm-badge ${u.isActive === 1 ? "bg-gema-100 text-gema-700" : "bg-royal-100 text-royal-700"}`}>
                        {u.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
