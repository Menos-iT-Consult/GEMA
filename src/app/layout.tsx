import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghana Evangelical Missions Association | Missions Directory",
  description:
    "Centralized directory, verification portal and admin dashboard for evangelical churches, missions and ministries across Ghana."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gema-50 text-navy-950 antialiased">
        {children}
      </body>
    </html>
  );
}
