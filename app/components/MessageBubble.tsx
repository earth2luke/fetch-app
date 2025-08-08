"use client";

import RoleBadge from "./RoleBadge";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  role?: string;
  senderName?: string;
}

export default function MessageBubble({ message, isUser }: { message: Message; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && message.role && <RoleBadge role={message.role} />}
      <div
        className={`max-w-xs px-3 py-2 rounded-lg ml-2 ${
          isUser ? "bg-accent text-black" : "bg-neutral-800 text-white"
        }`}
      >
        {!isUser && message.senderName && (
          <p className="text-xs font-semibold mb-1">{message.senderName}</p>
        )}
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
