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
  metadataBase: new URL("https://oryn.finance"),
  title: {
    template: "%s | Oryn Finance",
    default: "Oryn Finance | One Bridge. Every Avalanche L1.",
  },
  description:
    "Oryn Finance delivers the fastest way to move across Avalanche Layer 1s with an upgrade-ready connectivity layer built for the future of interoperability.",
  applicationName: "Oryn Finance",
  keywords: [
    "Oryn Finance",
    "Avalanche",
    "interoperability",
    "Layer 1 bridge",
    "crypto bridge",
    "DeFi connectivity",
  ],
  authors: [{ name: "Oryn Finance" }],
  creator: "Oryn Finance",
  publisher: "Oryn Finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Oryn Finance | One Bridge. Every Avalanche L1.",
    description:
      "The fastest way to go inter-L1 within Avalanche, powered by an upgrade-ready connectivity layer built for the future of interoperability.",
    url: "https://oryn.finance",
    siteName: "Oryn Finance",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oryn Finance — Avalanche Interoperability Layer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oryn Finance | One Bridge. Every Avalanche L1.",
    description:
      "Accelerate cross-L1 movement on Avalanche with Oryn Finance's upgrade-ready connectivity layer.",
    images: ["/og-image.png"],
    creator: "@orynfinance",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/OrynLogo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
