import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, duesRecords, users } from "@/lib/db/schema";
import { readSession } from "@/lib/auth";
import { portalProfileSchema } from "@/lib/validators";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only organisation-linked accounts (ORG_ADMIN / MEMBER_VIEWER) have a portal.
  if (!session.orgId) {
    return NextResponse.json(
      { error: "This account is not linked to an organisation" },
      { status: 403 }
    );
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.orgId))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // The session cookie lives for 7 days, so a member deactivated in the
  // meantime must be rejected here — deactivation has to revoke access.
  const [account] = await db
    .select({ isActive: users.isActive })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);
  if (account && account.isActive === 0) {
    return NextResponse.json(
      { error: "This account has been deactivated" },
      { status: 403 }
    );
  }

  const dues = await db
    .select()
    .from(duesRecords)
    .where(eq(duesRecords.orgId, org.id))
    .orderBy(desc(duesRecords.year), desc(duesRecords.createdAt));

  const members = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.orgId, org.id));

  const [totals] = await db
    .select({
      paid: sql<number>`count(*) filter (where ${duesRecords.status} = 'PAID')`,
      pending: sql<number>`count(*) filter (where ${duesRecords.status} = 'PENDING')`,
      overdue: sql<number>`count(*) filter (where ${duesRecords.status} = 'OVERDUE')`,
      amountPaid: sql<number>`coalesce(sum(${duesRecords.amountGhs}) filter (where ${duesRecords.status} = 'PAID'), 0)`
    })
    .from(duesRecords)
    .where(eq(duesRecords.orgId, org.id));

  const [me] = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);

  return NextResponse.json({
    me: {
      email: session.email,
      role: session.role,
      fullName: me?.fullName ?? session.email
    },
    organization: org,
    dues,
    members,
    duesTotals: {
      paid: Number(totals?.paid ?? 0),
      pending: Number(totals?.pending ?? 0),
      overdue: Number(totals?.overdue ?? 0),
      amountPaid: Number(totals?.amountPaid ?? 0)
    }
  });
}

export async function PATCH(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.orgId)
    return NextResponse.json(
      { error: "This account is not linked to an organisation" },
      { status: 403 }
    );
  if (session.role !== "ORG_ADMIN" && session.role !== "SUPER_ADMIN")
    return NextResponse.json(
      { error: "Only organisation admins can update the profile" },
      { status: 403 }
    );

  const parsed = portalProfileSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error: `Invalid update — ${detail}` }, { status: 400 });
  }

  const d = parsed.data;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.orgId))
    .limit(1);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const [updated] = await db
    .update(organizations)
    .set({
      email: d.email,
      phonePrimary: d.phonePrimary,
      phoneSecondary: d.phoneSecondary ?? null,
      website: d.website || null,
      digitalAddress: d.digitalAddress ?? null,
      physicalAddress: d.physicalAddress,
      missionStatement: d.missionStatement ?? null,
      leaderName: d.leaderName ?? null,
      ministryFocus: d.ministryFocus ?? [],
      socialLinks: d.socialLinks ?? {},
      logoR2Key: d.logoR2Key !== undefined ? d.logoR2Key : org.logoR2Key,
      bannerR2Key: d.bannerR2Key !== undefined ? d.bannerR2Key : org.bannerR2Key,
      updatedAt: new Date()
    })
    .where(and(eq(organizations.id, session.orgId)))
    .returning();

  return NextResponse.json({ organization: updated });
}