import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword, signSession, AUTH_COOKIE } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("LOGIN ERROR: DATABASE_URL is not set on the server");
      return NextResponse.json(
        { error: "Server configuration error: DATABASE_URL is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = await signSession({
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      assignedRegion: user.assignedRegion
    });
    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set(AUTH_COOKIE, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
    return res;
  } catch (e) {
    // Log the full error server-side (visible in Vercel Functions logs)
    console.error("LOGIN ERROR:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    // Safe, non-sensitive summary for the client to aid debugging
    return NextResponse.json(
      { error: "Login failed: database connection error", detail: message.slice(0, 300) },
      { status: 500 }
    );
  }
}
