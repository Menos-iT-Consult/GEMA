import Link from "next/link";
import { useState } from "react";
import { Church, Menu, X } from "lucide-react";

const links = [
  { href: "/register", label: "Join Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
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
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy-950"
            >
              {l.label}
            </Link>
          ))}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((p) => !p)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>
      {open && (
        <div className="gm-mobile-nav border-t border-slate-200 bg-white shadow-lg lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy-950"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
