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

export const metadata: Metadata = {
  title: {
    default: "OpenCode Insights — AI Coding Analytics Dashboard",
    template: "%s | OpenCode Insights",
  },
  description:
    "Track your AI coding sessions with OpenCode Insights. Visualize tokens, models, tools, files, and cost from your local OpenCode database. No cloud, no sign-up, 100% local.",
  keywords: [
    "opencode",
    "ai analytics",
    "coding dashboard",
    "token tracking",
    "AI usage",
    "local analytics",
    "open source",
    "developer tools",
    "Claude",
    "GPT",
    "LLM tracking",
  ],
  authors: [{ name: "Amanuel Tesfaye" }],
  creator: "Amanuel Tesfaye",
  publisher: "OpenCode Insights",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/Amanuel-Tesfaye-R/opencode-insights",
    title: "OpenCode Insights — AI Coding Analytics Dashboard",
    description:
      "Track tokens, models, tools, files, and cost from your local OpenCode database. No cloud, no sign-up, 100% local.",
    siteName: "OpenCode Insights",
    images: [
      {
        url: "https://raw.githubusercontent.com/Amanuel-Tesfaye-R/opencode-insights/master/public/screenshot-overview.png",
        width: 1200,
        height: 630,
        alt: "OpenCode Insights Dashboard Overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCode Insights — AI Coding Analytics Dashboard",
    description:
      "Track tokens, models, tools, files, and cost from your local OpenCode database.",
    images: [
      "https://raw.githubusercontent.com/Amanuel-Tesfaye-R/opencode-insights/master/public/screenshot-overview.png",
    ],
  },
  icons: {
    icon: "/logo.png",
  },
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
