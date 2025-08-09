"use client";

// Admin management page for Fetch app. Allows administrators to view all users, change roles,
// block/unblock users, and delete accounts. Access is restricted to users with the `admin`
// role. Non‑admin visitors will be redirected back to the homepage.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
// Import the Role type so we can cast the selected role instead of using `any`
import type { Role } from "../components/AuthProvider";

// Available roles for assignment. Keep this in sync with Role type in AuthProvider.
const ROLE_OPTIONS = ["pup", "handler", "furry", "ally", "admin"] as const;

export default function AdminPage() {
  const router = useRouter();
  const {
    user,
    getUsers,
    deleteUser,
    changeUserRole,
    toggleBlockUser,
  } = useAuth();
  const [userList, setUserList] = useState(() => getUsers());

  // Redirect non‑admin users to home. Also refresh the user list when the
  // current user changes (e.g., after logging out or switching roles).
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.replace("/");
      return;
    }
    setUserList(getUsers());
  }, [user, getUsers, router]);

  // Handlers wrap the AuthProvider functions and refresh the local list
  const handleDelete = (id: string) => {
    deleteUser(id);
    setUserList(getUsers());
  };
  const handleRoleChange = (id: string, role: string) => {
    // Cast the selected role string to the Role type defined in AuthProvider
    changeUserRole(id, role as Role);
    setUserList(getUsers());
  };
  const handleToggleBlock = (id: string) => {
    toggleBlockUser(id);
    setUserList(getUsers());
  };

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Blocked</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {userList.map((u) => (
              <tr key={u.id} className="bg-gray-900 hover:bg-gray-800">
                <td className="px-3 py-2 whitespace-nowrap">{u.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{u.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select
                    className="bg-gray-700 text-white p-1 rounded"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-gray-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {u.blocked ? "Yes" : "No"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                  <button
                    onClick={() => handleToggleBlock(u.id)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      u.blocked
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-500 text-black hover:bg-yellow-600"
                    }`}
                  >
                    {u.blocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1 rounded text-xs font-medium bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
