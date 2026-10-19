import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * One-time admin seeding endpoint.
 *
 * Creates (or resets the password of) the seed SUPER_ADMIN account using the
 * ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD env vars set in Vercel.
 *
 * Requires the request to carry the admin password as a token, either:
 *   - header: x-seed-token: <ADMIN_SEED_PASSWORD>
 *   - query:  ?token=<ADMIN_SEED_PASSWORD>
 *
 * Safe by design: without the correct token nothing happens; a successful call
 * only ever writes the credentials defined server-side in the env vars.
 */
async function handle(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 500 });
    }
    const email = process.env.ADMIN_SEED_EMAIL;
    const password = process.env.ADMIN_SEED_PASSWORD;
    if (!email || !password) {
      return NextResponse.json(
        { error: "ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD are not set on the server" },
        { status: 500 }
      );
    }

    const token = req.headers.get("x-seed-token") ?? new URL(req.url).searchParams.get("token");
    if (token !== password) {
      return NextResponse.json({ error: "Invalid seed token" }, { status: 403 });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const passwordHash = await hashPassword(password);

    if (existing) {
      await db.update(users).set({ passwordHash }).where(eq(users.id, existing.id));
      return NextResponse.json({ ok: true, action: "updated", email });
    }

    await db.insert(users).values({
      fullName: "Site Administrator",
      email,
      passwordHash,
      role: "SUPER_ADMIN"
    });
    return NextResponse.json({ ok: true, action: "created", email });
  } catch (e) {
    console.error("SEED ERROR:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Seed failed", detail: message.slice(0, 300) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}