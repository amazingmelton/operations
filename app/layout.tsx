import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://operations-amazingmelton1.vercel.app"),
  title: "Amazing Tiles | Pickup & Delivery Operations",
  description:
    "A sample operations dashboard for Amazing Tiles pickups and deliveries across Melbourne.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Amazing Tiles — Pickup & Delivery Operations",
    description:
      "A live sample dashboard for tile pickups and deliveries across Melbourne.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazing Tiles — Pickup & Delivery Operations",
    description:
      "A live sample dashboard for tile pickups and deliveries across Melbourne.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
