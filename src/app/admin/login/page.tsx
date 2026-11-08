"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    fetch("/api/admin", { cache: "no-store" })
      .then((r) => {
        if (!active && !r.ok) return;
        if (r.ok) router.replace("/admin");
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [router]);

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
          // non-JSON response (e.g. 500 HTML)
        }

        if (r.status >= 500 && !msg.includes("—")) {
          msg = `Server error (${r.status}). Please try again later.`;
        }

        setErr(msg);
        setBusy(false);
        return;
      }

      router.push("/admin");
    } catch {
      setErr("Network error — could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gema-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(8,8,31,0.10)]">
        <div className="grid min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-navy-950 via-royal-700 to-gema-700 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(244,119,40,0.18),_transparent_35%)]" />
            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to site
              </Link>

              <div className="mt-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ochre-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Secure access
                </div>
                <h1 className="mt-6 max-w-md font-serif text-4xl font-bold leading-tight">
                  Admin portal for trusted ministry oversight
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-slate-200">
                  Review ministry applications, manage directories, and support the wider GEMA network with confidence.
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {[
                { icon: ShieldCheck, text: "Verified access for approved administrators" },
                { icon: CheckCircle2, text: "Review applications and approval workflows" },
                { icon: LockKeyhole, text: "Protected by secure session management" }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-ochre-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-100">{text}</span>
                </div>
              ))}
            </div>
          </aside>

          <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-royal-600">GEMA</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-navy-950">Admin Login</h2>
                <p className="mt-2 text-sm text-slate-600">Sign in to continue to the Secretariat dashboard.</p>
              </div>

              {err && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {err}
                </div>
              )}

              <form onSubmit={go} className="space-y-5">
                <div>
                  <label htmlFor="email" className="gm-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="gm-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gema.org"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="gm-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="gm-input"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button className="gm-btn-primary w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Need a different portal?</span>
                <Link href="/portal/login" className="font-semibold text-royal-600 underline">
                  Organisation login
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
