"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Extend Role type to include an administrator role for moderation.
export type Role = "pup" | "handler" | "furry" | "ally" | "admin";

// A list of special email addresses that should always be treated as
// administrators. If a user signs up or logs in with one of these
// emails, their role will automatically be elevated to "admin" and
// existing stored data will be normalized to reflect that. This makes
// it easy to bootstrap an initial admin account without having to
// manually edit localStorage.
const ADMIN_EMAILS = ["aaronrogers18@gmail.com"];

// User profile stored in localStorage. Optional fields for extended user
// information are included. A `blocked` flag is available for moderators to
// temporarily suspend a user from interacting with others.
    export interface UserProfile {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  bio?: string;
      interests?: string;
  avatar?: string;
  blocked?: boolean;
}

// AuthContext provides everything the rest of the app needs to manage
// authentication state and user management. New functions have been added
// to support administrative moderation such as retrieving all users,
// deleting a user, updating a user’s role, and toggling a user’s blocked
// status.
interface AuthContextProps {
  user: UserProfile | null;
  loading: boolean;
  users: UserProfile[];
  signup: (args: {
    email: string;
    password: string;
    role: Role;
    name: string;
    bio?: string;
    interests?: string[];
    avatar?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getUsers: () => UserProfile[];
  deleteUser: (id: string) => void;
  changeUserRole: (id: string, role: Role) => void;
  toggleBlockUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stored data on mount and normalize admin roles. If any stored
  // user has an email in ADMIN_EMAILS, force their role to "admin".
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedUsers = localStorage.getItem("fetch_users");
      if (storedUsers) {
        const parsed: UserProfile[] = JSON.parse(storedUsers);
        const normalized = parsed.map((u) =>
          ADMIN_EMAILS.includes(u.email) && u.role !== "admin"
            ? { ...u, role: "admin" as Role }
            : u
        );
        setUsers(normalized);
      }
      const storedUser = localStorage.getItem("fetch_current_user");
      if (storedUser) {
        let parsedUser: UserProfile = JSON.parse(storedUser);
        if (ADMIN_EMAILS.includes(parsedUser.email) && parsedUser.role !== "admin") {
          parsedUser = { ...parsedUser, role: "admin" as Role };
        }
        setUser(parsedUser);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  // Persist users array whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("fetch_users", JSON.stringify(users));
  }, [users]);

  // Persist current user whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("fetch_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("fetch_current_user");
    }
  }, [user]);

  // Helper to generate unique user IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  const signup: AuthContextProps["signup"] = async ({
    email,
    password,
    role,
    name,
    bio,
    interests,
    avatar,
  }) => {
    // Ensure unique email
    if (users.some((u) => u.email === email)) {
      throw new Error("Email already exists");
    }
    // Determine the role; if this email is in the ADMIN_EMAILS list,
    // automatically elevate the user to an admin. Otherwise use the
    // supplied role from the form.
    const assignedRole: Role = ADMIN_EMAILS.includes(email) ? "admin" : role;
    const newUser: UserProfile = {
      id: generateId(),
      email,
      password,
      role: assignedRole,
      name,
      bio,
      interests,
      avatar,
      blocked: false,
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
  };

  const login: AuthContextProps["login"] = async (email, password) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      throw new Error("Invalid credentials");
    }
    // If the user logs in with an admin email but their stored role
    // isn't yet admin, upgrade them and persist the change. This ensures
    // previously registered accounts become admins without needing to
    // manually adjust localStorage.
    if (ADMIN_EMAILS.includes(found.email) && found.role !== "admin") {
      const updatedUser = { ...found, role: "admin" as Role };
      // update users array and localStorage
      setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
      setUser(updatedUser);
    } else {
      setUser(found);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile: AuthContextProps["updateProfile"] = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates } as UserProfile;
    setUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Administrative helpers
  const getUsers = () => users;

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // If the deleted user is currently logged in, log them out
    if (user?.id === id) setUser(null);
  };

  const changeUserRole = (id: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    if (user?.id === id) setUser({ ...user, role: newRole });
  };

  const toggleBlockUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u))
    );
    if (user?.id === id) setUser({ ...user, blocked: !user.blocked });
  };

  const value: AuthContextProps = {
    user,
    loading,
    users,
    signup,
    login,
    logout,
    updateProfile,
    getUsers,
    deleteUser,
    changeUserRole,
    toggleBlockUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}