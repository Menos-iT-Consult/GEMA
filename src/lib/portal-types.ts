import type { Organization } from "@/lib/db/schema";

export type PortalDues = {
  id: string;
  orgId: string;
  year: number;
  amountGhs: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paymentReference: string | null;
  receiptR2Key: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type PortalMember = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: number | null;
  createdAt: string;
};

export type PortalData = {
  me: { email: string; role: string; fullName: string };
  organization: Organization;
  dues: PortalDues[];
  members: PortalMember[];
  duesTotals: {
    paid: number;
    pending: number;
    overdue: number;
    amountPaid: number;
  };
};

export const DUES_BADGE: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700"
};

export const ORG_BADGE: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  UNDER_VETTING: "bg-blue-100 text-blue-700",
  SUSPENDED: "bg-red-100 text-red-700",
  RENEWAL_DUE: "bg-purple-100 text-purple-700"
};

export const ghs = (n: number) => `GHS ${Number(n).toLocaleString("en-US")}`;

export const fmtDate = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";
