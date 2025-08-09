"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  senderName?: string;
  role?: string;
}

interface Thread {
  id: string;
  lastMsg: Message;
  buddyName: string;
  buddyRole?: string;
}

export default function ChatListPage() {
  const { user, getUsers } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!user) return;
    const allUsers = getUsers();
    const convs: Thread[] = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("messages-")) {
        const otherId = key.replace("messages-", "");
        if (otherId === user.id) return;
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const msgs: Message[] = JSON.parse(raw);
            if (msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              const buddy = allUsers.find((u) => u.id === otherId);
              convs.push({
                id: otherId,
                lastMsg,
                buddyName: buddy?.name ?? "Unknown",
                buddyRole: buddy?.role,
              });
            }
          } catch {}
        }
      }
    });
    convs.sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp);
    setThreads(convs);
  }, [user]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-neon-grid p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Chats</h1>
      {threads.length === 0 ? (
        <p className="text-gray-400">No conversations yet.</p>
      ) : (
        <ul className="space-y-4">
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link
                href={`/chat/${thread.id}`}
                className="flex items-center justify-between p-4 glass rounded-xl hover:drop-shadow-neon transition"
              >
                <div>
                  <p className="font-semibold text-neon-primary">
                    {thread.buddyName}
                  </p>
                  <p className="text-sm text-gray-300 truncate max-w-[200px]">
                    {thread.lastMsg.text}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(thread.lastMsg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
