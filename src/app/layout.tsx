import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
    default: 'OpenCode Insights',
    template: '%s | OpenCode Insights',
  },
  description:
    'Local dashboard for OpenCode usage analytics. Read-only SQLite viewer with sessions, tools, models, projects, and tokens.',
  keywords: ['opencode', 'ai coding', 'analytics', 'dashboard', 'sqlite', 'cli', 'local', 'usage', 'tokens', 'sessions'],
  authors: [{ name: 'Amanuel Tesfaye', url: 'https://github.com/Amanuel-Tesfaye-R' }],
  openGraph: {
    title: 'OpenCode Insights',
    description:
      'Local dashboard for OpenCode usage analytics. No cloud, no telemetry.',
    url: 'https://opencode-insights.dev',
    siteName: 'OpenCode Insights',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenCode Insights',
    description:
      'Local dashboard for OpenCode usage analytics. No cloud, no telemetry.',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
