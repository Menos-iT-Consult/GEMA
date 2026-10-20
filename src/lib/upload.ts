export type UploadKind = "logos" | "banners" | "legal-docs" | "receipts";

/** Fallback MIME map for browsers/OS combos that report an empty File.type. */
const EXT_TO_TYPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf"
};

function resolveContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_TYPE[ext] ?? "application/octet-stream";
}

export async function uploadViaPresign(file: File, kind: UploadKind): Promise<string> {
  // One resolved value is used both to sign and to send, so the signature always matches.
  const contentType = resolveContentType(file);
  const res = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, fileName: file.name, contentType })
  });

  let presign: { uploadUrl?: string; r2Key?: string; error?: string };
  try {
    presign = await res.json();
  } catch {
    throw new Error(`Upload request failed (HTTP ${res.status})`);
  }
  if (!res.ok || !presign.uploadUrl) {
    throw new Error(presign.error || `Upload request failed (HTTP ${res.status})`);
  }

  const put = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file
  });
  if (!put.ok) {
    throw new Error(`Transfer to storage failed (HTTP ${put.status})`);
  }
  return presign.r2Key as string;
}
