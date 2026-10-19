import { GHANA_REGIONS } from "@/lib/constants";

export default function RegionHub({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div className="gm-card p-5">
      <h3 className="font-serif text-lg font-bold text-navy-950">Regional Hub — Member Distribution</h3>
      <p className="mt-1 text-sm text-slate-600">Live overview across Ghana&apos;s 16 regions.</p>
      <div>
        {GHANA_REGIONS.map((r) => {
          const c = counts[r] ?? 0;
          const pct = Math.round((c / max) * 100);
          return (
            <div key={r} className="gm-card rounded-xl border border-slate-200 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">{r}</span>
                <span className="rounded-full bg-navy-950 px-2 py-0.5 text-xs font-bold text-white">{c}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-royal-500 to-ochre-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
