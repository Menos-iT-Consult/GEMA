"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { FileText, Image, Send } from "lucide-react";
import { uploadViaPresign } from "@/lib/upload";

type Submission = {
  id: string;
  title: string;
  message: string;
  status: "NEW" | "REVIEWED";
  createdAt: string;
  attachments: { key: string; fileName: string; contentType: string; url: string }[];
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_TYPES: Record<string, string> = {
  "application/pdf": "application/pdf",
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/webp": "image/webp"
};
const EXTENSION_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp"
};

function getContentType(file: File) {
  if (FILE_TYPES[file.type]) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[extension] ?? "";
}

export default function PortalSubmissions() {
  const [items, setItems] = useState<Submission[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/submissions");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Could not load submissions (${response.status})`);
      setItems(data.items);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const formData = new FormData(event.currentTarget);
      const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
      if (files.length > 10) throw new Error("You can attach up to 10 files.");
      for (const file of files) {
        if (!getContentType(file)) throw new Error(`${file.name} is not a supported PDF or image.`);
        if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} exceeds the 10 MB per-file limit.`);
      }

      const attachments = await Promise.all(
        files.map(async (file) => ({
          key: await uploadViaPresign(file, "reports"),
          fileName: file.name,
          contentType: getContentType(file)
        }))
      );

      const response = await fetch("/api/portal/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, attachments })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Submission failed (${response.status})`);

      setTitle("");
      setMessage("");
      formRef.current?.reset();
      setNotice("Your report has been sent to the central administration team.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send your report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="gm-card p-5 sm:p-6">
        <h2 className="font-serif text-xl font-bold text-navy-950">Send a report to GEMA</h2>
        <p className="mt-1 text-sm text-slate-600">
          Share an update with the central administration team and attach reports or photos.
        </p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</p>}
        <form ref={formRef} onSubmit={submit} className="mt-5 grid gap-4">
          <div>
            <label className="gm-label" htmlFor="submission-title">Subject</label>
            <input
              id="submission-title"
              className="gm-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="submission-message">Message or report summary</label>
            <textarea
              id="submission-message"
              className="gm-input min-h-32"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              required
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="submission-attachments">Reports and photos</label>
            <input
              id="submission-attachments"
              name="attachments"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              multiple
              className="gm-input file:mr-3 file:rounded-lg file:border-0 file:bg-gema-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gema-800"
            />
            <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG, or WebP; up to 10 files, 10 MB each.</p>
          </div>
          <button type="submit" className="gm-btn-primary" disabled={busy}>
            <Send className="h-4 w-4" />
            {busy ? "Uploading and sending…" : "Send to central admin"}
          </button>
        </form>
      </section>

      <section className="gm-card p-5 sm:p-6">
        <h2 className="font-serif text-xl font-bold text-navy-950">Sent reports</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading submissions…</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">You haven’t sent any reports yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-navy-950">{item.title}</h3>
                  <span className={`gm-badge ${item.status === "REVIEWED" ? "bg-emerald-100 text-emerald-800" : "bg-ochre-100 text-ochre-800"}`}>
                    {item.status === "REVIEWED" ? "Reviewed" : "Sent"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
                {item.attachments.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {item.attachments.map((file) => {
                      const isImage = file.contentType.startsWith("image/");
                      const Icon = isImage ? Image : FileText;
                      return (
                        <li key={file.key}>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-royal-700 underline"
                          >
                            <Icon className="h-4 w-4" />
                            {file.fileName}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
