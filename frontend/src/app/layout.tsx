import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MyHealthMate",
  description: "Track your health and meals with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        
        {/* Dynamic Navbar */}
        <Navbar />

        <main>{children}</main>
      </body>
    </html>
  );
}