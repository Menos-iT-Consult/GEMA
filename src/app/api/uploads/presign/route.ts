import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPresignedUploadUrl, type UploadKind } from "@/lib/r2";

const bodySchema = z.object({
  kind: z.enum(["logos", "banners", "legal-docs", "receipts"]),
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120)
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error: `Invalid upload request — ${detail}` }, { status: 400 });
  }

  try {
    const result = await createPresignedUploadUrl({
      kind: parsed.data.kind as UploadKind,
      fileName: parsed.data.fileName,
      contentType: parsed.data.contentType
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload signing failed";
    if (message.includes("must be set") || message.includes("not a valid URL") || message === "Invalid URL") {
      // Server misconfiguration (R2 env vars missing, e.g. not set on Vercel) — not a client error.
      return NextResponse.json(
        {
          error:
            "Uploads are not configured on this server: set R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME in the environment."
        },
        { status: 500 }
      );
    }
    // e.g. contentType not allowed for this upload kind — the client sent something we won't sign.
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

