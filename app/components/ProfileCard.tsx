"use client";

import Link from "next/link";
import RoleBadge from "./RoleBadge";

export interface Profile {
  id: string;
  name: string;
  role: string;
  tagline?: string;
  bio?: string;
  avatar?: string;
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-xl p-4 bg-black/30 backdrop-blur-lg hover:shadow-lg hover:scale-105 transition transform duration-300">
      <img
        src={profile.avatar || "https://placehold.co/300x200?text=Avatar"}
        alt={profile.name}
        className="w-full h-40 object-cover rounded-md mb-3"
      />
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
        <RoleBadge role={profile.role} />
      </div>
      {profile.tagline && (
        <p className="text-sm text-neutral-400 mb-2">{profile.tagline}</p>
      )}
      {profile.bio && (
        <p className="text-sm text-neutral-300 line-clamp-3">{profile.bio}</p>
      )}
      <Link
        href={`/chat/${profile.id}`}
        className="mt-3 inline-block text-sm text-accent underline"
      >
        Chat
      </Link>
    </div>
  );
}
