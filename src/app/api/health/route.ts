import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { set: boolean; ok?: boolean; error?: string }> = {
    DATABASE_URL: { set: Boolean(process.env.DATABASE_URL) },
    JWT_SECRET: { set: Boolean(process.env.JWT_SECRET) },
    R2_ACCOUNT_ID: { set: Boolean(process.env.R2_ACCOUNT_ID) },
    R2_ACCESS_KEY_ID: { set: Boolean(process.env.R2_ACCESS_KEY_ID) },
    R2_SECRET_ACCESS_KEY: { set: Boolean(process.env.R2_SECRET_ACCESS_KEY) }
  };

  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`select 1`);
      checks.DATABASE_URL.ok = true;
    } catch (e) {
      checks.DATABASE_URL.ok = false;
      checks.DATABASE_URL.error = e instanceof Error ? e.message.slice(0, 300) : "connection failed";
    }
  }

  const healthy = Boolean(process.env.DATABASE_URL) && checks.DATABASE_URL.ok === true;
  return NextResponse.json({ healthy, checks }, { status: healthy ? 200 : 503 });
}