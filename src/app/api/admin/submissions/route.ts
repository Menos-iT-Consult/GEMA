import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { readSession } from "@/lib/auth";
import { createPresignedDownloadUrl } from "@/lib/r2";
import { db } from "@/lib/db";
import { organizationSubmissions, organizations, users } from "@/lib/db/schema";

async function assertSuperAdmin() {
  const session = await readSession();
  return session?.role === "SUPER_ADMIN" ? session : null;
}

export async function GET() {
  const session = await assertSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submissions = await db
    .select({
      id: organizationSubmissions.id,
      orgName: organizations.name,
      region: organizations.region,
      submittedBy: users.fullName,
      submitterEmail: users.email,
      title: organizationSubmissions.title,
      message: organizationSubmissions.message,
      attachments: organizationSubmissions.attachments,
      status: organizationSubmissions.status,
      createdAt: organizationSubmissions.createdAt,
      reviewedAt: organizationSubmissions.reviewedAt
    })
    .from(organizationSubmissions)
    .innerJoin(organizations, eq(organizationSubmissions.orgId, organizations.id))
    .leftJoin(users, eq(organizationSubmissions.submittedBy, users.id))
    .orderBy(desc(organizationSubmissions.createdAt))
    .limit(200);

  const items = await Promise.all(
    submissions.map(async (submission) => ({
      ...submission,
      attachments: await Promise.all(
        submission.attachments.map(async (attachment) => ({
          ...attachment,
          url: await createPresignedDownloadUrl(attachment.key)
        }))
      )
    }))
  );

  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const session = await assertSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid submission ID is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(organizationSubmissions)
    .set({
      status: "REVIEWED",
      reviewedAt: new Date()
    })
    .where(eq(organizationSubmissions.id, parsed.data.id))
    .returning({ id: organizationSubmissions.id });

  if (!updated) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  return NextResponse.json({ id: updated.id, status: "REVIEWED" });
}
