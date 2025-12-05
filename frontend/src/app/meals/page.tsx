"use client";

import { useEffect, useState, FormEvent } from "react";
import { account } from "@/lib/appwrite";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";


type MealLog = {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: string;
  meal_name: string;
  calories?: number | null;
  protein_grams?: number | null;
  carbs_grams?: number | null;
  fat_grams?: number | null;
  notes?: string | null;
};

export default function MealsPage() {
  // ---------- 1) Auth state ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ---------- 2) Form + logs state ----------
  const [logDate, setLogDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [mealType, setMealType] = useState("");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");

  const [logs, setLogs] = useState<MealLog[]>([]);
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

  // ---------- 4) Fetch logs helper ----------
  const fetchLogsForDate = async (dateStr: string, currentUserId: string) => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetch(
        `${BACKEND_URL}/meal-logs/by-date?log_date=${dateStr}&user_id=${currentUserId}`
      );
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data: MealLog[] = await res.json();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setLogsError(err?.message || "Failed to fetch meal logs.");
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
    if (!userId) return;

    setSaving(true);
    setLogsError(null);

    try {
      const payload = {
        log_date: logDate,
        meal_type: mealType,
        meal_name: mealName,
        calories: calories ? Number(calories) : null,
        protein_grams: protein ? Number(protein) : null,
        carbs_grams: carbs ? Number(carbs) : null,
        fat_grams: fat ? Number(fat) : null,
        notes: notes || null,
        user_id: userId,
      };

      const res = await fetch(`${BACKEND_URL}/meal-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const created: MealLog = await res.json();
      setLogs((prev) => [created, ...prev]);

      // Reset form (keep date)
      setMealType("");
      setMealName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setNotes("");
    } catch (err: any) {
      console.error(err);
      setLogsError(err?.message || "Failed to save meal log.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- 7) Conditional renders (no hooks below) ----------
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

  // ---------- 8) Main UI ----------
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Meal Logs</h1>
        <p className="text-xs text-slate-500 mb-4">
          Logged in as <span className="font-mono">{userId}</span>
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: form */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-200">
              Add / update meal
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

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">Meal type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                >
                  <option value="">Select...</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">Meal name</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  placeholder="e.g. Grilled chicken salad"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  rows={3}
                  placeholder="e.g. Ate a bit late, felt heavy after."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {saving ? "Saving..." : "Save meal log"}
              </button>

              {logsError && (
                <p className="text-xs text-red-400 mt-2">{logsError}</p>
              )}
            </form>
          </section>

          {/* Right: logs list */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">
                Meals for {logDate}
              </h2>
              {logsLoading && (
                <span className="text-[11px] text-slate-500">
                  Loading...
                </span>
              )}
            </div>

            {logs.length === 0 && !logsLoading && (
              <p className="text-xs text-slate-500">
                No meals logged yet for this date. Add one on the left.
              </p>
            )}

            <div className="space-y-3 max-h-[320px] overflow-y-auto text-sm">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-slate-800 rounded-xl p-3 bg-slate-950"
                >
                  <p className="text-[11px] text-slate-300 font-semibold mb-1">
                    {log.meal_type.toUpperCase()} · {log.meal_name}
                  </p>
                  <p className="text-[11px] text-slate-400 mb-1">
                    {log.calories != null && `Calories: ${log.calories} kcal · `}
                    {log.protein_grams != null && `Protein: ${log.protein_grams} g · `}
                    {log.carbs_grams != null && `Carbs: ${log.carbs_grams} g · `}
                    {log.fat_grams != null && `Fat: ${log.fat_grams} g`}
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
