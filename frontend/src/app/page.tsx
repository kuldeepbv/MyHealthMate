"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          MyHealthMate
        </h1>
        <p className="text-slate-300 text-sm md:text-base mb-6">
          A simple daily companion to help you track your sleep, water, steps,
          mood, weight, and meals — so you can build healthier habits without
          feeling overwhelmed.
        </p>

        <p className="text-slate-400 text-xs md:text-sm mb-6">
          Log your health data, see patterns over time, and get a short AI
          summary based on your last 7 days. No medical advice, just gentle,
          practical nudges to move, eat, and rest better.
        </p>

        <button
          onClick={() => {
            window.location.href = "/auth";
          }}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-sm font-semibold shadow-lg shadow-sky-900/40 transition-colors"
        >
          Explore MyHealthMate – Login / Signup
        </button>

        <p className="mt-4 text-[11px] text-slate-500">
          You&apos;ll be asked to log in before you can start tracking your health
          and meals.
        </p>
      </div>
    </main>
  );
}
