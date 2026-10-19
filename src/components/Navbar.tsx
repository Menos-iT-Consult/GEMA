import Link from "next/link";
import { Church } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 text-ochre-400">
            <Church className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg font-bold text-navy-950">Ghana Missions</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ochre-600">
              Evangelical Association
            </span>
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center">
          <Link
            href="/register"
            className="whitespace-nowrap rounded-xl bg-ochre-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ochre-600 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Join Us
          </Link>
        </nav>
      </div>
    </header>
  );
}
