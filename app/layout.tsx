import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guess the Founder",
  description: "A live founder quiz with one guess per round and a fast-moving leaderboard.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
