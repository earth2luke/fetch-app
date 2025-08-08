"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

/**
 * Login page for existing users. Accepts email and password then calls
 * the login function from our AuthProvider. Displays errors when the
 * credentials do not match. On success it redirects to the discover page.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          <input
            id="password"
            type="password"
            required
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-neon-primary/30 text-neon-primary font-medium hover:bg-neon-primary/40 focus:ring-2 focus:ring-neon-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </main>
  );
}
