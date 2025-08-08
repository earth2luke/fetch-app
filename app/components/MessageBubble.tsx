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

export default function MessageBubble({
  message,
  isUser,
  isCurrentUser,
}: {
  message: Message;
  isUser?: boolean;
  isCurrentUser?: boolean;
}) {
  const current = isUser ?? isCurrentUser ?? false;
  return (
    <div className={`flex ${current ? "justify-end" : "justify-start"} mb-3`}>
      {!current && message.role && <RoleBadge role={message.role} />}
      <div
        className={`max-w-xs px-3 py-2 rounded-lg ml-2 ${
          current ? "bg-accent text-black" : "bg-neutral-800 text-white"
        }`}
      >
        {!current && message.senderName && (
          <p className="text-xs font-semibold mb-1">{message.senderName}</p>
        )}
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
