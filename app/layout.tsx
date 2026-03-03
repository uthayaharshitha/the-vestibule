import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import FloatingCreateButton from "@/components/FloatingCreateButton";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ReadModeProvider } from "@/contexts/ReadModeContext";
import GrainOverlay from "@/components/GrainOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Vestibule",
  description: "A quiet archive of in-between moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ReadModeProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppHeader />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <FloatingCreateButton />
            </ToastProvider>
          </ThemeProvider>
        </ReadModeProvider>
        <GrainOverlay />
      </body>
    </html>
  );
}
