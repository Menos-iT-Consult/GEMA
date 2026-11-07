"use client";
import { useMemo, useState } from "react";
import { Download, Receipt, Wallet } from "lucide-react";
import type { PortalData } from "@/lib/portal-types";
import { ghs, fmtDate, DUES_BADGE } from "@/lib/portal-types";

type Props = {
  data: PortalData;
};

export default function PortalDues({ data }: Props) {
  const [year, setYear] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const years = useMemo(
    () => Array.from(new Set(data.dues.map((d) => d.year))).sort((a, b) => b - a),
    [data.dues]
  );

  const rows = data.dues.filter(
    (r) => (year === "ALL" || r.year === Number(year)) && (status === "ALL" || r.status === status)
  );

  const totalShown = rows.reduce((sum, r) => sum + r.amountGhs, 0);
  const totalPaidShown = rows
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + r.amountGhs, 0);

  const csv = () => {
    const out = [
      ["year", "amount_ghs", "status", "payment_reference", "paid_at", "created_at"],
      ...rows.map((r) => [
        r.year,
        r.amountGhs,
        r.status,
        r.paymentReference ?? "",
        r.paidAt ?? "",
        r.createdAt
      ])
    ];
    const blob = new Blob([out.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dues-records.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Assessments
          </p>
          <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{ghs(totalShown)}</p>
        </div>
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Paid</p>
          <p className="mt-1 font-serif text-3xl font-bold text-emerald-700">
            {ghs(totalPaidShown)}
          </p>
        </div>
        <div className="gm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Records</p>
          <p className="mt-1 font-serif text-3xl font-bold text-navy-950">{rows.length}</p>
        </div>
      </div>
      <div className="gm-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-navy-950">Dues History</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="gm-input !w-auto !py-2 text-xs"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Filter by year"
            >
              <option value="ALL">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="gm-input !w-auto !py-2 text-xs"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <button
              onClick={csv}
              disabled={rows.length === 0}
              className="gm-btn-ghost !px-3 !py-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 font-bold">Year</th>
                <th className="pb-2 font-bold">Amount</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold">Reference</th>
                <th className="pb-2 font-bold">Paid on</th>
                <th className="pb-2 font-bold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                    No dues records match this filter.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 font-semibold text-navy-950">{r.year}</td>
                  <td className="py-3">{ghs(r.amountGhs)}</td>
                  <td className="py-3">
                    <span
                      className={`gm-badge ${DUES_BADGE[r.status] ?? "bg-slate-100 text-slate-700"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{r.paymentReference ?? "—"}</td>
                  <td className="py-3 text-slate-600">{fmtDate(r.paidAt)}</td>
                  <td className="py-3">
                    {r.receiptR2Key ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-royal-600">
                        <Receipt className="h-3.5 w-3.5" /> Available
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-royal-50 px-4 py-3 text-xs text-royal-700">
          <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Assessments are issued annually by the Secretariat. To pay, quote your registration
          number and send proof of payment to the Secretariat for confirmation.
        </p>
      </div>
    </div>
  );
}
