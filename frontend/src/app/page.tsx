"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.message ?? "Backend is up");
      })
      .catch((err) => {
        console.error("Error calling backend:", err);
        setStatus("❌ Could not reach backend");
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="p-6 rounded-2xl bg-slate-900 shadow-lg border border-slate-800 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          MyHealthMate
        </h1>
        <p className="text-slate-300 text-center">
          Backend status:{" "}
          <span className="font-semibold">{status}</span>
        </p>
      </div>
    </main>
  );
}