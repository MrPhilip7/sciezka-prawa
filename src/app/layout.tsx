import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { AIAssistant } from "@/components/ai-assistant";
import "./globals.css";
import "@/styles/accessibility.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ścieżka Prawa - Śledzenie legislacji",
  description: "Śledź proces legislacyjny w Polsce. Monitoruj projekty ustaw, otrzymuj powiadomienia i bądź świadomym obywatelem.",
  keywords: ["legislacja", "sejm", "ustawy", "prawo", "polska", "tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="sciezka-prawa-theme">
          <AccessibilityProvider>
            {/* Skip link dla nawigacji klawiaturowej */}
            <a href="#main-content" className="skip-link">
              Przejść do głównej treści
            </a>
            {children}
            <AIAssistant />
            <Toaster position="top-right" richColors />
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
