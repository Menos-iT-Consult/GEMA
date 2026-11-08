import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getActiveOrganizationSession } from "@/lib/portal-access";
import { createPresignedDownloadUrl } from "@/lib/r2";
import { db } from "@/lib/db";
import { organizationSubmissions } from "@/lib/db/schema";

const attachmentSchema = z.object({
  key: z.string().min(1).max(500),
  fileName: z.string().min(1).max(200),
  contentType: z.enum(["application/pdf", "image/png", "image/jpeg", "image/webp"])
});

const submissionSchema = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(1).max(5000),
  attachments: z.array(attachmentSchema).max(10)
});

export async function GET() {
  const access = await getActiveOrganizationSession();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const submissions = await db
    .select()
    .from(organizationSubmissions)
    .where(eq(organizationSubmissions.orgId, access.orgId))
    .orderBy(desc(organizationSubmissions.createdAt))
    .limit(50);

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

export async function POST(req: NextRequest) {
  const access = await getActiveOrganizationSession();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    return NextResponse.json({ error: `Invalid submission — ${detail}` }, { status: 400 });
  }

  if (parsed.data.attachments.some((file) => !file.key.startsWith(`reports/${access.orgId}/`))) {
    return NextResponse.json(
      { error: "Attachments must be uploaded by your organisation" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(organizationSubmissions)
    .values({
      orgId: access.orgId,
      submittedBy: access.session.sub,
      title: parsed.data.title,
      message: parsed.data.message,
      attachments: parsed.data.attachments
    })
    .returning({
      id: organizationSubmissions.id,
      title: organizationSubmissions.title,
      status: organizationSubmissions.status,
      createdAt: organizationSubmissions.createdAt
    });

  return NextResponse.json({ submission: created }, { status: 201 });
}
