"use client";

import { useState, useEffect } from "react";
import type { Property } from "@/lib/types";
import { typeLabel } from "@/lib/format";

export function PropertyGallery({ p }: { p: Property }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : p.images.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < p.images.length - 1 ? prev + 1 : 0));
      }
    };
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  if (p.images.length === 0) {
    return (
      <div className="mb-6 grid aspect-[16/9] w-full place-items-center rounded-2xl bg-surface-container text-on-surface-variant font-manrope">
        Sin imagen
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : p.images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < p.images.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row h-auto lg:h-[500px]">
      {/* Main Carousel View */}
      <div 
        className="w-full lg:w-2/3 h-[300px] lg:h-full relative bg-surface-container group cursor-pointer"
        onClick={() => setIsFullscreen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.images[currentIndex]}
          alt={`${p.title ?? "Propiedad"} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {p.featured && (
          <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-md font-manrope text-label-sm text-primary shadow-sm">
            Destacada
          </div>
        )}
        {p.property_type && (
          <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-md font-manrope text-label-sm text-primary shadow-sm">
            {typeLabel(p.property_type)}
          </div>
        )}

        {p.images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 text-primary p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-lowest shadow-md"
              aria-label="Imagen anterior"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 text-primary p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-lowest shadow-md"
              aria-label="Siguiente imagen"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-highest/60 backdrop-blur-md px-4 py-1.5 rounded-full text-on-surface text-label-sm font-manrope font-medium shadow-sm">
              {currentIndex + 1} / {p.images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Sidebar */}
      {p.images.length > 1 && (
        <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-2 p-2 bg-surface-container-low h-[120px] lg:h-full overflow-x-auto lg:overflow-y-auto">
          {p.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-1/3 lg:w-full h-full lg:h-[120px] shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === currentIndex ? "border-primary" : "border-transparent hover:border-primary/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {i !== currentIndex && (
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          
          {/* Main Image */}
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images[currentIndex]}
              alt={`Foto ${currentIndex + 1} en pantalla completa`}
              className="max-w-full max-h-full object-contain"
            />
            {p.images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Imagen anterior"
                >
                  <span className="material-symbols-outlined text-[32px]">chevron_left</span>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Siguiente imagen"
                >
                  <span className="material-symbols-outlined text-[32px]">chevron_right</span>
                </button>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1.5 rounded-full text-white font-manrope font-medium">
                  {currentIndex + 1} / {p.images.length}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {p.images.length > 1 && (
            <div className="h-[100px] shrink-0 w-full overflow-x-auto flex gap-2 p-2 bg-black/50">
              {p.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative h-full aspect-[4/3] shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
