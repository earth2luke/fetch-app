"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import ChatInput from "../../components/ChatInput";
import MessageBubble from "../../components/MessageBubble";
import RoleBadge from "../../components/RoleBadge";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

/**
 * The chat page handles a private conversation between the logged-in user and
 * another user. It retrieves and persists messages from localStorage to
 * simulate realtime messaging. A simple header shows the recipient's info.
 */
export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user, users } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get the recipient user
  const recipient = users.find((u) => u.id === id);

  // Compose a stable storage key based on user ids (sorted)
  const conversationKey = user && recipient ? getConversationKey(user.id, recipient.id) : null;

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (!recipient) {
      // Unknown recipient, back to discover
      router.replace("/discover");
      return;
    }
    if (conversationKey) {
      const stored = localStorage.getItem(conversationKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    }
  }, [user, recipient, conversationKey, router]);

  const persistMessages = (msgs: Message[]) => {
    if (conversationKey) {
      localStorage.setItem(conversationKey, JSON.stringify(msgs));
    }
  };

  const handleSend = (text: string) => {
    if (!user || !recipient) return;
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      senderId: user.id,
      text,
      timestamp: Date.now(),
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    persistMessages(updated);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || !recipient) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <div className="fixed top-[64px] left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="text-gray-200 hover:text-neon-primary">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{recipient.name}</span>
            <RoleBadge role={recipient.role} />
          </div>
      </div>
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-24">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === user.id}
          />
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      {/* Input */}
      <ChatInput onSend={handleSend} />
    </main>
  );
}

// Helper to generate conversation key for localStorage. It sorts ids to
// ensure both participants reference the same key regardless of who is
// current user.
function getConversationKey(a: string, b: string) {
  return `fetch_messages_${[a, b].sort().join("_")}`;
}
