"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  orgName: string;
  region: string;
  status: string;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export default function PortalNav({
  orgName,
  region,
  status,
  onRefresh,
  refreshing
}: Props) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-950 font-serif text-xl font-bold text-ochre-300">
          {orgName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-serif text-lg font-bold text-navy-950">
            {orgName}
          </p>
          <p className="text-xs text-slate-600">
            {region} •{" "}
            <span
              className={cn(
                "gm-badge",
                status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {status.replace(/_/g, " ")}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="gm-btn-ghost !px-3 !py-2 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        )}
        <Link
          href="/directory"
          className="gm-btn-ghost !px-3 !py-2 text-xs"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Public listing
        </Link>
        <button onClick={logout} className="gm-btn-ghost !px-3 !py-2 text-xs">
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </div>
  );
}
