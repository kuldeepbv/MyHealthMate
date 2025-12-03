"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-xl w-full px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">MyHealthMate</h1>
        <p className="text-slate-400 mb-8 text-center">
          Choose what you want to track today.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="/health"
            className="block bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Health Logs</h2>
            <p className="text-sm text-slate-400">
              Track sleep, water, steps, mood, and weight for each day.
            </p>
          </a>

          <a
            href="/meals"
            className="block bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Meal Logs</h2>
            <p className="text-sm text-slate-400">
              Log your meals, calories, macros, and notes for each day.
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}
