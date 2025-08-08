"use client";

import Link from "next/link";

const events = [
  {
    id: "1",
    title: "Pup Meet-up at Lake Eola",
    date: "2025-09-15",
    location: "Orlando, FL",
    description: "Join local pups and handlers for an afternoon in the park.",
  },
  {
    id: "2",
    title: "Furry Art Fair",
    date: "2025-10-02",
    location: "Orlando Convention Center",
    description: "Celebrate furry creativity with artists, makers, and fans.",
  },
];

export default function EventsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-neon-primary mb-6">Upcoming Events</h1>
      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="glass rounded-xl p-4 hover:drop-shadow-neon transition"
          >
            <h2 className="text-2xl font-semibold mb-1">{event.title}</h2>
            <p className="text-sm text-gray-400 mb-2">
              {new Date(event.date).toLocaleDateString()} • {event.location}
            </p>
            <p className="text-sm mb-4">{event.description}</p>
            <Link
              href={`/events/${event.id}`}
              className="text-neon-secondary hover:underline"
            >
              Learn more
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
