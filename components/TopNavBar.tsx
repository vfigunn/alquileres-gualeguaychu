"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { href: "/departamentos", label: "Departamentos" },
  { href: "/casas", label: "Casas" },
  { href: "/locales", label: "Locales" },
  { href: "/terrenos", label: "Terrenos" },
];

export default function TopNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsCategoriesOpen(false);
  };

  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/30">
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
            <Link href="/" className="font-manrope text-label-md text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full">
              Inicio
            </Link>

            {/* Categories Dropdown */}
            <div
              ref={categoriesRef}
              className="relative"
            >
              <button
                className="font-manrope text-label-md text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full flex items-center gap-1"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                Categorías
                <span className="material-symbols-outlined text-[18px]">
                  {isCategoriesOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden min-w-[200px] z-50">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={closeMenu}
                      className="block font-manrope text-label-md text-on-surface-variant hover:bg-gold/10 hover:text-gold px-5 py-3 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/como-funciona" className="font-manrope text-label-md text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full">
              Como funciona
            </Link>
            <Link href="/contacto" className="font-manrope text-label-md text-on-surface-variant hover:text-gold hover:bg-[#D4AF37]/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out py-2 px-5 rounded-full">
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

      {/* Mobile Menu Overlay */}
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

          {/* Mobile Categories */}
          <div className="py-2">
            <p className="font-manrope text-label-sm text-outline uppercase tracking-wider mb-2 px-1">
              Categorías
            </p>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={closeMenu}
                className="font-manrope text-title-lg text-on-surface hover:text-gold py-3 border-b border-outline-variant/30 transition-colors flex items-center justify-between group"
              >
                {cat.label}
                <span className="material-symbols-outlined text-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
              </Link>
            ))}
          </div>

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
