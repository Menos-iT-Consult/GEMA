import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminDash from "@/components/AdminDash";
import { readSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await readSession();

  if (!session) redirect("/admin/login");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-gradient-to-r from-navy-950 via-royal-700 to-gema-700 p-6 text-white shadow-[0_24px_60px_rgba(8,8,31,0.18)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-200">Secretariat dashboard</p>
              <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">Admin Portal</h1>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              {session.role.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        <AdminDash />
      </main>
      <Footer />
    </>
  );
}
