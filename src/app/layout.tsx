import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS.GG | Metacritic Grading + Reddit Threads + Pro Gaming Gear",
  description:
    "Weighted Critic & Verified Streamer Game Grading, Recursive Reddit-style Review Debates, and Pro Gaming Equipment & Digital Game Keys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
