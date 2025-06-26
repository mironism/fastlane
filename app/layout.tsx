import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastLane - Beach Activity Bookings",
  description: "The fastest way to book amazing beach activities and water sports. Discover and reserve your perfect beach experience with just a few clicks.",
  keywords: "beach activities, water sports, activity booking, beach tours, water adventures, marine activities, beach experiences",
  authors: [{ name: "FastLane Team" }],
  creator: "FastLane",
  publisher: "FastLane",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fastlane-bookings.com",
    title: "FastLane - Beach Activity Bookings",
    description: "The fastest way to book amazing beach activities and water sports. Discover and reserve your perfect beach experience with just a few clicks.",
    siteName: "FastLane",
  },
  twitter: {
    card: "summary_large_image",
    title: "FastLane - Beach Activity Bookings",
    description: "The fastest way to book amazing beach activities and water sports. Discover and reserve your perfect beach experience with just a few clicks.",
    creator: "@fastlane",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
