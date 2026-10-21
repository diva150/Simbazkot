"use client";

import React, { useState, useEffect } from "react";
import { Lock, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { EASE_SOFT, Pressable } from "@/components/motion";

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
  const reduceMotion = useReducedMotion();

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
      className={`sticky top-0 z-40 w-full border-b border-transparent bg-white/90 backdrop-blur-md transition-shadow duration-350 ease-zaiflu ${
        scrolled ? "shadow-rest" : ""
      }`}
    >
      {/* Hairline animasi di bawah header — slide-down + fade saat scroll. */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="public-navbar-hairline"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, y: -1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_SOFT }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-baznas-ink-8"
          />
        )}
      </AnimatePresence>

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo — Pressable memberi feedback tap; hover scale. */}
        <Pressable>
          <button
            onClick={() => handleNav("beranda")}
            className="flex items-center rounded-md transition-transform duration-350 ease-zaiflu hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
            aria-label="BAZNAS — Beranda"
          >
            <BAZNASMark variant="mark" size="md" className="text-baznas-green-800" />
          </button>
        </Pressable>

        {/* Desktop Navigation Links — underline morph pakai motion layoutId. */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-350 ease-zaiflu focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 ${
                  isActive
                    ? "text-baznas-green-900"
                    : "text-baznas-ink/85 hover:text-baznas-ink"
                }`}
              >
                {item.label}
                {/* Underline morph: layoutId satu id dipakai di semua item,
                    sehingga perpindahan item meluncur alih-alih fade-in/out. */}
                {isActive &&
                  (reduceMotion ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-baznas-gold-display"
                    />
                  ) : (
                    <motion.span
                      layoutId="public-navbar-underline"
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-baznas-gold-display"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ))}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Login Petugas + Mobile toggle */}
        <div className="flex items-center gap-2">
          <Pressable>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 rounded-card bg-baznas-ink px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-350 ease-zaiflu hover:-translate-y-0.5 hover:bg-baznas-ink/85 hover:shadow-glow min-h-t-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
              aria-label="Login Petugas Bidang"
            >
              <Lock className="h-3.5 w-3.5 text-baznas-gold-display" aria-hidden="true" />
              <span className="hidden sm:inline">Login Petugas</span>
              <span className="sm:hidden">Login</span>
            </button>
          </Pressable>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-t-target w-t-target items-center justify-center rounded-md text-baznas-ink/85 transition-colors duration-350 ease-zaiflu hover:bg-baznas-paper md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown — AnimatePresence slide-down + fade. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="public-navbar-mobile"
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE_SOFT }}
            className="border-t border-baznas-ink-8 bg-white px-4 py-2 md:hidden"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`block w-full rounded-md px-3 py-3 text-left text-sm font-semibold transition-colors duration-350 ease-zaiflu ${
                    isActive
                      ? "border-l-2 border-baznas-gold-display bg-baznas-paper/60 pl-3 text-baznas-green-900"
                      : "text-baznas-ink/85 hover:bg-baznas-paper"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNavbar;