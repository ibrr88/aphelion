import type { Metadata } from "next";
import "./globals.css";
import "./orbital.css";
import "lenis/dist/lenis.css";
import "./cinematic.css";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import { asset } from "@/lib/journeys";

export const metadata: Metadata = {
  title: "Aphelion — A different perspective",
  description: "A cinematic exploration of orbital travel. An independent concept project by Ebrahim Alhebshi.",
  icons: {
    icon: asset("/icon.svg"),
    shortcut: asset("/icon.svg"),
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
