"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth, Role } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

/**
 * Profile editing page. Allows the logged-in user to update their name,
 * role, bio and interests. A secondary button lets the user navigate
 * to the Discover page to see their profile as others will, now that
 * the Discover page includes the current user.
 */
export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("pup");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (user) {
      setName(user.name ?? "");
      setRole((user.role as Role) ?? "pup");
      setBio(user.bio ?? "");
      setInterests(user.interests ?? "");
    }
  }, [loading, user, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ name, role, bio, interests });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neon-grid py-8 px-4 text-white">
      <div className="glass rounded-xl p-6 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-neon-primary drop-shadow-neon">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Name</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-neon-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Role</label>
            <select
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-neon-secondary"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="pup">Pup</option>
              <option value="handler">Handler</option>
              <option value="furry">Furry</option>
              <option value="ally">Ally</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Bio</label>
            <textarea
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-neon-secondary"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Interests</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-neon-secondary"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <button type="submit" className="btn-cta w-full">
              Save
            </button>
            {/* View Profile button navigates to discover page so the user can view their own profile */}
            <button
              type="button"
              onClick={() => router.push("/discover")}
              className="btn-glass w-full"
            >
              View Profile
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}