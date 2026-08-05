import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";

const roboto = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://operations-mu.vercel.app"),
  title: "Amazing Tiles Operations",
  description:
    "One clear workspace for Amazing Tiles pickups, deliveries, container arrivals and stock transfers.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Amazing Tiles Operations",
    description:
      "Every warehouse. One clear plan.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazing Tiles Operations",
    description:
      "Every warehouse. One clear plan.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}
