"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import MessageBubble, { Message } from "../../components/MessageBubble";
import ChatInput from "../../components/ChatInput";
import RoleBadge from "../../components/RoleBadge";

/**
 * Chat page with safe DM onboarding. Users must acknowledge community guidelines before
 * they can send messages. Messages are persisted to localStorage per chat ID. The message
 * structure matches MessageBubble.tsx (id, senderId, text, timestamp, optional role & senderName).
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
        // ignore parse errors
      }
    }
  }, [id]);

  // Persist messages
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`messages-${id}`, JSON.stringify(messages));
  }, [id, messages]);

  // Redirect to login if not authenticated once loading finishes
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  function handleSend(text: string) {
    if (!user) return;
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      senderId: user.id,
      text,
      senderName: user.name,
      role: user.role,
      timestamp: Date.now(),
    };
    setMessages((msgs) => [...msgs, newMessage]);
  }

  if (loading || !user) {
    return null; // show nothing during loading
  }

  // Onboarding overlay asking to acknowledge guidelines
  if (onboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="max-w-md w-full glass p-6 text-center rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-neon-primary">Before you chat…</h2>
          <p className="mb-4 text-sm text-gray-300">
            Please remember our community guidelines: be respectful, consent is mandatory,
            and no explicit content. Your profile information may be visible to others in
            the conversation. Click Continue to start chatting.
          </p>
          <button
            className="btn-cta w-full"
            onClick={() => setOnboarding(false)}
          >
            I Agree
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header with back button and partner info */}
      <header className="sticky top-0 z-20 p-4 flex items-center gap-3 border-b border-white/10 glass">
        <button
          className="p-2 mr-2 rounded-md bg-white/10 hover:bg-white/20"
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {/* Show role of partner (for demo we just show Pup) */}
          <RoleBadge role="Pup" />
          <span className="font-medium text-sm text-gray-300">Chat Room {id}</span>
        </div>
      </header>
      {/* Messages list */}
      <main className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-8">
            Start the conversation by sending a message!
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isUser={msg.senderId === user.id}
          />
        ))}
      </main>
      {/* Chat input */}
      <footer className="p-4 border-t border-white/10 glass">
        <ChatInput onSend={handleSend} />
      </footer>
    </div>
  );
}
