import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instant Moving Estimate",
  description: "Get an instant estimate for your local move and lock in your date.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
