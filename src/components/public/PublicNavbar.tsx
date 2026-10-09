"use client";

import React, { useState } from "react";
import { Lock, Menu, X, ShieldCheck } from "lucide-react";

interface PublicNavbarProps {
  onOpenLogin: () => void;
  activeSection: string;
  onNavigateSection: (secId: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenLogin,
  activeSection,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "beranda", label: "Beranda" },
    { id: "tentang", label: "Tentang BAZNAS" },
    { id: "struktur", label: "Struktur Organisasi" },
  ];

  const handleNav = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div
          onClick={() => handleNav("beranda")}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-baznas-green-900 to-baznas-green-700 shadow-md shadow-baznas-green-900/20 text-white font-bold font-poppins text-xl">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 font-poppins leading-none">
                BAZNAS
              </span>
              <span className="hidden sm:inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-baznas-green-800">
                Pusat
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Badan Amil Zakat Nasional</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/70 p-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-baznas-green-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Login Petugas */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-baznas-green-800/20 transition-all hover:shadow-lg"
          >
            <Lock className="h-3.5 w-3.5 text-baznas-gold-500" />
            <span>Login Petugas Bidang</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
