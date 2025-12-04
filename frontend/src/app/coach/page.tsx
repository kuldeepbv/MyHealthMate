"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

const BACKEND_URL = "http://127.0.0.1:8000";

type CoachResponse = {
  health_logs_count: number;
  meal_logs_count: number;
  summary: string;
};

export default function CoachPage() {
  // ---------- 1) Auth state ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ---------- 2) Coach state ----------
  const [loading, setLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [healthCount, setHealthCount] = useState<number | null>(null);
  const [mealCount, setMealCount] = useState<number | null>(null);

  // ---------- 3) Check current user once ----------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (err: any) {
        console.error(err);
        setAuthError("You are not logged in. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
      } finally {
        setCheckingUser(false);
      }
    };

    fetchUser();
  }, []);

  // ---------- 4) Trigger coach summary ----------
  const handleGenerate = async () => {
    if (!userId) return;

    setLoading(true);
    setCoachError(null);
    setSummary(null);
    setHealthCount(null);
    setMealCount(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/coach/summary?user_id=${encodeURIComponent(userId)}`
      );
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data: CoachResponse = await res.json();
      setSummary(data.summary);
      setHealthCount(data.health_logs_count);
      setMealCount(data.meal_logs_count);
    } catch (err: any) {
      console.error(err);
      setCoachError(
        err?.message || "Failed to generate your weekly health summary."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- 5) Conditional renders ----------
  if (checkingUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Checking login status...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">
          {authError || "You are not logged in."}
        </p>
      </main>
    );
  }

  // ---------- 6) Main UI ----------
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-3">AI Health Coach</h1>
        <p className="text-xs text-slate-500 mb-4">
          Logged in as <span className="font-mono">{userId}</span>
        </p>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="text-sm text-slate-300 mb-3">
            This will look at your last 7 days of{" "}
            <span className="font-semibold">health logs</span> and{" "}
            <span className="font-semibold">meal logs</span>, then generate a
            short, friendly summary with a few practical suggestions.
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 text-sm font-semibold transition-colors"
          >
            {loading ? "Analyzing your week..." : "Generate my weekly summary"}
          </button>

          {coachError && (
            <p className="text-xs text-red-400 mt-3">{coachError}</p>
          )}

          {healthCount !== null && mealCount !== null && (
            <p className="text-[11px] text-slate-500 mt-3">
              Used {healthCount} health logs and {mealCount} meal logs from the
              last 7 days.
            </p>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold mb-2 text-slate-200">
            Your weekly summary
          </h2>
          {!summary && !loading && (
            <p className="text-xs text-slate-500">
              No summary yet. Click the button above to generate insights based
              on your recent data.
            </p>
          )}
          {summary && (
            <div className="text-sm text-slate-200 whitespace-pre-line">
              {summary}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
