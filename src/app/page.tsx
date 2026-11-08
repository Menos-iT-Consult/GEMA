"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Compass,
  Users,
  MapPin,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const OCHRE = "#f47728";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Verified Network",
    description:
      "A trusted directory built to help ministries, churches, and leaders connect with clarity and confidence.",
  },
  {
    icon: Compass,
    title: "Mission-Focused Discovery",
    description:
      "Search by region, denomination, umbrella body, or ministry focus to discover aligned leaders and communities.",
  },
  {
    icon: Users,
    title: "Collaborative Growth",
    description:
      "Build relationships across Ghana with a platform designed for visibility, connection, and spiritual partnership.",
  },
];

const regionalSpotlight = [
  { region: "Greater Accra", ministries: 84 },
  { region: "Ashanti", ministries: 72 },
  { region: "Northern", ministries: 58 },
];

export default function HomePage() {
  const [statsData, setStatsData] = useState({
    regions: "--",
    ministries: "--",
    partnerships: "--"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/organizations?status=APPROVED&pageSize=1", {
          cache: "no-store"
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        if (active) {
          const totalMinistries = data.total ?? 0;
          setStatsData({
            regions: "16",
            ministries: totalMinistries.toLocaleString(),
            partnerships: "24"
          });
        }
      } catch (e) {
        console.error("Stats load error:", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-navy-950">
        <div className="max-w-lg mx-auto">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-10 w-16 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 text-sm text-slate-700">Loading...</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="relative bg-slate-50 text-slate-900">
        <div className="absolute inset-x-0 top-16 h-[520px] bg-gradient-to-br from-white via-slate-50 to-emerald-50" />

        <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">

            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-800" />
                Ghana Evangelical Missions Association
              </div>

              <h1 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-tight text-navy-950 sm:text-5xl lg:text-6xl">
                A stronger Gospel network for <span className="font-medium text-ochre-800">Ghana</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
                Unite gospel leaders, churches, and mission organizations under one trusted platform for discovery, partnership, and Kingdom impact.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-navy-950 shadow-sm transition hover:brightness-95" style={{ backgroundColor: OCHRE }}>
                  Join Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/directory" className="rounded-xl border border-emerald-700 bg-white px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50">
                  Explore Directory
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-ochre-800" /> Verified ministries</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-800" /> Across all 16 regions</div>
              </div>
            </div>

            <div className="relative">
              <div className="hero-panel float-slow relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl backdrop-blur-sm">
                <div className="rounded-2xl bg-navy-950 p-5 text-white shadow-xl">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
                    <span>Network Snapshot</span>
                    <span className="rounded-full bg-white px-2 py-1 font-semibold text-navy-950">Live</span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 text-navy-950">
                      <div className="text-4xl font-bold">250+</div>
                      <div className="mt-1 text-sm text-slate-700">Verified members</div>
                    </div>
                    <div className="rounded-2xl bg-amber-100 p-4 text-navy-950 ring-1 ring-amber-200">
                      <div className="text-4xl font-bold">24</div>
                      <div className="mt-1 text-sm text-slate-700">Partnerships</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>Regional coverage</span>
                      <span>16 regions</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {regionalSpotlight.map((item) => (
                        <div key={item.region}>
                          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                            <span>{item.region}</span>
                            <span>{item.ministries}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full" style={{ width: `${item.ministries / 4}%`, backgroundColor: OCHRE }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="float-medium absolute -right-5 bottom-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900"><Building2 className="h-5 w-5" /></div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Mission Lead</div>
                      <div className="font-semibold text-slate-800">Church & Agency Network</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <div key="regions" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm">
              <div className="text-4xl font-bold font-serif text-navy-950">{statsData.regions}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">Regions represented</div>
            </div>
            <div key="ministries" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm">
              <div className="text-4xl font-bold font-serif text-navy-950">{statsData.ministries}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">Verified ministries</div>
            </div>
            <div key="partnerships" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm">
              <div className="text-4xl font-bold font-serif text-navy-950">{statsData.partnerships}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">Active partnerships</div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900">Why GEMA matters</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-navy-950 sm:text-4xl">Built for ministry visibility, connection, and collaboration</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-navy-950">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900">Regional spotlight</p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-navy-950">A network across Ghana</h2>
              </div>
              <Link href="/directory" className="hidden text-sm font-semibold text-emerald-900 hover:text-emerald-700 sm:inline-flex">
                Browse all ministries <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {regionalSpotlight.map((item) => (
                <div key={item.region} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-navy-950">{item.region}</div>
                  <div className="mt-5 text-4xl font-bold text-navy-950">{item.ministries}</div>
                  <div className="mt-2 text-sm text-slate-600">Ministries and organizations</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="rounded-3xl border border-navy-900 bg-navy-950 p-8 text-white shadow-xl sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Ready to take the next step?</p>
                <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Join a movement committed to mission, discipleship, and growth.</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-navy-950 shadow-sm transition hover:brightness-95" style={{ backgroundColor: OCHRE }}>
                  Join Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/admin/login" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}