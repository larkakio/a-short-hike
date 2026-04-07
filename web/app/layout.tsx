import type { Metadata, Viewport } from "next";
import { Geist_Mono, Orbitron } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "@/components/providers";
import { wagmiConfig } from "@/lib/wagmi-config";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Neon Summit Hike",
  description:
    "A pocket mountain hike inspired by A Short Hike — swipe, collect neon feathers, reach the summit. Built for Base.",
  appleWebApp: { capable: true },
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
  openGraph: {
    title: "Neon Summit Hike",
    description:
      "Cyberpunk neon hiking mini-game on Base — swipe, collect, summit.",
    images: ["/app-thumbnail.jpg"],
  },
  ...(baseAppId ? { other: { "base:app_id": baseAppId } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#050510",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookie = headerList.get("cookie");
  const initialState = cookieToInitialState(wagmiConfig, cookie ?? undefined);

  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
