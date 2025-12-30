"use client";

import { FormEvent, useState } from "react";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // optional, used for signup
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetMessages = () => {
    setMessage(null);
    setError(null);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await account.createEmailPasswordSession(email, password);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "";

      // Already logged in – treat as success
      if (msg.includes("session is active")) {
        setMessage("You are already logged in. Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else if (
        msg.includes("not verified") ||
        msg.includes("email verification") ||
        msg.includes("unverified")
      ) {
        setError(
          "Please verify your email address before logging in. Check your inbox (and spam folder) for the verification link sent during signup."
        );
      } else {
        setError(msg || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      // Create user account
      // IMPORTANT: If email verification is enabled in Appwrite console settings,
      // Appwrite will automatically send a verification email when the account is created.
      // We should NOT create a session or manually send verification email here,
      // as that can invalidate the verification token.
      console.log("Creating account for:", email);
      await account.create(ID.unique(), email, password, name || undefined);
      console.log("Account created successfully");

      // Appwrite should have automatically sent verification email if email verification is enabled
      // We don't create a session here because:
      // 1. If email verification is required, session creation will fail (expected)
      // 2. Creating and then deleting a session can invalidate the verification token
      // 3. Appwrite sends the verification email automatically when account is created (if configured)
      
      // Redirect to verification page immediately
      // The verification page will show a message that the email was sent
      window.location.href = `/auth/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || "")}`;
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "";
      
      // Check if it's an account already exists error
      if (msg.includes("already exists") || msg.includes("already registered")) {
        setError("An account with this email already exists. Please log in instead.");
      } else if (msg.includes("verification email could not be sent")) {
        setError(msg);
      } else {
        setError(msg || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    if (mode === "login") return handleLogin(e);
    return handleSignup(e);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h1 className="text-2xl font-bold mb-2 text-center">
            {mode === "login" ? "Log in to MyHealthMate" : "Create your MyHealthMate account"}
          </h1>
          <p className="text-sm text-slate-400 mb-6 text-center">
            {mode === "login"
              ? "Enter your details to access your health and meal logs."
              : "Sign up to start tracking your daily health and nutrition."}
          </p>

          {/* Toggle buttons */}
          <div className="flex justify-center mb-4 gap-2 text-xs">
            <button
              type="button"
              className={`px-3 py-1 rounded-full border ${
                mode === "login"
                  ? "bg-sky-600 border-sky-500"
                  : "border-slate-700 text-slate-300"
              }`}
              onClick={() => {
                resetMessages();
                setMode("login");
              }}
            >
              Log in
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full border ${
                mode === "signup"
                  ? "bg-sky-600 border-sky-500"
                  : "border-slate-700 text-slate-300"
              }`}
              onClick={() => {
                resetMessages();
                setMode("signup");
              }}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-300">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-sky-500/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </button>
          </form>

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

          {mode === "signup" && (
            <p className="mt-3 text-[11px] text-slate-400 text-center">
              After signing up, you&apos;ll receive a verification email. Please verify your email before logging in.
            </p>
          )}

          <p className="mt-4 text-[11px] text-slate-500 text-center">
            This is a learning app. Use a unique password you don&apos;t reuse elsewhere.
          </p>
        </div>
      </div>
    </main>
  );
}
