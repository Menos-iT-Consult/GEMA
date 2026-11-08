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

/* ===== BRAND COLORS from gemagh.org ===== */
/* Primary brand colors extracted from gemagh.org website */
const NAVY = "rgb(10, 19, 55)";        /* Primary brand - dark navy */
const ROYAL = "rgb(30, 132, 115)";     /* Accent teal from kubio-color-2 */
const GEMA = "rgb(40, 44, 43)";        /* Dark brand from kubio-color-6 */
const OCHRE = "rgb(244, 119, 40)";     /* Main accent gold from kubio-color-4 */
const OCHRE_LIGHT = "rgb(243, 218, 202)"; /* Light gold variant */
const NAVY_LIGHT = "rgb(16, 111, 95)"; /* Primary brand alternate */
const SLATE_DARK = "rgb(15, 23, 42)";  /* Dark slate for contrast */

/* Color helper functions for consistent usage */
const bg = (c: string) => `bg-${c}`;
const text = (c: string) => `text-${c}`;
const border = (c: string) => `border-${c}`;
const hoverBg = (c: string) => `hover:bg-${c}`;
const hoverText = (c: string) => `hover:text-${c}`;

const stats = [
  { label: "Regions represented", value: "16", accent: ROYAL },
  { label: "Verified ministries", value: "250+", accent: OCHRE },
  { label: "Active partnerships", value: "24", accent: GEMA },
];

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
  { region: "Greater Accra", ministries: 84, color: `from-${NAVY} via-${ROYAL} to-${GEMA}` },
  { region: "Ashanti", ministries: 72, color: `from-${GEMA} via-${OCHRE} to-${GEMA}` },
  { region: "Northern", ministries: 58, color: `from-${OCHRE} via-${GEMA} to-${NAVY}` },
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
      <div className={bg(NAVY)} color={text(NAVY)} p-8>
        <div className="max-w-lg mx-auto">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((_) => (
              <div className={`${bg(NAVY)} border border-slate-200/80 p-6 shadow-lg`}>
                <div className={text(NAVY)} className="text-4xl font-bold font-serif animate-spin" />
                <div className="mt-2 text-sm text-slate-600">Loading...</div>
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

      <main className={bg(NAVY)}>
        <div className={bg(NAVY)} absolute inset-x-0 top-0 h-[520px] />

        <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">

            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-{ROYAL} bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-{ROYAL} shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Ghana Evangelical Missions Association
              </div>

              <h1 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-tight text-{NAVY} sm:text-5xl lg:text-6xl">
                A stronger Gospel network for <span className="font-medium text-{OCHRE}">Ghana</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Unite gospel leaders, churches, and mission organizations under one trusted platform for discovery, partnership, and Kingdom impact.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register" className={bg(OCHRE)} text-{NAVY} px-5 py-3 rounded-xl font-medium transition hover:bg-{OCHRE}500">
                  Join Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/directory" className={border(ROYAL)} text-{ROYAL} px-5 py-3 rounded-xl font-medium transition:hover:bg-{ROYAL}50 hover:text-{ROYAL}900">
                  Explore Directory
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-{OCHRE}" /> Verified ministries</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-{ROYAL}" /> Across all 16 regions</div>
              </div>
            </div>

            <div className="relative">
              <div className="hero-panel float-slow relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl backdrop-blur-sm">
                <div className="rounded-2xl bg-{NAVY} via-{ROYAL} to-{OCHRE} p-5 text-white shadow-xl">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
                    <span>Network Snapshot</span>
                    <span className="rounded-full bg-white px-2 py-1">Live</span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="text-4xl font-bold">250+</div>
                      <div className="mt-1 text-sm text-slate-700">Verified members</div>
                    </div>
                    <div className="rounded-2xl bg-{OCHRE}50/20 p-4 ring-1 ring-{OCHRE}300/40">
                      <div className="text-4xl font-bold">24</div>
                      <div className="mt-1 text-sm text-slate-700">Partnerships</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Regional coverage</span>
                      <span>16 regions</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {regionalSpotlight.map((item) => (
                        <div key={item.region} className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>{item.region}</span>
                          <span>{item.ministries}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white">
                          <div className="h-2 rounded-full bg-{OCHRE}" style={{ width: `${item.ministries / 4}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="float-medium absolute -right-5 bottom-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-{NAVY}50 text-{NAVY}700"><Building2 className="h-5 w-5" /></div>
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
              <div className="text-4xl font-bold font-serif text-{NAVY}">{statsData.regions}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">Regions represented</div>
            </div>
            <div key="ministries" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm">
              <div className="text-4xl font-bold font-serif text-{NAVY}">{statsData.ministries}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">Verified ministries</div>
            </div>
            <div key="partnerships" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm">
              <div className="text-4xl font-bold font-serif text-{NAVY}">{statsData.partnerships}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">Active partnerships</div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-{ROYAL}">Why GEMA matters</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-{NAVY} sm:text-4xl">Built for ministry visibility, connection, and collaboration</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-{ROYAL}200 bg-white p-7 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-{NAVY}50 text-{NAVY}700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-{NAVY}">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative bg-white/80 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-{ROYAL}">Regional spotlight</p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-{NAVY}">A network across Ghana</h2>
              </div>
              <Link href="/directory" className="hidden text-sm font-semibold text-{ROYAL} hover:text-{ROYAL}800 sm:inline-flex">
                Browse all ministries <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {regionalSpotlight.map((item) => (
                <div key={item.region} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold font-bold ${OCHRE}`}>{item.region}</div>
                  <div className="mt-5 text-4xl font-bold text-{NAVY}">{item.ministries}</div>
                  <div className="mt-2 text-sm text-slate-600">Ministries and organizations</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="rounded-3xl border border-{ROYAL}200 bg-gradient-to-r from-{NAVY} via-{ROYAL} to-{OCHRE} p-8 text-white shadow-2xl sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-{OCHRE}300">Ready to take the next step?</p>
                <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Join a movement committed to mission, discipleship, and growth.</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link href="/register" className={bg(OCHRE)} text-{NAVY} px-5 py-3 rounded-xl font-medium transition hover:bg-{OCHRE}500">
                  Join Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/admin/login" className={border("white")} bg-white/10 text-{NAVY} px-5 py-3 rounded-xl border border-white/20 text-sm font-medium text-{NAVY} transition hover:bg-white/15">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>

    <Footer />
  );
}