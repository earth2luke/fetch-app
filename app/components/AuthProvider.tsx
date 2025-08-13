"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// Firebase imports
import { auth, db } from "@/lib/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// Extend Role type to include an administrator role for moderation.
export type Role = "pup" | "handler" | "furry" | "ally" | "admin";

// A list of special email addresses that should always be treated as administrators.
// If a user signs up or logs in with one of these emails, their role will automatically be elevated to "admin".
const ADMIN_EMAILS = ["aaronrogers810@gmail.com"];

export interface UserProfile {
  id: string;
  email: string;
  password: string;
  role: Role;
  // Name is optional because profiles loaded from Firestore may not include it
  name?: string;
  bio?: string;
  interests?: string[];
  avatar?: string;
  blocked?: boolean;
}

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
        if (
          ADMIN_EMAILS.includes(parsedUser.email) &&
          parsedUser.role !== "admin"
        ) {
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

  const signup: AuthContextProps["signup"] = async ({
    email,
    password,
    role,
    name,
    bio,
    interests,
    avatar,
  }) => {
    // Ensure the email is not already registered with Firebase
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      throw new Error("Email already exists");
    }
    // Determine the assigned role
    const assignedRole: Role = ADMIN_EMAILS.includes(email) ? "admin" : role;
    // Create the user in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    // Save the user profile to Firestore
    await setDoc(doc(db, "users", fbUser.uid), {
      id: fbUser.uid,
      email: fbUser.email,
      role: assignedRole,
      name,
      bio,
      interests,
      avatar,
      blocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Send a verification email
    await sendEmailVerification(fbUser);
    // Sign out immediately so the user cannot log in until verified
    await firebaseSignOut(auth);
    // Throw an error to surface the verification message in the UI
    throw new Error(
      "A verification email has been sent. Please verify your email before logging in."
    );
  };

  const login: AuthContextProps["login"] = async (email, password) => {
    // Sign in with Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    // Require that the email is verified
    if (!fbUser.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before logging in.");
    }
    // Fetch the user's profile from Firestore
    const snap = await getDoc(doc(db, "users", fbUser.uid));
    let userProfile: UserProfile;
    if (snap.exists()) {
      // Casting to Partial<UserProfile> instead of any satisfies the
      // eslint rule against explicit `any` while allowing unknown fields.
      const data = snap.data() as Partial<UserProfile>;
      userProfile = {
        id: fbUser.uid,
        email: fbUser.email ?? "",
        password: "",
        role: (data.role ?? "pup") as Role,
        name: data.name ?? "",
        bio: data.bio ?? "",
        interests: data.interests ?? [],
        avatar: data.avatar,
        blocked: data.blocked ?? false,
      };
    } else {
      // Fallback if the profile is missing
      userProfile = {
        id: fbUser.uid,
        email: fbUser.email ?? "",
        password: "",
        role: "pup",
        name: fbUser.displayName ?? "",
        bio: "",
        interests: [],
        avatar: fbUser.photoURL ?? undefined,
        blocked: false,
      };
    }
    // Update local state with the profile
    setUser(userProfile);
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === userProfile.id);
      if (exists) {
        return prev.map((u) => (u.id === userProfile.id ? userProfile : u));
      }
      return [...prev, userProfile];
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateProfile: AuthContextProps["updateProfile"] = (updates) => {
    if (!user) return;
    const updatedUser: UserProfile = { ...user, ...updates };
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setUser(updatedUser);
    // Persist updates to Firestore
    setDoc(
      doc(db, "users", updatedUser.id),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch((err) => console.error(err));
  };

  const getUsers: AuthContextProps["getUsers"] = () => {
    return users;
  };

  const deleteUser: AuthContextProps["deleteUser"] = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // Optionally, delete from Firestore here
  };

  const changeUserRole: AuthContextProps["changeUserRole"] = (id, role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  const toggleBlockUser: AuthContextProps["toggleBlockUser"] = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, blocked: !u.blocked } : u
      )
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        signup,
        login,
        logout,
        updateProfile,
        getUsers,
        deleteUser,
        changeUserRole,
        toggleBlockUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}