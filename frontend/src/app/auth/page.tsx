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
      // Step 1: Create user account
      await account.create(ID.unique(), email, password, name || undefined);

      // Step 2: Attempt to send verification email
      // Strategy: Try to create a session first. If it succeeds, we can manually send verification email.
      // If it fails because email is not verified, Appwrite should have sent it automatically.
      let verificationEmailSent = false;
      let sessionCreated = false;

      try {
        // Try to create a session - this will fail if email verification is required and email is unverified
        await account.createEmailPasswordSession(email, password);
        sessionCreated = true;
        
        // Session was created, which means either:
        // - Email verification is disabled in Appwrite, OR
        // - Email was auto-verified (unlikely)
        // In either case, we should manually send verification email to ensure user verifies
        console.log("Session created successfully - attempting to send verification email manually");
        
        try {
          const baseUrl = window.location.origin;
          const verificationUrl = `${baseUrl}/auth/verify`;
          console.log("Sending verification email to:", email, "with URL:", verificationUrl);
          
          await account.createVerification(verificationUrl);
          console.log("Verification email sent successfully");
          verificationEmailSent = true;
          
          // Delete the session immediately - user needs to verify email first
          try {
            await account.deleteSession("current");
            sessionCreated = false;
            console.log("Session deleted successfully");
          } catch (deleteErr: any) {
            console.warn("Failed to delete session:", deleteErr?.message);
          }
        } catch (verifyErr: any) {
          const verifyMsg = verifyErr?.message || "";
          console.error("Failed to send verification email:", verifyMsg, verifyErr);
          
          // Clean up session if we created one
          if (sessionCreated) {
            try {
              await account.deleteSession("current");
            } catch (deleteErr) {
              console.warn("Failed to cleanup session:", deleteErr);
            }
          }
          
          // Check if the error suggests email verification might not be enabled
          if (
            verifyMsg.includes("not enabled") ||
            verifyMsg.includes("not configured") ||
            verifyMsg.includes("disabled") ||
            verifyMsg.toLowerCase().includes("email verification is off")
          ) {
            throw new Error(
              "Email verification is not enabled in your Appwrite console. " +
              "Please enable it in Auth > Settings > Email verification, and configure SMTP in Settings > Email & SMS."
            );
          }
          
          // Account was created but we couldn't send verification email
          // This indicates an Appwrite configuration issue
          throw new Error(
            `Account created but verification email could not be sent: ${verifyMsg}. ` +
            "Please ensure: 1) Email verification is enabled in Auth > Settings, " +
            "2) SMTP is configured in Settings > Email & SMS."
          );
        }
      } catch (sessionErr: any) {
        const sessionMsg = sessionErr?.message || "";
        
        // Check if it's our custom error about email sending failure
        if (sessionMsg.includes("verification email could not be sent")) {
          throw sessionErr; // Re-throw to be caught by outer catch
        }
        
        // If session creation failed because email is not verified, that's expected
        // Appwrite should have sent the verification email automatically during account creation
        if (
          sessionMsg.includes("not verified") ||
          sessionMsg.includes("email verification") ||
          sessionMsg.includes("unverified") ||
          sessionMsg.includes("email is not confirmed")
        ) {
          // This is expected - Appwrite should have sent verification email automatically
          verificationEmailSent = true;
        } else {
          // Other session errors - log but assume email was sent automatically
          console.warn("Unexpected session error:", sessionMsg);
          verificationEmailSent = true; // Assume Appwrite sent it
        }
      }

      if (verificationEmailSent) {
        // Email was sent (either automatically by Appwrite or manually by us)
        // Redirect to verification page to show confirmation
        window.location.href = `/auth/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || "")}`;
      } else {
        // This shouldn't happen, but handle it just in case
        setError(
          "Account was created but we couldn't verify if the verification email was sent. " +
          "Please check your email or try logging in to see if verification is required."
        );
      }
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
