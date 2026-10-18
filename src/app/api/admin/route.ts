import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, duesRecords } from "@/lib/db/schema";
import { readSession } from "@/lib/auth";
import { updateStatusSchema, createDuesSchema } from "@/lib/validators";
import { eq, sql } from "drizzle-orm";

async function assertAdmin() {
  const s = await readSession();
  if (!s || (s.role !== "SUPER_ADMIN" && s.role !== "REGIONAL_OVERSEER")) return null;
  return s;
}

export async function GET() {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [total, approved, pending, suspended] = await Promise.all(
    (["TOTAL", "APPROVED", "PENDING_REVIEW", "SUSPENDED"] as const).map(async (k) => {
      if (k === "TOTAL") {
        const r = await db.select({ c: sql<number>`count(*)` }).from(organizations);
        return Number(r[0]?.c ?? 0);
      }
      const r = await db
        .select({ c: sql<number>`count(*)` })
        .from(organizations)
        .where(eq(organizations.status, k as never));
      return Number(r[0]?.c ?? 0);
    })
  );

  const byRegion = await db
    .select({ region: organizations.region, count: sql<number>`count(*)` })
    .from(organizations)
    .groupBy(organizations.region);

  const byDenomination = await db
    .select({ denomination: organizations.denomination, count: sql<number>`count(*)` })
    .from(organizations)
    .groupBy(organizations.denomination);

  const pendingQueue = await db
    .select()
    .from(organizations)
    .where(eq(organizations.status, "PENDING_REVIEW"))
    .limit(25);

  const dues = await db.select().from(duesRecords).limit(100);

  return NextResponse.json({
    stats: { total, approved, pending, suspended, duesCollected: dues.filter((d) => d.status === "PAID").length },
    byRegion,
    byDenomination,
    pendingQueue,
    recentDues: dues.slice(0, 20)
  });
}

export async function PATCH(req: NextRequest) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid dues record" }, { status: 400 });
  const [row] = await db.insert(duesRecords).values({ ...parsed.data, status: parsed.data.status as never }).returning();
  return NextResponse.json({ dues: row }, { status: 201 });
}
