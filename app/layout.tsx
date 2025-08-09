"use client";

import "./globals.css";
import "./neon.css";
import AuthProvider from "../components/AuthProvider";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Fetch – Pup & Furry Connection",
  description: "Connect with pups, handlers and furries in a playful safe space.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white bg-neon-grid">
        <AuthProvider>
          <Navbar />
          <div className="pt-16 px-4">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
