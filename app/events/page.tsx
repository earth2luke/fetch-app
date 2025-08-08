"use client";

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Pup Meetup",
      date: "August 30, 2025",
      time: "6:00 PM",
      location: "Celebration Dog Park, Orlando",
      description: "A social gathering for pups and handlers to play and connect.",
    },
    {
      id: 2,
      title: "Furry Art Jam",
      date: "September 12, 2025",
      time: "1:00 PM",
      location: "Columbia Restaurant Patio",
      description: "Bring your sketchbook and creativity for an afternoon of art and camaraderie.",
    },
  ];

  return (
    <main className="min-h-screen px-4 py-8 bg-neon-grid text-white">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-neon-primary drop-shadow-neon">Upcoming Events</h1>
      <p className="mb-8 text-gray-300 max-w-2xl">
        Join our community events to meet new friends, learn new skills, and have fun!
      </p>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="glass border border-white/15 rounded-xl p-4 hover:drop-shadow-neon transition">
            <h2 className="text-2xl font-semibold text-neon-secondary mb-1">{event.title}</h2>
            <p className="text-sm text-gray-400">{event.date} · {event.time}</p>
            <p className="text-sm text-gray-400 mb-2">{event.location}</p>
            <p className="text-sm text-gray-300">{event.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
