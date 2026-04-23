import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinematic Wedding Walkthrough",
  description: "A premium scroll-driven walkthrough hero for a romantic wedding scene.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-stone-950 text-stone-100 antialiased">{children}</body>
    </html>
  );
}
