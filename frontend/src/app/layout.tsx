import "./globals.css";
import type { Metadata } from "next";

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
        
        {/* Top Navbar */}
        <nav className="w-full border-b border-slate-800 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-slate">
              MyHealthMate
            </a>

            <div className="flex gap-6 text-sm">
              <a href="/" className="hover:text-sky-400 transition-colors">
                Home
              </a>
              <a href="/health" className="hover:text-sky-400 transition-colors">
                Health Logs
              </a>
              <a href="/meals" className="hover:text-sky-400 transition-colors">
                Meal Logs
              </a>
              <a href="/coach" className="hover:text-sky-400 transition-colors">
                AI Coach
              </a>
            </div>

          </div>
        </nav>

        {/* Page content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
