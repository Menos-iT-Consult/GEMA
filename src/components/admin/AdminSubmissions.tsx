"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Image, RefreshCw } from "lucide-react";

type Submission = {
  id: string;
  orgName: string;
  region: string;
  submittedBy: string | null;
  submitterEmail: string | null;
  title: string;
  message: string;
  status: "NEW" | "REVIEWED";
  createdAt: string;
  reviewedAt: string | null;
  attachments: { key: string; fileName: string; contentType: string; url: string }[];
};

export default function AdminSubmissions() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/submissions");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Could not load reports (${response.status})`);
      setItems(data.items);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markReviewed(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Could not update report (${response.status})`);
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "REVIEWED", reviewedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update report.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-navy-950">Organisation reports and photos</h3>
          <p className="mt-1 text-sm text-slate-600">Submissions sent to central administration.</p>
        </div>
        <button onClick={load} disabled={loading} className="gm-btn-ghost !px-3 !py-2 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading submissions…</p>
      ) : items.length === 0 ? (
        <p className="mt-5 text-sm text-slate-600">No organisation reports have been submitted.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-navy-950">{item.title}</h4>
                    <span className={`gm-badge ${item.status === "REVIEWED" ? "bg-emerald-100 text-emerald-800" : "bg-ochre-100 text-ochre-800"}`}>
                      {item.status === "REVIEWED" ? "Reviewed" : "New"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {item.orgName} <span className="font-normal text-slate-500">· {item.region}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.submittedBy ?? item.submitterEmail ?? "Organisation member"}
                    {item.submitterEmail ? ` · ${item.submitterEmail}` : ""}
                    {" · "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {item.status === "NEW" && (
                  <button
                    onClick={() => markReviewed(item.id)}
                    disabled={busyId !== null}
                    className="gm-btn-primary !px-3 !py-2 text-xs"
                  >
                    {busyId === item.id ? "Updating…" : "Mark reviewed"}
                  </button>
                )}
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.message}</p>
              {item.attachments.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {item.attachments.map((file) => {
                    const isImage = file.contentType.startsWith("image/");
                    const Icon = isImage ? Image : FileText;
                    return (
                      <a
                        key={file.key}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        {isImage ? (
                          <img src={file.url} alt={file.fileName} className="h-40 w-full object-cover" />
                        ) : (
                          <div className="flex h-40 items-center justify-center text-royal-700">
                            <FileText className="h-10 w-10" />
                          </div>
                        )}
                        <span className="flex items-center justify-between gap-2 p-3 text-sm font-medium text-slate-700 group-hover:text-royal-800">
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{file.fileName}</span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
