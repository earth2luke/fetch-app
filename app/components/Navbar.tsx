"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

/**
 * Global navigation bar for the Fetch app.
 *
 * This component renders a fixed header at the top of every page.
 * When a user is logged in it shows links to Discover, Profile and a
 * logout button.  Unauthenticated visitors see links to log in or
 * create an account.  Administrators additionally see an Admin link
 * when signed in.  All navigation updates the URL using Next.js
 * <Link> components to avoid a full page refresh.
 */
export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-black/50 border-b border-white/10">
      {/* Brand / logo */}
      <Link href="/" className="text-neon-primary font-bold text-xl">
        Fetch
      </Link>
      {/* Navigation links */}
      <div className="flex items-center space-x-4 text-sm font-medium">
        {user ? (
          <>
            {/* Admin link shown only to admin users */}
            {user.role === "admin" && (
              <Link href="/admin" className="hover:text-neon-primary">
                Admin
              </Link>
            )}
            <Link href="/discover" className="hover:text-neon-primary">
              Discover
            </Link>
            <Link href="/profile" className="hover:text-neon-primary">
              Profile
            </Link>
            <button
              onClick={() => logout()}
              className="hover:text-neon-primary focus:outline-none"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-neon-primary">
              Log In
            </Link>
            <Link href="/signup" className="hover:text-neon-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}