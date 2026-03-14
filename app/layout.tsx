import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedixPrep — The UWorld for NREMT",
  description:
    "AI-powered EMS certification prep platform with FSRS spaced repetition, clinical scenarios, and protocol-verified guidance for EMT, AEMT, and Paramedic candidates.",
  keywords: ["NREMT", "EMT", "paramedic", "EMS", "certification", "spaced repetition", "FSRS"],
  openGraph: {
    title: "MedixPrep — The UWorld for NREMT",
    description: "AI-powered EMS certification prep. Study smarter, save lives.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain">{children}</body>
    </html>
  );
}
