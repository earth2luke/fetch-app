"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth, Role } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

/**
 * The profile page allows a logged-in user to view and edit their account
 * details. If no user is currently authenticated they are redirected to
 * the login page. Changes are immediately saved via the AuthProvider.
 */
export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    role: "pup" as Role,
    bio: "",
    interests: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (user) {
      setForm({
        name: user.name,
        role: user.role,
        bio: user.bio || "",
        interests: user.interests ? user.interests.join(", ") : "",
      });
    }
  }, [user, loading, router]);

  if (!user) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: form.name.trim(),
      role: form.role,
      bio: form.bio.trim(),
      interests: form.interests
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    });
    setMessage("Profile updated!");
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <main className="min-h-screen flex items-start justify-center p-4 pt-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl"
      >
        <h1 className="text-2xl font-semibold text-neon-primary mb-2">My Profile</h1>
        {message && <p className="text-green-400 text-sm">{message}</p>}
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm text-gray-300 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="role" className="text-sm text-gray-300 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="px-3 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={form.role}
            onChange={handleChange}
          >
            <option value="pup">Pup</option>
            <option value="handler">Handler</option>
            <option value="furry">Furry</option>
            <option value="ally">Ally</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="bio" className="text-sm text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={form.bio}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="interests" className="text-sm text-gray-300 mb-1">
            Interests
          </label>
          <input
            id="interests"
            name="interests"
            type="text"
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={form.interests}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-md bg-neon-primary/30 text-neon-primary font-medium hover:bg-neon-primary/40 focus:ring-2 focus:ring-neon-primary"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
