"use client";

import { useState } from "react";
import { useAuth, Role } from "../components/AuthProvider";
import ProfileCard from "../components/ProfileCard";
import { useRouter } from "next/navigation";

/**
 * The discover page lists all other users in the system (excluding the
 * currently authenticated user) and allows filtering by role. Each profile
 * appears in a responsive grid with subtle animations on hover.
 */
export default function DiscoverPage() {
  const { user, users } = useAuth();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  if (!user) {
    // If no user, redirect to home. Using router directly inside render can
    // cause hydration mismatches so we fallback to a guard outside of effect.
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  const filtered = users.filter((u) => {
    if (u.id === user.id) return false;
    return roleFilter === "all" || u.role === roleFilter;
  });

  const handleFilter = (role: Role | "all") => {
    setRoleFilter(role);
  };

  return (
    <main className="min-h-screen pt-24 px-4 pb-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-neon-primary mb-4">Discover</h1>
      {/* Filter controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "pup", "handler", "furry", "ally"] as (Role | "all")[]).map((role) => (
          <button
            key={role}
            onClick={() => handleFilter(role)}
            className={`px-4 py-1 rounded-full text-sm font-medium border border-white/20 transition-colors ${
              roleFilter === role
                ? "bg-neon-primary/30 text-neon-primary"
                : "bg-white/10 text-gray-200 hover:bg-white/20"
            }`}
          >
            {role === "all" ? "All" : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400">No users found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </main>
  );
}
