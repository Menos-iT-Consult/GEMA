"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
      if (!r.ok) {
        let msg = "Login failed. Please try again.";
        try {
          const data = await r.json();
          if (data?.error) msg = data.error;
          if (data?.detail) msg += ` — ${data.detail}`;
        } catch { /* non-JSON response (e.g. 500 HTML) */ }
        if (r.status >= 500 && !msg.includes("—")) msg = `Server error (${r.status}). Please try again later.`;
        setErr(msg); setBusy(false); return;
      }
      router.push("/admin");
    } catch {
      setErr("Network error — could not reach the server."); setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <div className="gm-card p-8">
        <h1 className="font-serif text-2xl font-bold text-navy-950">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Super Admin / Regional Overseer</p>
        {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <form onSubmit={go} className="mt-5 grid gap-4">
          <div><label className="gm-label">Email</label><input className="gm-input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="gm-label">Password</label><input type="password" className="gm-input" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <button className="gm-btn-primary" disabled={busy}>{busy ? "…" : "Sign In"}</button>
        </form>
      </div>
    </main>
  );
}
