"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import RoleBadge from "./RoleBadge";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-md bg-black/40">
      <Link href="/" className="text-2xl font-bold text-accent">Fetch</Link>
      <div className="flex items-center gap-4">
        <Link
          href="/discover"
          className={pathname.startsWith("/discover") ? "text-accent" : "text-white hover:text-accent"}
        >
          Discover
        </Link>
        {user && (
          <Link
            href="/chat"
            className={pathname.startsWith("/chat") ? "text-accent" : "text-white hover:text-accent"}
          >
            Chats
          </Link>
        )}
        {user ? (
          <>
            <Link
              href="/profile"
              className={pathname.startsWith("/profile") ? "text-accent" : "text-white hover:text-accent"}
            >
              Profile
            </Link>
            <RoleBadge role={user.role} />
            <button onClick={logout} className="ml-2 text-sm text-red-400 underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className={pathname === "/login" ? "text-accent" : "text-white hover:text-accent"}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={pathname === "/signup" ? "text-accent" : "text-white hover:text-accent"}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
