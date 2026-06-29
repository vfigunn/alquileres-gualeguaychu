"use client";

import Link from "next/link";
import { useState } from "react";

export default function TopNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-surface/80 dark:bg-surface-container-lowest/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/30 dark:border-outline/20">
        <div className="flex justify-between items-center px-gutter py-md max-w-container-max mx-auto">
          <div className="flex-1 flex justify-start z-50">
            <Link href="/" onClick={closeMenu} className="hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 transition-all duration-300 ease-out inline-flex items-center origin-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ag-logo-horizontal-transparent.png" alt="Alquileres Gualeguaychú Logo" className="h-14 md:h-16 w-auto object-contain" />
              <span className="sr-only">Alquileres Gualeguaychú</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-none items-center justify-center gap-lg">
            <Link href="/" className="font-manrope text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full">
              Inicio
            </Link>
            <Link href="/como-funciona" className="font-manrope text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full">
              Como funciona
            </Link>
            <Link href="/contacto" className="font-manrope text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full">
              Contacto
            </Link>
          </nav>
          <div className="flex-1 hidden md:block"></div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-end flex-1 z-50">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high/50 transition-colors"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay — FUERA del header para evitar backdrop-blur */}
      <div 
        className={`fixed inset-0 top-[73px] bg-white transition-all duration-300 ease-in-out md:hidden flex flex-col px-gutter z-40 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-4 mt-8">
          <Link 
            href="/" 
            onClick={closeMenu}
            className="font-manrope text-title-lg text-on-surface hover:text-gold py-4 border-b border-outline-variant/30 transition-colors flex items-center justify-between group"
          >
            Inicio
            <span className="material-symbols-outlined text-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
          </Link>
          <Link 
            href="/como-funciona" 
            onClick={closeMenu}
            className="font-manrope text-title-lg text-on-surface hover:text-gold py-4 border-b border-outline-variant/30 transition-colors flex items-center justify-between group"
          >
            Como funciona
            <span className="material-symbols-outlined text-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
          </Link>
          <Link 
            href="/contacto" 
            onClick={closeMenu}
            className="font-manrope text-title-lg text-on-surface hover:text-gold py-4 border-b border-outline-variant/30 transition-colors flex items-center justify-between group"
          >
            Contacto
            <span className="material-symbols-outlined text-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
