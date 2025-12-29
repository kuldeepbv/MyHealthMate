"use client";

import { useEffect, useState, Suspense } from "react";
import { account } from "@/lib/appwrite";
import { useSearchParams } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "sending" | "sent" | "verifying" | "success" | "error"
  >("sending");
  const [message, setMessage] = useState<string>("Preparing verification email...");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleVerification = async () => {
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");
      const emailParam = searchParams.get("email");

      // Case 1: User clicked verification link from email (has userId and secret)
      if (userId && secret) {
        setStatus("verifying");
        setMessage("Verifying your email...");

        try {
          // Verify the email using Appwrite
          await account.updateVerification(userId, secret);
          
          // Get user info after verification
          // Note: We might not have a session, so we'll use the userId and email from params
          let userEmail = emailParam || "";
          let userName = "";
          
          try {
            const userInfo = await account.get();
            userEmail = userInfo.email || userEmail;
            userName = userInfo.name || "";
          } catch (err) {
            // If we can't get user info (no session), that's okay
            // We'll use the userId and email from the URL params
            console.log("Could not get user info, using params:", err);
          }

          // Register user in Supabase after successful verification
          try {
            const response = await fetch(`${BACKEND_URL}/auth/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                appwrite_user_id: userId,
                email: userEmail,
                name: userName,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              // If user already exists in Supabase, that's okay
              if (!errorData.detail?.includes("already exists") && 
                  !errorData.message?.includes("already")) {
                console.error("Failed to register user in Supabase:", errorData);
              }
            } else {
              console.log("User successfully registered in Supabase");
            }
          } catch (supabaseErr) {
            console.error("Error registering user in Supabase:", supabaseErr);
            // Don't fail verification if Supabase registration fails
            // User can still log in and we can retry registration later
          }

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
            setMessage("Your email is already verified. You can now log in.");
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
        return;
      }

      // Case 2: User was redirected from signup (has email param, no userId/secret)
      if (emailParam) {
        setEmail(emailParam);
        // Email should have been sent during signup
        // Just show confirmation message
        setStatus("sent");
        setMessage(
          "Verification email has been sent! Please check your inbox (and spam folder) and click the verification link to complete your registration."
        );
        return;
      }

      // Case 3: No parameters - invalid state
      setStatus("error");
      setMessage(
        "Invalid verification link. Please check your email and try again."
      );
    };

    handleVerification();
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setStatus("sending");
    setMessage("Sending verification email...");

    try {
      // Try to create a session and send verification email
      // Note: This won't work without password, but we'll try
      const baseUrl = window.location.origin;
      const verificationUrl = `${baseUrl}/auth/verify`;
      
      // We need a session to send verification email
      // Since we don't have password here, we can't create a session
      // So we'll show a message asking user to try logging in
      setStatus("error");
      setMessage(
        "To resend verification email, please try logging in with your credentials. " +
        "If your email is not verified, you'll be prompted to resend the verification email."
      );
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(
        "Could not resend verification email. Please try logging in to trigger a new verification email."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
          
          {(status === "sending" || status === "verifying") && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
              <p className="text-sm text-slate-300">{message}</p>
            </div>
          )}

          {status === "sent" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-sky-500/20 p-3">
                  <svg
                    className="w-12 h-12 text-sky-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-sky-400 font-medium">{message}</p>
              {email && (
                <p className="text-xs text-slate-400">
                  Email sent to: {email}
                </p>
              )}
              <button
                onClick={handleResendEmail}
                className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Resend Email
              </button>
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
