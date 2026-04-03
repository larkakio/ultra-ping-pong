import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const appId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ultra-ping-pong.vercel.app";

export const metadata: Metadata = {
  title: "Ultra Ping Pong - Cyberpunk Pong",
  description:
    "Futuristic neon Pong game with cyberpunk aesthetics. Play against AI in this retro-futuristic arcade experience on Base.",
  metadataBase: new URL(siteUrl),
  other: {
    "base:app_id": appId,
  },
  openGraph: {
    title: "Ultra Ping Pong - Cyberpunk Pong",
    description:
      "Futuristic cyberpunk Pong game with neon aesthetics. Challenge AI in this retro-futuristic arcade experience on Base.",
    images: [`${siteUrl}/hero-image.svg`],
    url: siteUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ultra Ping Pong - Cyberpunk Pong",
    description:
      "Futuristic cyberpunk Pong game with neon aesthetics. Challenge AI in this retro-futuristic arcade experience on Base.",
    images: [`${siteUrl}/hero-image.svg`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0A0E27" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-hidden bg-[#0A0E27]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
