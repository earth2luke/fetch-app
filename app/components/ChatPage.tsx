"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import MessageBubble, { Message } from "./MessageBubble";
import ChatInput from "./ChatInput";
import RoleBadge from "./RoleBadge";

/**
 * Chat page with safe DM onboarding. Users must acknowledge community guidelines
 * before they can send messages. Messages are persisted to localStorage per
 * chat ID. The message structure matches MessageBubble.tsx (id, senderId,
 * text, timestamp, optional role & senderName).
 */
export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [onboarding, setOnboarding] = useState(true);

  // Load messages from localStorage
  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`messages-${id}`);
    if (stored) {
      try {
        const parsed: Message[] = JSON.parse(stored);
        setMessages(parsed);
      } catch {
        // ignore parse error and reset
      }
    }
  }, [id]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`messages-${id}`, JSON.stringify(messages));
  }, [id, messages]);

  // Redirect unauthenticated users to home
  if (!loading && !user) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  const handleSend = (content: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      senderId: user.id,
      text: content,
      senderName: user.name,
      role: user.role,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (onboarding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center p-4 gap-4">
        <h1 className="text-3xl font-bold text-neon-primary drop-shadow-neon mb-2">
          Before you start chatting…
        </h1>
        <p className="max-w-md text-gray-300 mb-6">
          Please remember to keep things respectful and consensual. We’re all here to
          connect and have fun. By clicking below, you acknowledge that you’ll abide by
          our community guidelines.
        </p>
        <button
          onClick={() => setOnboarding(false)}
          className="btn-cta"
        >
          I Agree, Start Chatting
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 p-4 flex items-center gap-3 border-b border-white/10 glass">
        {user && <RoleBadge role={user.role} />}
        <div>
          <h2 className="text-lg font-semibold">
            {user?.name}
          </h2>
          <p className="text-xs text-gray-400">Chat #{id}</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isUser={msg.senderId === user?.id}
          />
        ))}
      </div>
      <footer className="p-4 border-t border-white/10 glass">
        <ChatInput onSend={handleSend} />
      </footer>
    </main>
  );
}
