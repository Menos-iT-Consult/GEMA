"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/" className="gm-btn-ghost mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>
        <h1 className="font-serif text-3xl font-bold text-navy-950">Register Your Ministry</h1>
        <p className="mt-2 text-sm text-slate-600">4 steps • reviewed as PENDING_REVIEW • approval in 5–7 working days.</p>
        {done ? (
          <div className="gm-card mt-6 p-8 text-center">
            <p className="font-serif text-2xl font-bold text-emerald-700">Application received!</p>
            <p className="mt-2 text-sm text-slate-600">Reference: <span className="font-mono font-bold">{done}</span></p>
            <a href="/" className="gm-btn-primary mt-6">Browse Directory</a>
          </div>
        ) : (
          <RegisterForm onDone={setDone} />
        )}
      </main>
      <Footer />
    </>
  );
}
