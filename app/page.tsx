"use client";

import Link from "next/link";
import { useAuth } from "./components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The landing page of the application. When a user is already authenticated it
 * transparently redirects them to the discover page. Otherwise it presents
 * a hero section inviting the visitor to sign up or log in. A bold neon
 * heading and friendly tagline set the mood.
 */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/discover");
    }
  }, [loading, user, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-neon-primary/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-neon-secondary/20 to-transparent"></div>
      </div>
      <h1 className="text-5xl sm:text-7xl font-extrabold text-neon-primary drop-shadow-neon mb-4">
        Fetch
      </h1>
      <p className="max-w-xl text-gray-300 text-base sm:text-lg mb-8">
        Where pups, handlers and furries connect. Find your pack, share your
        vibes, and discover new friends in a playful and safe space.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/signup"
          className="px-6 py-3 rounded-md bg-neon-primary/30 text-neon-primary font-medium hover:bg-neon-primary/40 focus:ring-2 focus:ring-neon-primary"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-md bg-white/10 text-gray-200 font-medium hover:bg-white/20 focus:ring-2 focus:ring-neon-secondary"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
