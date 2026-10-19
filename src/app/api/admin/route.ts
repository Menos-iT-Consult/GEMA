import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, duesRecords, users } from "@/lib/db/schema";
import { readSession } from "@/lib/auth";
import {
  updateStatusSchema,
  createDuesSchema,
  updateDuesSchema,
  updateUserSchema
} from "@/lib/validators";
import { eq, sql, and, inArray, desc, gte, type SQL } from "drizzle-orm";

async function assertAdmin() {
  const s = await readSession();
  if (!s || (s.role !== "SUPER_ADMIN" && s.role !== "REGIONAL_OVERSEER")) return null;
  return s;
}

const STATUS_KEYS = [
  "PENDING_REVIEW",
  "UNDER_VETTING",
  "APPROVED",
  "SUSPENDED",
  "RENEWAL_DUE"
] as const;

export async function GET() {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Regional overseers only see data for their assigned region
  const scope: SQL | undefined =
    session.role === "REGIONAL_OVERSEER" && session.assignedRegion
      ? eq(organizations.region, session.assignedRegion as never)
      : undefined;

  // Status counts (all five statuses)
  const statusRows = await Promise.all(
    STATUS_KEYS.map((k) =>
      db
        .select({ c: sql<number>`count(*)` })
        .from(organizations)
        .where(scope ? and(eq(organizations.status, k), scope) : eq(organizations.status, k))
    )
  );
  const statusCounts = Object.fromEntries(
    STATUS_KEYS.map((k, i) => [k, Number(statusRows[i][0]?.c ?? 0)])
  );

  const [totalRow] = await db
    .select({ c: sql<number>`count(*)` })
    .from(organizations)
    .where(scope);
  const total = Number(totalRow?.c ?? 0);

  const byRegion = await db
    .select({ key: organizations.region, count: sql<number>`count(*)` })
    .from(organizations)
    .where(scope)
    .groupBy(organizations.region)
    .orderBy(desc(sql`count(*)`));

  const byDenomination = await db
    .select({ key: organizations.denomination, count: sql<number>`count(*)` })
    .from(organizations)
    .where(scope)
    .groupBy(organizations.denomination)
    .orderBy(desc(sql`count(*)`));

  const byUmbrella = await db
    .select({ key: organizations.umbrellaBody, count: sql<number>`count(*)` })
    .from(organizations)
    .where(scope)
    .groupBy(organizations.umbrellaBody)
    .orderBy(desc(sql`count(*)`));

  // New organizations this month (region-scoped)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [newMonthRow] = await db
    .select({ c: sql<number>`count(*)` })
    .from(organizations)
    .where(
      scope ? and(gte(organizations.createdAt, monthStart), scope) : gte(organizations.createdAt, monthStart)
    );
  const newThisMonth = Number(newMonthRow?.c ?? 0);

  // Approval queue: pending review + under vetting (region-scoped)
  const queueCond = scope
    ? and(inArray(organizations.status, ["PENDING_REVIEW", "UNDER_VETTING"]), scope)
    : inArray(organizations.status, ["PENDING_REVIEW", "UNDER_VETTING"]);
  const pendingQueue = await db
    .select()
    .from(organizations)
    .where(queueCond)
    .orderBy(organizations.createdAt)
    .limit(50);

  // All organizations for the management table (region-scoped)
  const orgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      status: organizations.status,
      region: organizations.region,
      cityTown: organizations.cityTown,
      email: organizations.email,
      denomination: organizations.denomination,
      umbrellaBody: organizations.umbrellaBody,
      createdAt: organizations.createdAt
    })
    .from(organizations)
    .where(scope)
    .orderBy(desc(organizations.createdAt))
    .limit(500);

  // Dues: totals + list with organisation names
  const [duesAgg] = await db
    .select({
      collected: sql<number>`count(*) filter (where status = 'PAID')`,
      totalGhs: sql<number>`coalesce(sum(amount_ghs) filter (where status = 'PAID'), 0)`,
      pending: sql<number>`count(*) filter (where status = 'PENDING')`,
      overdue: sql<number>`count(*) filter (where status = 'OVERDUE')`
    })
    .from(duesRecords)
    .innerJoin(organizations, eq(duesRecords.orgId, organizations.id))
    .where(scope);

  const dues = await db
    .select({
      id: duesRecords.id,
      orgId: duesRecords.orgId,
      orgName: organizations.name,
      year: duesRecords.year,
      amountGhs: duesRecords.amountGhs,
      status: duesRecords.status,
      paymentReference: duesRecords.paymentReference,
      paidAt: duesRecords.paidAt,
      createdAt: duesRecords.createdAt
    })
    .from(duesRecords)
    .leftJoin(organizations, eq(duesRecords.orgId, organizations.id))
    .orderBy(desc(duesRecords.createdAt))
    .limit(100);

  // Users (super admin only — excludes password hashes)
  const userList =
    session.role === "SUPER_ADMIN"
      ? await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            assignedRegion: users.assignedRegion,
            orgName: organizations.name,
            createdAt: users.createdAt
          })
          .from(users)
          .leftJoin(organizations, eq(users.orgId, organizations.id))
          .orderBy(desc(users.createdAt))
          .limit(200)
      : [];

  return NextResponse.json({
    me: { email: session.email, role: session.role, assignedRegion: session.assignedRegion ?? null },
    stats: {
      total,
      approved: statusCounts.APPROVED,
      pending: statusCounts.PENDING_REVIEW,
      underVetting: statusCounts.UNDER_VETTING,
      suspended: statusCounts.SUSPENDED,
      renewalDue: statusCounts.RENEWAL_DUE,
      duesCollected: Number(duesAgg?.collected ?? 0),
      duesTotalGhs: Number(duesAgg?.totalGhs ?? 0),
      duesPending: Number(duesAgg?.pending ?? 0),
      duesOverdue: Number(duesAgg?.overdue ?? 0),
      newThisMonth
    },
    statusCounts,
    byRegion,
    byDenomination,
    byUmbrella,
    pendingQueue,
    orgs,
    dues,
    users: userList
  });
}



export async function PATCH(req: NextRequest) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  // Update a dues record (mark paid / pending / overdue)
  if ("duesId" in body) {
    const parsed = updateDuesSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid dues update" }, { status: 400 });
    const [updated] = await db
      .update(duesRecords)
      .set({
        status: parsed.data.status,
        ...(parsed.data.paymentReference !== undefined
          ? { paymentReference: parsed.data.paymentReference }
          : {}),
        paidAt: parsed.data.status === "PAID" ? new Date() : null
      })
      .where(eq(duesRecords.id, parsed.data.duesId))
      .returning();
    if (!updated) return NextResponse.json({ error: "Dues record not found" }, { status: 404 });
    return NextResponse.json({ dues: updated });
  }

  // Update a user (activate / deactivate, change role)
  if ("userId" in body) {
    if (session.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "Super admin only" }, { status: 403 });
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid user update" }, { status: 400 });
    if (parsed.data.userId === session.sub)
      return NextResponse.json({ error: "You cannot modify your own account" }, { status: 400 });
    const [updated] = await db
      .update(users)
      .set({
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
        ...(parsed.data.role !== undefined ? { role: parsed.data.role as never } : {})
      })
      .where(eq(users.id, parsed.data.userId))
      .returning();
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({
      user: { id: updated.id, role: updated.role, isActive: updated.isActive }
    });
  }

  // Update organisation status
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid status update" }, { status: 400 });

  const [target] = await db
    .select({ region: organizations.region })
    .from(organizations)
    .where(eq(organizations.id, parsed.data.id))
    .limit(1);
  if (!target) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  if (
    session.role === "REGIONAL_OVERSEER" &&
    session.assignedRegion &&
    target.region !== session.assignedRegion
  )
    return NextResponse.json({ error: "Outside your assigned region" }, { status: 403 });

  const [updated] = await db
    .update(organizations)
    .set({ status: parsed.data.status as never, updatedAt: new Date() })
    .where(eq(organizations.id, parsed.data.id))
    .returning();
  return NextResponse.json({ organization: updated });
}

export async function POST(req: NextRequest) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createDuesSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid dues record" }, { status: 400 });

  if (session.role === "REGIONAL_OVERSEER" && session.assignedRegion) {
    const [org] = await db
      .select({ region: organizations.region })
      .from(organizations)
      .where(eq(organizations.id, parsed.data.orgId))
      .limit(1);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    if (org.region !== session.assignedRegion)
      return NextResponse.json({ error: "Outside your assigned region" }, { status: 403 });
  }

  const [row] = await db
    .insert(duesRecords)
    .values({ ...parsed.data, status: parsed.data.status as never })
    .returning();
  return NextResponse.json({ dues: row }, { status: 201 });
}
