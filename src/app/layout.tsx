import type { Metadata } from "next";
import { Dancing_Script, Jost, Poppins } from "next/font/google";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Announcement from "@/components/Announcement";
import { site } from "@/lib/site";
import "./globals.css";

// Headings: bold and modern, like "Smart" in the logo
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Handwriting, like "Your Time Matters..." in the logo
const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${site.name} | ${site.subtitle}`,
  description: site.description,
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${dancing.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Announcement />
        </Suspense>
        <Suspense fallback={<div className="h-[69px] border-b border-line/70" />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
