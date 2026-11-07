import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortalDash from "@/components/PortalDash";
import { readSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await readSession();

  if (!session) redirect("/portal/login");
  // The portal belongs to an organisation; admins without an organisation
  // belong in the Secretariat dashboard.
  if (!session.orgId) redirect("/admin");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-bold text-navy-950">
          Organisation Portal
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your ministry profile, dues records and team members.
        </p>
        <div className="mt-6">
          <PortalDash />
        </div>
      </main>
      <Footer />
    </>
  );
}
