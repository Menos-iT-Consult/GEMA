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

const NAVY = "bg-navy-950 text-navy-950";
const ROYAL = "bg-royal-100 text-royal-700";
const GEMA = "bg-gema-100 text-gema-700";
const OCHRE = "bg-ochre-100 text-ochre-700";
const ACCENT_GOLD = "bg-ochre-500 text-white";
const SUBTLE = "bg-slate-50 text-slate-700";

const stats = [
  { label: "Regions represented", value: "16", accent: ROYAL },
  { label: "Verified ministries", value: "250+", accent: GEMA },
  { label: "Active partnerships", value: "24", accent: OCHRE },
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
  { region: "Greater Accra", ministries: 84, color: "from-navy-600 via-royal-400 to-gema-200" },
  { region: "Ashanti", ministries: 72, color: "from-gema-400 via-ochre-300 to-gema-200" },
  { region: "Northern", ministries: 58, color: "from-ochre-400 via-gema-300 to-navy-200" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-navy-950/80" />

        <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">

            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-royal-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-royal-700 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Ghana Evangelical Missions Association
              </div>

              <h1 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-tight text-navy-950 sm:text-5xl lg:text-6xl">
                A stronger Gospel network for <span className="bg-gradient-to-r from-royal-600 via-gema-700 to-ochre-500 bg-clip-text text-transparent">Ghana</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Unite gospel leaders, churches, and mission organizations under one trusted platform for discovery, partnership, and Kingdom impact.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register" className="bg-ochre-600 text-white px-5 py-3 rounded-xl font-medium transition hover:bg-ochre-700">
                  Join Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/directory" className="border border-royal-400 text-royal-700 px-5 py-3 rounded-xl font-medium transition:hover:bg-royal-50 hover:text-royal-900">
                  Explore Directory
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gema-700" /> Verified ministries</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-royal-600" /> Across all 16 regions</div>
              </div>
            </div>

            <div className="relative">
              <div className="hero-panel float-slow relative overflow-hidden rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-2xl backdrop-blur-sm">
                <div className="rounded-2xl bg-navy-950 via-royal-700 to-gema-700 p-5 text-white shadow-xl">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
                    <span>Network Snapshot</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">Live</span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <div className="text-3xl font-bold">250+</div>
                      <div className="mt-1 text-sm text-white/75">Verified members</div>
                    </div>
                    <div className="rounded-2xl bg-ochre-500/20 p-4 ring-1 ring-ochre-300/40">
                      <div className="text-3xl font-bold">24</div>
                      <div className="mt-1 text-sm text-white/75">Partnerships</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Regional coverage</span>
                      <span>16 regions</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {regionalSpotlight.map((item) => (
                        <div key={item.region} className="flex items-center justify-between text-[11px] text-white/70">
                          <span>{item.region}</span>
                          <span>{item.ministries}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-2 rounded-full bg-gray-600" style={{ width: `${item.ministries / 4}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="float-medium absolute -right-5 bottom-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700"><Building2 className="h-5 w-5" /></div>
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
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
                <div className="text-5xl font-bold font-serif text-navy-950">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-royal-600">Why GEMA matters</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-navy-950 sm:text-4xl">Built for ministry visibility, connection, and collaboration</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-royal-200 bg-white p-7 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-navy-950">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative bg-white/80 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-royal-600">Regional spotlight</p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-navy-950">A network across Ghana</h2>
              </div>
              <Link href="/directory" className="hidden text-sm font-semibold text-royal-700 hover:text-royal-800 sm:inline-flex">
                Browse all ministries <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {regionalSpotlight.map((item) => (
                <div key={item.region} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold font-bold ${OCHRE}`}>{item.region}</div>
                  <div className="mt-5 text-5xl font-bold text-navy-950">{item.ministries}</div>
                  <div className="mt-2 text-sm text-slate-600">Ministries and organizations</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="rounded-3xl border border-royal-200 bg-gradient-to-r from-navy-950 via-royal-700 to-gema-700 p-8 text-white shadow-2xl sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-300">Ready to take the next step?</p>
                <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Join a movement committed to mission, discipleship, and growth.</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-ochre-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ochre-600">
                  Join Us <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
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