import type { Metadata } from "next";
import { Playfair_Display, IM_Fell_English } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProgressProvider } from "@/context/ProgressContext";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-im-fell",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codex Mathematica — The Grand Archive",
  description:
    "An immersive dark-academia calculus ledger. Open an ancient volume, study its fragments, and commit your proofs to the parchment.",
  keywords: ["calculus", "mathematics", "integrals", "limits", "series", "education"],
  openGraph: {
    title: "Codex Mathematica",
    description:
      "Select a volume from the Grand Archive. Study. Reason. Commit your proof.",
    type: "website",
  },
};

import PrintableManuscript from "@/components/PrintableManuscript";
import ThemeSync from "@/components/ThemeSync";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${imFell.variable}`}>
      <body className="antialiased h-full">
        <ProgressProvider>
          <ThemeProvider>
            <AuthProvider>
              <ThemeSync />
              <div className="print:hidden h-full">
                {children}
              </div>
              <PrintableManuscript />
              <Analytics />
            </AuthProvider>
          </ThemeProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
