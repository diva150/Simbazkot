"use client";

import React, { useState, useEffect } from "react";
import { Lock, Menu, X } from "lucide-react";
import { BAZNASMark } from "@/components/brand/BAZNASMark";

interface PublicNavbarProps {
  onOpenLogin: () => void;
  activeSection: string;
  onNavigateSection: (secId: string) => void;
}

const NAV_ITEMS = [
  { id: "beranda", label: "Beranda" },
  { id: "tentang", label: "Tentang BAZNAS" },
  { id: "struktur", label: "Struktur Organisasi" },
];

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenLogin,
  activeSection,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Subtle hairline muncul setelah scroll 4px — biar navbar terasa responsif
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md transition-shadow ${
        scrolled ? "border-b border-baznas-ink-8 shadow-rest" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <button
          onClick={() => handleNav("beranda")}
          className="flex items-center group focus:outline-none"
          aria-label="BAZNAS — Beranda"
        >
          <BAZNASMark variant="mark" size="md" className="text-baznas-green-800" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-md ${
                  isActive
                    ? "text-baznas-green-900"
                    : "text-baznas-ink/85 hover:text-baznas-ink"
                }`}
              >
                {item.label}
                {/* Underline indicator — only active item */}
                <span
                  aria-hidden="true"
                  className={`absolute left-3 right-3 -bottom-0.5 h-[2px] bg-baznas-gold-display transition-transform origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Action Button: Login Petugas */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/85 text-white px-4 py-2.5 text-sm font-semibold transition-colors min-h-t-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
            aria-label="Login Petugas Bidang"
          >
            <Lock className="h-3.5 w-3.5 text-baznas-gold-display" aria-hidden="true" />
            <span className="hidden sm:inline">Login Petugas</span>
            <span className="sm:hidden">Login</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md text-baznas-ink/85 hover:bg-baznas-paper md:hidden h-t-target w-t-target"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-baznas-ink-8 bg-white px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`block w-full text-left px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-baznas-green-900 border-l-2 border-baznas-gold-display bg-baznas-paper/60 pl-3"
                    : "text-baznas-ink/85 hover:bg-baznas-paper"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
