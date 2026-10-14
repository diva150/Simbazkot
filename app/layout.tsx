import type { Metadata } from "next";
import { Inter, Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Self-host Google Fonts via next/font (replaces globals.css:1 @import which
// was render-blocking). next/font preloads the woff2 files, eliminates
// external requests to fonts.googleapis.com, and gives us proper font-display
// fallback behaviour.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
});
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sistem Pengelolaan & Arsip Data BAZNAS",
  description: "Aplikasi Terpusat Pengelolaan ZIS-DSKL, Pendistribusian, Keuangan, dan Administrasi BAZNAS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${poppins.variable} ${display.variable}`}
    >
      <body className="min-h-screen bg-baznas-paper text-baznas-ink antialiased selection:bg-baznas-green-100 selection:text-baznas-green-900">
        {children}
      </body>
    </html>
  );
}
