"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, Role } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

/**
 * Sign-up page allowing new users to create an account. We collect
 * basic info like name, email, password and role along with optional bio
 * and interests. Errors are surfaced inline. Prior to attempting sign up
 * we validate the email format and ensure the password fields match. On
 * success the user is redirected to their profile.
 */
export default function SignUpPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "pup" as Role,
    bio: "",
    interests: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    // basic email format validation
    const email = formState.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (formState.password !== formState.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.toLowerCase(),
        password: formState.password,
        role: formState.role,
        name: formState.name.trim(),
        // Provide an explicit null avatar to avoid Firestore undefined errors
        avatar: null,
        bio: formState.bio.trim() || undefined,
        interests: formState.interests
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      });
      router.push("/profile");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
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
        <h1 className="text-2xl font-semibold text-neon-primary">Create Account</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {/* Name field */}
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
            value={formState.name}
            onChange={handleChange}
          />
        </div>
        {/* Email field */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={formState.email}
            onChange={handleChange}
          />
        </div>
        {/* Password field with visibility toggle */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="px-3 py-2 pr-10 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
              value={formState.password}
              onChange={handleChange}
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
        {/* Confirm password field with visibility toggle */}
        <div className="flex flex-col">
          <label htmlFor="confirm" className="text-sm text-gray-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm"
              name="confirm"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="px-3 py-2 pr-10 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
              value={formState.confirm}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {/* Role select */}
        <div className="flex flex-col">
          <label htmlFor="role" className="text-sm text-gray-300 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="px-3 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={formState.role}
            onChange={handleChange}
          >
            <option value="pup">Pup</option>
            <option value="handler">Handler</option>
            <option value="furry">Furry</option>
            <option value="ally">Ally</option>
          </select>
        </div>
        {/* Bio */}
        <div className="flex flex-col">
          <label htmlFor="bio" className="text-sm text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={formState.bio}
            onChange={handleChange}
          />
        </div>
        {/* Interests */}
        <div className="flex flex-col">
          <label htmlFor="interests" className="text-sm text-gray-300 mb-1">
            Interests (comma separated)
          </label>
          <input
            id="interests"
            name="interests"
            type="text"
            className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-primary"
            value={formState.interests}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-neon-primary/30 text-neon-primary font-medium hover:bg-neon-primary/40 focus:ring-2 focus:ring-neon-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}