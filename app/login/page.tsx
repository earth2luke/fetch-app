"use client";

import { FormEvent, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from "firebase/auth";
// Import the Firebase auth instance from our client helper.  The alias `@/lib/firebase/client`
// resolves to the appropriate module within the Next.js app.  We reuse this instance to
// resend verification emails without re‑initialising Firebase.
import { auth } from "@/lib/firebase/client";

/**
 * Enhanced login page for existing users.  In addition to handling normal login,
 * this page surfaces a message when a user attempts to log in before verifying
 * their email address.  It provides a "Resend Verification" button which will
 * re‑dispatch the verification email via Firebase.  To prevent spamming, the
 * resend button is disabled for a 30 second cooldown and shows a live
 * countdown.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Error message shown to the user.  This includes both authentication
  // errors and the special "Please verify your email" message surfaced from
  // the AuthProvider when a user’s email has not yet been verified.
  const [error, setError] = useState<string | null>(null);
  // General loading flag for the login button
  const [loading, setLoading] = useState(false);
  // Toggle visibility of the password field
  const [showPassword, setShowPassword] = useState(false);
  // Cooldown timer for the resend verification button (seconds remaining).  A
  // non‑zero value indicates that the button is disabled.
  const [resendCooldown, setResendCooldown] = useState(0);
  // Loading flag for the resend operation.  When true, the resend button
  // displays "Sending…" and remains disabled.
  const [resendLoading, setResendLoading] = useState(false);

  // Countdown effect.  When resendCooldown is greater than 0 we set up an
  // interval timer to decrement the value once per second.  Clearing the
  // interval when the component unmounts or when the timer reaches zero
  // prevents memory leaks.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  /**
   * Handles submission of the login form.  Attempts to authenticate with
   * Firebase via the `login` helper from our AuthProvider.  Upon success
   * the user is redirected to the discover page; upon failure the error
   * message is surfaced to the user.  If the error message indicates an
   * unverified email, the UI will automatically show a resend button.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.push("/discover");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Attempts to resend the email verification.  This helper signs the user
   * into Firebase using the provided email and password, dispatches a
   * verification email to the user’s inbox, signs the user back out, and
   * informs the UI that the resend was successful.  Any errors encountered
   * during this process will be surfaced to the user via the `error` state.
   */
  const handleResendVerification = async () => {
    setResendLoading(true);
    setError(null);
    try {
      // Sign in with email and password to obtain a valid user object
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );
      const fbUser = cred.user;
      // Send the verification email.  Firebase will prevent re-sending if
      // the address is already verified.
      await sendEmailVerification(fbUser);
      // Immediately sign out so the login session is terminated.  This
      // matches the behaviour in the signup flow where unverified users
      // are signed out.
      await firebaseSignOut(auth);
      // Provide feedback and start the cooldown
      setError(
        "A new verification email has been sent. Please check your inbox and then log in.",
      );
      setResendCooldown(30);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to resend verification email. Please try again later.",
        );
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 pt-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl"
      >
        <h1 className="text-2xl font-semibold text-neon-primary">Log In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="px-3 py-2 pr-10 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-neon-primary/30 text-neon-primary font-medium hover:bg-neon-primary/40 focus:ring-2 focus:ring-neon-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
        {/* When the user has not verified their email address, surface a resend
            button.  We detect this state by checking if the current error
            message includes the verification prompt.  The resend button is
            disabled while a cooldown is active or while the resend is in
            progress.  */}
        {error?.includes("verify your email") && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendCooldown > 0 || resendLoading}
            className="w-full py-2 mt-2 rounded-md bg-neon-primary/30 text-neon-primary font-medium hover:bg-neon-primary/40 focus:ring-2 focus:ring-neon-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading
              ? "Sending…"
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Verification Email"}
          </button>
        )}
      </form>
    </main>
  );
}