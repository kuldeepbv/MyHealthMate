"use client";

import { useState, useEffect, FormEvent } from "react";

type MealLog = {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: string;
  meal_name: string;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  notes: string | null;
};

const BACKEND_URL = "http://127.0.0.1:8000";

export default function MealsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [logDate, setLogDate] = useState<string>(today);

  const [mealType, setMealType] = useState<string>("breakfast");
  const [mealName, setMealName] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fat, setFat] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch meals for selected date
  const fetchMeals = async (dateStr: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/meal-logs/by-date?log_date=${dateStr}`
      );
      const data = await res.json();
      setMealLogs(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals(logDate);
  }, [logDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

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
      };

      const res = await fetch(`${BACKEND_URL}/meal-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save meal");

      setMessage("Meal saved!");
      setMealName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setNotes("");

      fetchMeals(logDate);
    } catch {
      setMessage("Failed to save meal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Meal Logs</h1>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Form */}
          <section className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add Meal</h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <div className="flex flex-col">
                <label>Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label>Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label>Meal Name</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                  placeholder="e.g., Grilled Chicken Salad"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                  placeholder="Calories"
                />

                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                  placeholder="Protein (g)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                  placeholder="Carbs (g)"
                />

                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                  placeholder="Fat (g)"
                />
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-800 p-2 rounded w-full"
                placeholder="Notes"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-sky-600 py-2 rounded mt-2"
              >
                {submitting ? "Saving..." : "Save Meal"}
              </button>

              {message && <p className="text-sm mt-2">{message}</p>}
            </form>
          </section>

          {/* List */}
          <section className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Meals for {logDate}</h2>

            {loading ? (
              <p>Loading...</p>
            ) : mealLogs.length === 0 ? (
              <p className="text-slate-500">No meals logged for this date.</p>
            ) : (
              <div className="space-y-3">
                {mealLogs.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-slate-800 p-3 rounded-lg border border-slate-700"
                  >
                    <p className="font-semibold capitalize">{meal.meal_type}</p>
                    <p>{meal.meal_name}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {meal.calories ?? "-"} kcal |
                      P:{meal.protein_grams ?? "-"}g |
                      C:{meal.carbs_grams ?? "-"}g |
                      F:{meal.fat_grams ?? "-"}g
                    </p>
                    {meal.notes && (
                      <p className="text-xs text-slate-300 mt-1">{meal.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
