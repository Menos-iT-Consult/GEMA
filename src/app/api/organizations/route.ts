import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const region = searchParams.get("region") ?? "";
  const denomination = searchParams.get("denomination") ?? "";
  const umbrellaBody = searchParams.get("umbrellaBody") ?? "";
  const focus = searchParams.get("focus") ?? "";
  const status = searchParams.get("status") ?? "APPROVED";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "12")));
  const offset = (page - 1) * pageSize;

  const filters = [];
  if (status && status !== "ALL") filters.push(eq(organizations.status, status as never));
  if (region) filters.push(eq(organizations.region, region as never));
  if (denomination) filters.push(eq(organizations.denomination, denomination));
  if (umbrellaBody) filters.push(eq(organizations.umbrellaBody, umbrellaBody as never));
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

  return NextResponse.json({
    items,
    page,
    pageSize,
    total: Number(countRes[0]?.count ?? items.length),
    totalPages: Math.ceil(Number(countRes[0]?.count ?? items.length) / pageSize)
  });
}
