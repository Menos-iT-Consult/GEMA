import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPresignedUploadUrl, type UploadKind } from "@/lib/r2";

const bodySchema = z.object({
  kind: z.enum(["logos", "banners", "legal-docs", "receipts"]),
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120)
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
    }
    const result = await createPresignedUploadUrl({
      kind: parsed.data.kind as UploadKind,
      fileName: parsed.data.fileName,
      contentType: parsed.data.contentType
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload signing failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
