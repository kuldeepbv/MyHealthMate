"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { account } from "@/lib/appwrite";

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // Hide navbar on /auth route
  if (pathname.startsWith("/auth")) {
    return null;
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get(); // succeeds if logged in
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-slate">
          MyHealthMate
        </a>

        <div className="flex gap-6 text-sm items-center">
          {/* When logged OUT → only show Login/Signup */}
          {loggedIn === false && (
            <a href="/auth" className="hover:text-sky-400 transition-colors">
              Login / Signup
            </a>
          )}

          {/* When logging state is loading */}
          {loggedIn === null && (
            <span className="text-slate-500 text-xs">...</span>
          )}

          {/* When logged IN → show full nav + Logout */}
          {loggedIn === true && (
            <>
              <a
                href="/"
                className="hover:text-sky-400 transition-colors"
              >
                Home
              </a>
              <a
                href="/health"
                className="hover:text-sky-400 transition-colors"
              >
                Health Logs
              </a>
              <a
                href="/meals"
                className="hover:text-sky-400 transition-colors"
              >
                Meal Logs
              </a>
              <a
                href="/coach"
                className="hover:text-sky-400 transition-colors"
              >
                AI Coach
              </a>
              <a
                href="/logout"
                className="hover:text-sky-400 transition-colors"
              >
                Logout
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
