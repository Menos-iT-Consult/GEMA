import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminDash from "@/components/AdminDash";
export default function AdminPage() {
  return (<><Navbar /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><h1 className="font-serif text-3xl font-bold text-navy-950">Admin Dashboard</h1><p className="mt-1 text-sm text-slate-600">Overview, verification queue, dues.</p><div className="mt-6"><AdminDash /></div></main><Footer /></>);
}
