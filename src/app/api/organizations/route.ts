import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const region = searchParams.get("region") ?? "";
  const denomination = searchParams.get("denomination") ?? "";
  const umbrellaBody = searchParams.get("umbrellaBody") ?? "";
  const focus = searchParams.get("focus") ?? "";
  const slug = searchParams.get("slug") ?? "";
  const includeStats = searchParams.get("includeStats") === "true";
  const status = searchParams.get("status") ?? "APPROVED";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "12")));
  const offset = (page - 1) * pageSize;

  const filters = [];
  if (status && status !== "ALL") filters.push(eq(organizations.status, status as never));
  if (region) filters.push(eq(organizations.region, region as never));
  if (denomination) filters.push(eq(organizations.denomination, denomination));
  if (umbrellaBody) filters.push(eq(organizations.umbrellaBody, umbrellaBody as never));
  if (slug) filters.push(eq(organizations.slug, slug));
  if (q) {
    filters.push(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      or(
        ilike(organizations.name, `%${q}%`),
        ilike(organizations.leaderName, `%${q}%`),
        ilike(organizations.cityTown, `%${q}%`)
      ) as any
    );
  }

  const where = filters.length ? and(...filters) : undefined;

  let items = await db
    .select()
    .from(organizations)
    .where(where)
    .limit(pageSize)
    .offset(offset)
    .orderBy(organizations.name);

  if (focus) {
    items = items.filter((o) => (o.ministryFocus ?? []).includes(focus));
  }

  const countRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(organizations)
    .where(where);

  let stats;
  if (includeStats) {
    const approvedFilter = eq(organizations.status, "APPROVED");
    const [organizationStats, memberStats, regionalStats] = await Promise.all([
      db
        .select({
          count: sql<number>`count(*)`,
          regions: sql<number>`count(distinct ${organizations.region})`
        })
        .from(organizations)
        .where(approvedFilter),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .innerJoin(organizations, eq(users.orgId, organizations.id))
        .where(and(approvedFilter, eq(users.isActive, 1))),
      db
        .select({
          region: organizations.region,
          count: sql<number>`count(*)`
        })
        .from(organizations)
        .where(approvedFilter)
        .groupBy(organizations.region)
        .orderBy(desc(sql`count(*)`))
        .limit(3)
    ]);

    stats = {
      verifiedOrganizations: Number(organizationStats[0]?.count ?? 0),
      representedRegions: Number(organizationStats[0]?.regions ?? 0),
      activeMembers: Number(memberStats[0]?.count ?? 0),
      regions: regionalStats.map(({ region, count }) => ({
        region,
        count: Number(count)
      }))
    };
  }

  return NextResponse.json({
    items,
    page,
    pageSize,
    total: Number(countRes[0]?.count ?? items.length),
    totalPages: Math.ceil(Number(countRes[0]?.count ?? items.length) / pageSize),
    ...(stats ? { stats } : {})
  });
}
