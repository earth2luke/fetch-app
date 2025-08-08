"use client";

import { useState, KeyboardEvent } from "react";

export default function ChatInput({ onSend }: { onSend: (content: string) => void }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-black/30 backdrop-blur-md">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-grow px-3 py-2 rounded-lg bg-neutral-800 text-white focus:outline-none"
      />
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-accent text-black rounded-lg font-semibold"
      >
        Send
      </button>
    </div>
  );
}
