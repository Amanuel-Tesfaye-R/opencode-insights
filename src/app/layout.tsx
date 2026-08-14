import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "animate.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://github.com/Amanuel-Tesfaye-R/opencode-usage-tracking";
const OG_IMAGE = `${BASE_URL}/raw/master/public/screenshot-overview.png`;

export const metadata: Metadata = {
  title: {
    default: "OpenCode Usage Tracking — AI Coding Analytics Dashboard",
    template: "%s | OpenCode Usage Tracking",
  },
  description:
    "Track your AI coding sessions with OpenCode Usage Tracking. Visualize tokens, models, tools, files edited, cost, and productivity from your local OpenCode database. No cloud, no sign-up, 100% local and private.",
  keywords: [
    "opencode",
    "opencode analytics",
    "opencode dashboard",
    "opencode usage tracking",
    "AI coding analytics",
    "token tracking",
    "token usage",
    "AI usage tracking",
    "LLM analytics",
    "local analytics",
    "self-hosted analytics",
    "developer analytics",
    "coding productivity",
    "AI productivity",
    "open source",
    "developer tools",
    "Claude analytics",
    "GPT tracking",
    "AI cost tracking",
    "sqlite dashboard",
  ],
  authors: [{ name: "Amanuel Tesfaye", url: BASE_URL }],
  creator: "Amanuel Tesfaye",
  publisher: "OpenCode Usage Tracking",
  category: "Developer Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    title: "OpenCode Usage Tracking — AI Coding Analytics Dashboard",
    description:
      "Track tokens, models, tools, files, cost, and productivity from your local OpenCode database. No cloud, no sign-up, 100% local.",
    siteName: "OpenCode Usage Tracking",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "OpenCode Usage Tracking Dashboard Overview",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCode Usage Tracking — AI Coding Analytics Dashboard",
    description:
      "Track tokens, models, tools, files, and cost from your local OpenCode database. 100% local and private.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/logo.png",
  },
  manifest: "/manifest.json",
  themeColor: "#00abe0",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
