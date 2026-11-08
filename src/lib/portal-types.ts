import type { Organization } from "@/lib/db/schema";

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
  members: PortalMember[];
};

export const ORG_BADGE: Record<string, string> = {
  APPROVED: "bg-gema-100 text-gema-700",
  PENDING_REVIEW: "bg-ochre-100 text-ochre-700",
  UNDER_VETTING: "bg-royal-100 text-royal-700",
  SUSPENDED: "bg-red-100 text-red-700",
  RENEWAL_DUE: "bg-purple-100 text-purple-700"
};

export const fmtDate = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";
