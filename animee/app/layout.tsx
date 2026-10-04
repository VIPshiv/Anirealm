import type { Metadata } from "next";
import { Inter, Potta_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import SmoothScrolling from "@/components/SmoothScrolling";
import CursorParticles from "@/components/CursorParticles";
import { ColorModeScript } from '@chakra-ui/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import theme from './theme';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pottaOne = Potta_One({
  subsets: ["latin"],
  variable: "--font-potta-one",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anirealm | Premium Anime Experience",
  description: "Track, Discover, and Experience Anime like never before.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${pottaOne.variable} antialiased`}
        suppressHydrationWarning
        style={{ fontFamily: 'var(--font-potta-one), sans-serif' }}
      >
        <ColorModeScript initialColorMode="dark" />
        <Providers>
          <CursorParticles />
          <SmoothScrolling>
            {children}
          </SmoothScrolling>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}