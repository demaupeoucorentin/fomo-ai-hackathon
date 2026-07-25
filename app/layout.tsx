import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/provider";
import { BRAND } from "@/lib/brand";

// Fontes avec du caractère, pas "IA générique" : Bricolage (titres) + Hanken (corps).
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const sans = Hanken_Grotesk({ variable: "--font-sans-brand", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-brand", subsets: ["latin"] });

export const metadata: Metadata = {
  title: BRAND,
  description: "Signal-driven comparator emails for sales",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
