import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Elegant sans-serif for body text
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Luxurious serif for headings
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Monospace for code
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://viralfluencer.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "ViralFluencer - Premier Influencer Marketing Platform",
    template: "%s | ViralFluencer",
  },
  description:
    "Connect with top influencers and grow your brand. The leading platform for influencer marketing campaigns, escrow payments, and collaboration management.",
  metadataBase: new URL(APP_URL),
  keywords: [
    "influencer marketing",
    "brand collaborations",
    "creator economy",
    "influencer platform",
    "campaign management",
    "social media marketing",
  ],
  authors: [{ name: "ViralFluencer" }],
  creator: "ViralFluencer",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "ViralFluencer",
    title: "ViralFluencer - Premier Influencer Marketing Platform",
    description:
      "Connect with top influencers and grow your brand. The leading platform for influencer marketing campaigns.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ViralFluencer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ViralFluencer - Premier Influencer Marketing Platform",
    description:
      "Connect with top influencers and grow your brand. The leading platform for influencer marketing campaigns.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
