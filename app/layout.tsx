import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body className="min-h-screen bg-baznas-paper text-baznas-ink antialiased selection:bg-baznas-green-100 selection:text-baznas-green-900">
        {children}
      </body>
    </html>
  );
}
