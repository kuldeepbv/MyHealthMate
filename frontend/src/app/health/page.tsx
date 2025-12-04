"use client";

import { useEffect, useState, FormEvent } from "react";
import { account } from "@/lib/appwrite";

const BACKEND_URL = "http://127.0.0.1:8000";

type HealthLog = {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number;
  water_glasses: number;
  mood_score: number;
  steps: number;
  weight: number;
  notes?: string | null;
};

export default function HealthPage() {
  // ---------- 1) Auth state ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ---------- 2) Form + logs state ----------
  const [logDate, setLogDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [mood, setMood] = useState("");
  const [steps, setSteps] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

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

  // ---------- 4) Fetch logs helper (no hooks inside) ----------
  const fetchLogsForDate = async (dateStr: string, currentUserId: string) => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetch(
        `${BACKEND_URL}/health-logs/by-date?log_date=${dateStr}&user_id=${currentUserId}`
      );
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data: HealthLog[] = await res.json();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setLogsError(err?.message || "Failed to fetch health logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  // ---------- 5) Fetch logs when date or user changes ----------
  useEffect(() => {
    if (!userId) return;
    fetchLogsForDate(logDate, userId);
  }, [logDate, userId]);

  // ---------- 6) Submit handler ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return; // safety

    setSaving(true);
    setLogsError(null);

    try {
      const payload = {
        log_date: logDate,
        sleep_hours: Number(sleep),
        water_glasses: Number(water),
        mood_score: Number(mood),
        steps: Number(steps),
        weight: Number(weight),
        notes: notes || null,
        user_id: userId,
      };

      const res = await fetch(`${BACKEND_URL}/health-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const created: HealthLog = await res.json();
      setLogs((prev) => [created, ...prev]);

      // Clear form (keep date)
      setSleep("");
      setWater("");
      setMood("");
      setSteps("");
      setWeight("");
      setNotes("");
    } catch (err: any) {
      console.error(err);
      setLogsError(err?.message || "Failed to save health log.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- 7) Conditional renders (no hooks below this) ----------

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

  // ---------- 8) Main UI when logged in ----------

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Daily Health Log</h1>
        <p className="text-xs text-slate-500 mb-4">
          Logged in as <span className="font-mono">{userId}</span>
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: form */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-200">
              Add / update log
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-slate-300">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Water (glasses)</label>
                  <input
                    type="number"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Mood (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Steps</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {saving ? "Saving..." : "Save health log"}
              </button>

              {logsError && (
                <p className="text-xs text-red-400 mt-2">{logsError}</p>
              )}
            </form>
          </section>

          {/* Right: logs */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">
                Logs for {logDate}
              </h2>
              {logsLoading && (
                <span className="text-[11px] text-slate-500">
                  Loading...
                </span>
              )}
            </div>

            {logs.length === 0 && !logsLoading && (
              <p className="text-xs text-slate-500">
                No logs yet for this date. Add one on the left.
              </p>
            )}

            <div className="space-y-3 max-h-[320px] overflow-y-auto text-sm">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-slate-800 rounded-xl p-3 bg-slate-950"
                >
                  <p className="text-[11px] text-slate-400 mb-1">
                    Sleep: {log.sleep_hours}h · Water: {log.water_glasses} glasses
                  </p>
                  <p className="text-[11px] text-slate-400 mb-1">
                    Mood: {log.mood_score} · Steps: {log.steps} · Weight:{" "}
                    {log.weight} kg
                  </p>
                  {log.notes && (
                    <p className="text-[11px] text-slate-300">
                      Notes: {log.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
