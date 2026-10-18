export type UploadKind = "logos" | "banners" | "legal-docs" | "receipts";

export async function uploadViaPresign(file: File, kind: UploadKind): Promise<string> {
  const presign = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, fileName: file.name, contentType: file.type })
  }).then((r) => r.json());
  if (!presign.uploadUrl) throw new Error(presign.error || "Could not get upload URL");
  await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return presign.r2Key as string;
}
