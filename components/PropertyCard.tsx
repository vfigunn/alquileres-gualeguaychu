"use client";

import Link from "next/link";
import type { Property } from "@/lib/types";
import { typeLabel } from "@/lib/format";
import { useState } from "react";

export function PropertyCard({ p, sourceName }: { p: Property; sourceName?: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : p.images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev < p.images.length - 1 ? prev + 1 : 0));
  };

  const cover = p.images[currentImageIndex];

  // Logic for Price (rent only on home page if both exist)
  const rentalPriceStr = p.price_ars != null 
    ? `$ ${p.price_ars.toLocaleString("es-AR")}` 
    : p.price_usd != null 
      ? `U$S ${p.price_usd.toLocaleString("es-AR")}` 
      : "Consultar";

  return (
    <Link
      href={`/propiedad/${p.slug ?? p.id}`}
      className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 hover:border-gold/30 transition-all shadow-sm hover:shadow-lg group cursor-pointer flex flex-col"
    >
      <div className="relative h-64 w-full overflow-hidden bg-surface-container group/carousel">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={p.title ?? "Propiedad"}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-on-surface-variant font-manrope">
            Sin imagen
          </div>
        )}
        
        {p.images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 text-gold p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-surface-container-lowest"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 text-gold p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-surface-container-lowest"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-surface-container-highest/50 px-2 py-1 rounded-full backdrop-blur-sm">
              {p.images.slice(0, 5).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImageIndex ? 'bg-gold' : 'bg-surface-container-lowest/80'}`} />
              ))}
              {p.images.length > 5 && (
                <div className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest/50" />
              )}
            </div>
          </>
        )}

        {p.featured && (
          <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-md font-manrope text-label-sm text-gold">
            Destacada
          </div>
        )}

        {p.property_type && (
          <div className="absolute top-4 right-4 bg-secondary text-on-secondary px-3 py-1 rounded-md font-manrope text-label-sm shadow-sm">
            {typeLabel(p.property_type)}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-ebGaramond text-headline-md text-primary mb-1 line-clamp-1">
          {p.title ?? "Propiedad"}
        </h3>
        <p className="font-manrope text-body-lg text-gold font-bold mb-2">
          {rentalPriceStr}
          {p.expenses_ars != null && <span className="text-body-md font-normal text-on-surface-variant ml-1">+ ${p.expenses_ars.toLocaleString("es-AR")} exp.</span>}
        </p>
        <p className="font-manrope text-body-md text-on-surface-variant mb-2 flex items-center gap-1 line-clamp-1">
          <span className="material-symbols-outlined text-[16px]">location_on</span>{" "}
          {p.address ?? p.neighborhood ?? "Gualeguaychú"}
        </p>
        
        {sourceName && (
          <p className="font-manrope text-label-sm text-on-surface-variant mb-4 line-clamp-1 text-right">
            Publicado por <span className="font-semibold text-primary ml-1">{sourceName}</span>
          </p>
        )}
        
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-outline-variant/30 pt-4 font-manrope text-label-sm text-on-surface-variant">
          <div className="flex flex-col"><span className="font-semibold text-gold">{p.bedrooms ?? "-"}</span> Dorm.</div>
          <div className="flex flex-col"><span className="font-semibold text-gold">{p.bathrooms ?? "-"}</span> Baños</div>
          <div className="flex flex-col"><span className="font-semibold text-gold">{p.area_total ?? "-"}</span> m²</div>
        </div>
      </div>
    </Link>
  );
}
