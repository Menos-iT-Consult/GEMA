"use client";
import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, Building2, Users as UsersIcon } from "lucide-react";
import PortalNav from "@/components/PortalNav";
import PortalOverview from "@/components/portal/PortalOverview";
import PortalProfile from "@/components/portal/PortalProfile";
import PortalMembers from "@/components/portal/PortalMembers";
import type { PortalData } from "@/lib/portal-types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Profile", icon: Building2 },
  { id: "Members", icon: UsersIcon }
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PortalDash() {
  const [d, setD] = useState<PortalData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("Overview");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const r = await fetch("/api/portal");
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error ?? `Failed to load (${r.status})`);
      }
      setD(await r.json());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (err)
    return (
      <div className="gm-card p-8">
        <p className="font-semibold text-red-700">{err}</p>
        <a href="/portal/login" className="mt-2 inline-block text-royal-600 underline">
          Sign in
        </a>
      </div>
    );

  if (!d)
    return (
      <div className="space-y-4">
        <div className="gm-card h-20 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="gm-card h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );

  const org = d.organization;

  return (
    <div className="space-y-6">
      <PortalNav
        orgName={org.name}
        region={org.region}
        status={org.status}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition",
              tab === t.id
                ? "bg-navy-950 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.id}
            {t.id === "Members" && d.members.length > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 text-xs",
                  tab === t.id ? "bg-ochre-500 text-white" : "bg-gema-200 text-gema-700"
                )}
              >
                {d.members.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && <PortalOverview data={d} onNavigate={setTab} />}
      {tab === "Profile" && <PortalProfile data={d} onSaved={() => load()} />}
      {tab === "Members" && <PortalMembers data={d} onChanged={() => load()} />}
    </div>
  );
}
