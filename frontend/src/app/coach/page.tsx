"use client";

import { useState } from "react";

const BACKEND_URL = "http://127.0.0.1:8000";

type CoachResponse = {
  health_logs_count: number;
  meal_logs_count: number;
  summary: string;
};

export default function CoachPage() {
  const [loading, setLoading] = useState(false);
  const [coachData, setCoachData] = useState<CoachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCoachData(null);

    try {
      const res = await fetch(`${BACKEND_URL}/coach/summary`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data: CoachResponse = await res.json();
      setCoachData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch coach summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-3">AI Health & Meal Coach</h1>
        <p className="text-slate-400 mb-6 text-sm">
          The coach looks at your last 7 days of health and meal logs and gives
          you a friendly summary plus practical suggestions.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            {loading ? "Analyzing your last 7 days..." : "Generate my weekly summary"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {coachData && (
            <div className="mt-5 space-y-3 text-sm">
              <p className="text-slate-400">
                Using{" "}
                <span className="font-mono">
                  {coachData.health_logs_count} health logs
                </span>{" "}
                and{" "}
                <span className="font-mono">
                  {coachData.meal_logs_count} meal logs
                </span>{" "}
                from the last 7 days.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[420px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-slate-100 text-sm leading-relaxed">
                  {coachData.summary}
                </pre>
              </div>
            </div>
          )}

          {!coachData && !loading && !error && (
            <p className="mt-3 text-sm text-slate-500">
              Click the button above once you&apos;ve logged a few days of health
              and meals.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
