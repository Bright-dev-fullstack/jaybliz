"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { signIn } from "next-auth/react";
import { auth } from "@/config/firebase";

export default function FinishSignUp() {
  const [status, setStatus] = useState("Verifying your magic link...");

  useEffect(() => {
    async function completeSignIn() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");

        if (!email) {
          email = window.prompt("Please confirm your email address:");
        }

        if (email) {
          try {
            // 1. Sign in with Firebase Client SDK
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");

            // 2. Extract Firebase ID Token
            const idToken = await result.user.getIdToken();

            setStatus("Creating NextAuth session...");

            // 3. Pass token to NextAuth to create a real NextAuth session & redirect to /job
            await signIn("firebase", {
              idToken,
              callbackUrl: "/job",
            });

          } catch (error) {
            console.error("Error completing sign-in:", error);
            setStatus("Failed to complete sign-in. Link may be expired.");
          }
        } else {
          setStatus("Email address required to finish sign in.");
        }
      } else {
        setStatus("Invalid sign-in link.");
      }
    }

    completeSignIn();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-100 p-4">
      <div className="max-w-md w-full bg-stone-900 border border-stone-800 p-8 text-center rounded-md">
        <p className="text-sm font-medium tracking-wide text-stone-300">{status}</p>
      </div>
    </div>
  );
}