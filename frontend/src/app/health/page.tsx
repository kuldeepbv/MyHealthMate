"use client";

<a href="/meals" className="text-sky-400 underline">Go to Meal Logs →</a>


import { useEffect, useState, FormEvent } from "react";

type HealthLog = {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  water_glasses: number | null;
  steps: number | null;
  mood_score: number | null;
  weight: number | null;
  notes: string | null;
};

const BACKEND_URL = "http://127.0.0.1:8000";

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);

  const [logDate, setLogDate] = useState<string>(today);
  const [sleepHours, setSleepHours] = useState<string>("");
  const [waterGlasses, setWaterGlasses] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [moodScore, setMoodScore] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Fetch today's logs from backend
  const fetchLogsForDate = async (dateStr: string) => {
    try {
      setLoadingLogs(true);
      const res = await fetch(
        `${BACKEND_URL}/health-logs/by-date?log_date=${dateStr}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch health logs");
      }
      const data = await res.json();
      setHealthLogs(data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to load logs for this date");
    } finally {
      setLoadingLogs(false);
    }
  };
  

  useEffect(() => {
    fetchLogsForDate(logDate);
  }, [logDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        log_date: logDate,
        sleep_hours: sleepHours ? Number(sleepHours) : null,
        water_glasses: waterGlasses ? Number(waterGlasses) : null,
        steps: steps ? Number(steps) : null,
        mood_score: moodScore ? Number(moodScore) : null,
        weight: weight ? Number(weight) : null,
        notes: notes || null,
      };

      const res = await fetch(`${BACKEND_URL}/health-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to submit health log");
      }

      setMessage("✅ Health log saved!");

      // Clear some fields (keep date)
      setSleepHours("");
      setWaterGlasses("");
      setSteps("");
      setMoodScore("");
      setWeight("");
      setNotes("");

      // Refresh today's logs
      await fetchLogsForDate(logDate);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save health log");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MyHealthMate</h1>
            <p className="text-slate-400">
              Track your daily health stats and see your trends.
            </p>
          </div>
          <span className="text-sm text-slate-500">
            Backend: <code className="text-slate-300">{BACKEND_URL}</code>
          </span>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Form */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Log Today&apos;s Health</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-300">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-300">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                    placeholder="e.g. 7.5"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-300">Water (glasses)</label>
                  <input
                    type="number"
                    value={waterGlasses}
                    onChange={(e) => setWaterGlasses(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                    placeholder="e.g. 8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-300">Steps</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                    placeholder="e.g. 8000"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-300">Mood (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={moodScore}
                    onChange={(e) => setMoodScore(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-300">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  placeholder="e.g. 70.5"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-300">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40 min-h-[70px]"
                  placeholder="How did you feel today?"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {submitting ? "Saving..." : "Save Health Log"}
              </button>

              {message && (
                <p className="text-sm mt-2 text-center">
                  {message}
                </p>
              )}
            </form>
          </section>

          {/* Today's logs */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Health Logs for Selected Date</h2>
          <p className="text-sm text-slate-400 mb-4">
            Showing entries from the last 7 days.
          </p>

            {loadingLogs ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : healthLogs.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No health logs for today yet. Add one on the left!
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {healthLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-800 rounded-xl p-3 bg-slate-950/40 text-sm"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-100">
                        {log.sleep_hours ?? "-"}h sleep,{" "}
                        {log.water_glasses ?? "-"} glasses water
                      </span>
                      <span className="text-xs text-slate-500">
                        Mood: {log.mood_score ?? "-"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Steps: {log.steps ?? "-"} | Weight:{" "}
                      {log.weight ?? "-"} kg
                    </div>
                    {log.notes && (
                      <p className="mt-1 text-xs text-slate-300">
                        {log.notes}
                      </p>
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