"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";

export default function LogoutPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Delete all sessions for current user
      await account.deleteSessions();

      setMessage("You have been logged out. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to log out. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl font-bold mb-2 text-center">Log out</h1>
          <p className="text-sm text-slate-400 mb-4 text-center">
            This will end your current session. You will need to log in again to access your data.
          </p>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Logging out..." : "Log out"}
          </button>

          {message && (
            <p className="text-xs text-emerald-400 mt-3 text-center">
              {message}
            </p>
          )}

          {error && (
            <p className="text-xs text-red-400 mt-3 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
