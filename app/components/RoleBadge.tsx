"use client";

interface RoleBadgeProps {
  role: string;
}

const colors: Record<string, string> = {
  Pup: "bg-pink-500",
  Handler: "bg-blue-500",
  Furry: "bg-purple-500",
  Ally: "bg-green-500",
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const color = colors[role as keyof typeof colors] ?? "bg-gray-500";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-black ${color}`}>
      {role}
    </span>
  );
}
