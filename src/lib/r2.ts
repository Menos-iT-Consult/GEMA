import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function r2Endpoint(): string {
  const account = process.env.R2_ACCOUNT_ID;
  const explicit = process.env.R2_ENDPOINT;
  if (explicit) {
    try {
      const u = new URL(explicit);
      if (u.hostname.includes(".")) return explicit.replace(/\/$/, "");
    } catch {
      // fall through to account-id derivation
    }
    if (!account) throw new Error("R2_ENDPOINT is not a valid URL and R2_ACCOUNT_ID is not set");
  }
  if (!account) throw new Error("R2_ACCOUNT_ID or R2_ENDPOINT must be set");
  return `https://${account}.r2.cloudflarestorage.com`;
}

export function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? ""
    }
  });
}

export function bucketName(): string {
  const b = process.env.R2_BUCKET_NAME;
  if (!b) throw new Error("R2_BUCKET_NAME must be set");
  return b;
}

export type UploadKind = "logos" | "banners" | "legal-docs" | "receipts";

const CONTENT_TYPES: Record<UploadKind, string[]> = {
  logos: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  banners: ["image/png", "image/jpeg", "image/webp"],
  "legal-docs": ["application/pdf", "image/png", "image/jpeg"],
  receipts: ["application/pdf", "image/png", "image/jpeg"]
};

export function buildR2Key(kind: UploadKind, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${kind}/${new Date().getFullYear()}/${randomUUID()}-${safe}`;
}

export async function createPresignedUploadUrl(params: {
  kind: UploadKind;
  fileName: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; r2Key: string; publicUrl: string | null }> {
  const allowed = CONTENT_TYPES[params.kind];
  if (!allowed.includes(params.contentType)) {
    throw new Error(
      `contentType "${params.contentType}" is not allowed for ${params.kind}; allowed: ${allowed.join(", ")}`
    );
  }
  const key = buildR2Key(params.kind, params.fileName);
  const cmd = new PutObjectCommand({
    Bucket: bucketName(),
    Key: key,
    ContentType: params.contentType
  });
  const uploadUrl = await getSignedUrl(r2Client(), cmd, {
    expiresIn: params.expiresInSeconds ?? 900
  });
  const base = process.env.R2_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  return { uploadUrl, r2Key: key, publicUrl: base ? `${base}/${key}` : null };
}

export async function createPresignedDownloadUrl(
  r2Key: string,
  expiresInSeconds = 900
): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: bucketName(), Key: r2Key });
  return getSignedUrl(r2Client(), cmd, { expiresIn: expiresInSeconds });
}

export function publicR2Url(r2Key: string | null | undefined): string | null {
  if (!r2Key) return null;
  const base = process.env.R2_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base}/${r2Key}`;
}
