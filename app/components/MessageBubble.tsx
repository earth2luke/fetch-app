"use client";

import RoleBadge from "./RoleBadge";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  role: string;
  timestamp: number;
}

export default function MessageBubble({ message, isUser }: { message: Message; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && <RoleBadge role={message.role} />}
      <div
        className={`max-w-xs px-3 py-2 rounded-lg ml-2 ${isUser ? "bg-accent text-black" : "bg-neutral-800 text-white"}`}
      >
        {!isUser && (
          <p className="text-xs font-semibold mb-1">{message.senderName}</p>
        )}
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
