import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SkyMetrics — Real-Time Weather Dashboard",
  description: "Track real-time weather conditions, view 5-day forecasts, compare cities, check air quality, and plan your travel with route weather insights and smart recommendations.",
  keywords: ["weather", "forecast", "travel planner", "route weather", "skymetrics", "air quality", "compare cities"],
  manifest: "/manifest.json",
  themeColor: "#38bdf8",
  openGraph: {
    title: "SkyMetrics — Real-Time Weather Dashboard",
    description: "Track real-time weather conditions and plan your travel with route weather insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Header />
        {children}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
