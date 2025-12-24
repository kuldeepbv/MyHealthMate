"use client";

import { useEffect, useState, Suspense } from "react";
import { account } from "@/lib/appwrite";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      if (!userId || !secret) {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email and try again."
        );
        return;
      }

      try {
        // Verify the email using Appwrite
        await account.updateVerification(userId, secret);
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
      } catch (err: any) {
        console.error(err);
        const msg = err?.message || "";
        
        if (msg.includes("already verified") || msg.includes("verified")) {
          setStatus("success");
          setMessage("Your email is already verified. You can log in now.");
          setTimeout(() => {
            window.location.href = "/auth";
          }, 3000);
        } else if (msg.includes("expired") || msg.includes("invalid")) {
          setStatus("error");
          setMessage(
            "This verification link has expired or is invalid. Please request a new verification email."
          );
        } else {
          setStatus("error");
          setMessage(
            msg || "Verification failed. Please try again or request a new verification email."
          );
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
          
          {status === "verifying" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
              <p className="text-sm text-slate-300">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-500/20 p-3">
                  <svg
                    className="w-12 h-12 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-emerald-400 font-medium">{message}</p>
              <p className="text-xs text-slate-400">
                Redirecting to login page...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-500/20 p-3">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-red-400">{message}</p>
              <button
                onClick={() => (window.location.href = "/auth")}
                className="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="text-sm text-slate-400">Loading...</div>
        </main>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

