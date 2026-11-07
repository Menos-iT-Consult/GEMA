"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw })
      });
      if (!r.ok) {
        let msg = "Login failed. Please try again.";
        try {
          const data = await r.json();
          if (data?.error) msg = data.error;
          if (data?.detail) msg += ` — ${data.detail}`;
        } catch {
          /* non-JSON response (e.g. 500 HTML) */
        }
        if (r.status >= 500 && !msg.includes("—"))
          msg = `Server error (${r.status}). Please try again later.`;
        setErr(msg);
        setBusy(false);
        return;
      }
      const data = await r.json().catch(() => null);
      // Only organisation-linked accounts have a portal; send everyone else
      // to the admin dashboard where their role applies.
      router.push(data?.role === "ORG_ADMIN" || data?.role === "MEMBER_VIEWER" ? "/portal" : "/admin");
    } catch {
      setErr("Network error — could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <div className="gm-card p-8">
        <h1 className="font-serif text-2xl font-bold text-navy-950">Organisation Portal</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to manage your ministry profile, dues and members.
        </p>
        {err && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>
        )}
        <form onSubmit={go} className="mt-5 grid gap-4">
          <div>
            <label className="gm-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="gm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="gm-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="gm-input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>
          <button className="gm-btn-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">
          Secretariat?{" "}
          <Link href="/admin/login" className="font-semibold text-royal-600 underline">
            Use the admin login
          </Link>
        </p>
      </div>
    </main>
  );
}
