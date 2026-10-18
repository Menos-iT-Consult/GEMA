import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghana Missions | Evangelical Association Directory",
  description:
    "Centralized directory, verification portal and admin dashboard for evangelical churches, missions and ministries across Ghana."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
