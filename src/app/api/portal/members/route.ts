import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { readSession, hashPassword, normalizeEmail } from "@/lib/auth";
import { portalMemberCreateSchema, portalMemberUpdateSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

/**
 * Member management for the organisation portal.
 *
 * Every operation is scoped to the signed-in organisation — a portal admin can
 * only ever see and manage accounts attached to their own `orgId`.
 */
async function assertOrgAdmin() {
  const session = await readSession();
  if (!session) return { error: "Unauthorized", status: 401 } as const;
  if (!session.orgId)
    return { error: "This account is not linked to an organisation", status: 403 } as const;
  if (session.role !== "ORG_ADMIN")
    return { error: "Only organisation admins can manage members", status: 403 } as const;

  // A session cookie is valid for 7 days; re-check that the account is still
  // active so a deactivated admin cannot keep making changes.
  const [account] = await db
    .select({ isActive: users.isActive })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);
  if (account && account.isActive === 0)
    return { error: "This account has been deactivated", status: 403 } as const;

  return { session } as const;
}

export async function POST(req: NextRequest) {
  const auth = await assertOrgAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = portalMemberCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error: `Invalid member — ${detail}` }, { status: 400 });
  }

  const d = parsed.data;

  const normalizedEmail = normalizeEmail(d.email);
  const existing = await db
    .select({ id: users.id, orgId: users.orgId })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  if (existing.length)
    return NextResponse.json(
      { error: "A user with that email already exists" },
      { status: 409 }
    );

  const [created] = await db
    .insert(users)
    .values({
      orgId: auth.session.orgId as string,
      fullName: d.fullName,
      email: normalizedEmail,
      passwordHash: await hashPassword(d.password),
      role: d.role
    })
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    });

  return NextResponse.json({ member: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await assertOrgAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = portalMemberUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error: `Invalid update — ${detail}` }, { status: 400 });
  }

  const d = parsed.data;

  // The target member must belong to the signed-in organisation.
  const [target] = await db
    .select({ id: users.id, orgId: users.orgId })
    .from(users)
    .where(eq(users.id, d.userId))
    .limit(1);
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.orgId !== auth.session.orgId)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Never allow the last active organisation admin to lock themselves out.
  if (d.isActive === 0 || (d.role && d.role !== "ORG_ADMIN")) {
    const [self] = await db
      .select({ id: users.id, role: users.role, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, auth.session.sub))
      .limit(1);
    const demotingSelf =
      self &&
      auth.session.orgId &&
      d.userId === self.id &&
      (d.isActive === 0 || (d.role && d.role !== self.role));
    if (demotingSelf) {
      return NextResponse.json(
        { error: "You cannot remove your own admin access" },
        { status: 400 }
      );
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      ...(d.role !== undefined ? { role: d.role } : {})
    })
    .where(and(eq(users.id, d.userId), eq(users.orgId, auth.session.orgId as string)))
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    });

  if (!updated) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json({ member: updated });
}
