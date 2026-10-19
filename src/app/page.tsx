"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ShieldCheck, MapPinned, HandCoins } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-navy-950 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(600px 300px at 15% 20%, #2563eb55, transparent), radial-gradient(500px 260px at 85% 30%, #d9770655, transparent)"
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ochre-300">
              Evangelical Association • Ghana
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-6xl">
              One directory for every mission, church & ministry in Ghana.
            </h1>
            <p className="mt-5 max-w-2xl text-slate-300 sm:text-lg">
              Discover verified evangelical organizations across all 16 regions — search by
              denomination, umbrella body and ministry focus, verify credentials, and connect.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/directory" className="gm-btn-gold">
                <Search className="h-4 w-4" /> Explore Directory
              </Link>
            </div>
            <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4 text-center">
              {[
                ["16", "Regions"],
                ["4", "Umbrella Bodies"],
                ["100%", "Verified"]
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-serif text-3xl font-bold text-ochre-300">{v}</dd>
                  <dd className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-300">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl">
            Built for trust, discovery and accountability
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verification Portal",
                text: "Statement-of-faith affirmation, RGD numbers and R2-stored credentials reviewed by admins."
              },
              {
                icon: MapPinned,
                title: "Regional Discovery",
                text: "Filter by all 16 regions, GhanaPost GPS digital addresses, cities and ministry focus."
              },
              {
                icon: HandCoins,
                title: "Dues & Compliance",
                text: "Track annual subscriptions in GHS, receipts and renewal status from one dashboard."
              }
            ].map((f) => (
              <div key={f.title} className="gm-card p-6">
                <f.icon className="h-8 w-8 text-royal-600" />
                <h3 className="mt-3 font-serif text-lg font-bold text-navy-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
