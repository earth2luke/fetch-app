"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the shape of a user in our simple localStorage based system.
export type Role = "pup" | "handler" | "furry" | "ally";

export interface UserProfile {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  bio?: string;
  interests?: string[];
  avatar?: string;
}

interface AuthContextProps {
  user: UserProfile | null;
  loading: boolean;
  users: UserProfile[];
  signup: (
    email: string,
    password: string,
    role: Role,
    name: string,
    bio?: string,
    interests?: string[],
    avatar?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stored data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedUsers = localStorage.getItem("fetch_users");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      const storedUser = localStorage.getItem("fetch_current_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist users to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("fetch_users", JSON.stringify(users));
  }, [users]);

  // Persist current user
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("fetch_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("fetch_current_user");
    }
  }, [user]);

  // Helper to create unique IDs
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  };

  const signup = async (
    email: string,
    password: string,
    role: Role,
    name: string,
    bio?: string,
    interests: string[] = [],
    avatar?: string
  ) => {
    // simple validation
    if (users.some((u) => u.email === email)) {
      throw new Error("Email already exists");
    }
    const newUser: UserProfile = {
      id: generateId(),
      email,
      password,
      role,
      name,
      bio,
      interests,
      avatar,
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      throw new Error("Invalid credentials");
    }
    setUser(found);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const value: AuthContextProps = {
    user,
    loading,
    users,
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
