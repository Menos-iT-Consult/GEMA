import Link from "next/link";
import { Church } from "lucide-react";

const links = [
  { href: "/directory", label: "Directory" },
  { href: "/register", label: "Join Us" },
  { href: "/admin", label: "Admin" }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
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
        <nav className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy-950"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/register" className="gm-btn-gold ml-2 hidden !py-2.5 sm:inline-flex">
            Register Ministry
          </Link>
        </nav>
      </div>
    </header>
  );
}
