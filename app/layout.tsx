import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ultra Ping Pong - Cyberpunk Pong',
  description: 'Futuristic neon Pong game with cyberpunk aesthetics. Play against AI in this retro-futuristic arcade experience on Base.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="696f6a1fc0ab25addaaaf7a7" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0E27" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Farcaster Meta Tags for Discovery and In-App Opening */}
        <meta property="fc:frame" content='{"version":"1","name":"Ultra Ping Pong"}' />
        <meta property="og:title" content="Ultra Ping Pong - Cyberpunk Pong" />
        <meta property="og:description" content="Futuristic cyberpunk Pong game with neon aesthetics. Challenge AI in this retro-futuristic arcade experience on Base." />
        <meta property="og:image" content="https://ultra-ping-pong.vercel.app/hero-image.svg" />
        <meta property="og:url" content="https://ultra-ping-pong.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="farcaster:frame" content='{"version":"1","name":"Ultra Ping Pong"}' />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ultra Ping Pong - Cyberpunk Pong" />
        <meta name="twitter:description" content="Futuristic cyberpunk Pong game with neon aesthetics. Challenge AI in this retro-futuristic arcade experience on Base." />
        <meta name="twitter:image" content="https://ultra-ping-pong.vercel.app/hero-image.svg" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Google Fonts - Orbitron для cyberpunk тексту */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
        
        {/* Farcaster Frame SDK is automatically injected by Farcaster clients (e.g., Warpcast) when opened in Frame context */}
      </head>
      <body className="bg-[#0A0E27] overflow-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress extension-related errors
              window.addEventListener('error', function(e) {
                if (e.message && (
                  e.message.includes('chrome-extension://') ||
                  e.message.includes('tronlinkParams') ||
                  e.message.includes('Accessors and value') ||
                  e.message.includes('property descriptor')
                )) {
                  e.preventDefault();
                  return false;
                }
              }, true);
              
              // Suppress unhandled promise rejections from extensions
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (
                  String(e.reason).includes('chrome-extension://') ||
                  String(e.reason).includes('tronlinkParams')
                )) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}