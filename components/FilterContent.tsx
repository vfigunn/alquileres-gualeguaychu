"use client";

import type { PropertyType } from "@/lib/types";
import { Filters } from "@/lib/filters";
import { typeLabel } from "@/lib/format";

const ALL_TYPES: PropertyType[] = [
  "casa", "departamento", "ph", "terreno", "local", "galpon", "otro",
];

interface FilterContentProps {
  filters: Filters;
  facets: { types: Record<string, number>; neighborhoods: Record<string, number> };
  facetsLoading: boolean;
  neighborhoods: string[];
  activeTypes: Set<string>;
  setFiltersAndResetPage: (f: Filters) => void;
  toggleType: (t: PropertyType) => void;
  reset: () => void;
  onClose?: () => void;
}

export function FilterContent({
  filters, facets, facetsLoading, neighborhoods,
  activeTypes, setFiltersAndResetPage, toggleType, reset, onClose,
}: FilterContentProps) {
  return (
    <>
      <div className="p-md border-b border-outline-variant/20 flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-ebGaramond text-headline-md text-primary">Filtros Avanzados</h2>
          <p className="font-manrope text-label-sm text-on-surface-variant mt-1">
            Refine su búsqueda exclusiva
          </p>
        </div>
        <button
          onClick={reset}
          className="font-manrope text-label-sm text-secondary hover:underline"
        >
          Limpiar
        </button>
      </div>

      <div className="flex flex-col gap-md p-md font-manrope text-label-md overflow-y-auto flex-1">
        {/* Precio */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-outline">payments</span>
            <span>Precio</span>
          </div>
          <div className="flex gap-2">
            {(["any", "ARS", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFiltersAndResetPage({ ...filters, currency: c })}
                className={`flex-1 rounded-lg border py-2 text-center transition-colors ${
                  filters.currency === c
                    ? "border-gold bg-gold text-black"
                    : "border-outline-variant/30 hover:border-outline/50 text-on-surface-variant"
                }`}
              >
                {c === "any" ? "Todos" : c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number" placeholder="Mínimo"
              value={filters.priceMin ?? ""}
              onChange={(e) => setFiltersAndResetPage({ ...filters, priceMin: e.target.value ? Number(e.target.value) : null })}
              className="w-1/2 rounded-lg border border-outline-variant/30 bg-surface-container focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary font-manrope text-label-md px-3 py-2"
            />
            <input
              type="number" placeholder="Máximo"
              value={filters.priceMax ?? ""}
              onChange={(e) => setFiltersAndResetPage({ ...filters, priceMax: e.target.value ? Number(e.target.value) : null })}
              className="w-1/2 rounded-lg border border-outline-variant/30 bg-surface-container focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary font-manrope text-label-md px-3 py-2"
            />
          </div>
        </div>

        {/* Habitaciones */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-outline">bed</span>
            <span>Dormitorios mín.</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <button key={n}
                onClick={() => setFiltersAndResetPage({ ...filters, bedroomsMin: filters.bedroomsMin === n ? null : n })}
                className={`flex-1 rounded-lg border py-1.5 text-center transition-colors ${
                  filters.bedroomsMin === n
                    ? "border-gold bg-gold text-black"
                    : "border-outline-variant/30 hover:border-outline/50 text-on-surface-variant"
                }`}
              >
                {n}+
              </button>
            ))}
          </div>
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-outline">home_work</span>
            <span>Tipo de Propiedad</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {facetsLoading ? (
              <span className="text-label-sm text-on-surface-variant">Cargando...</span>
            ) : (
              ALL_TYPES.filter((t) => facets.types[t]).map((t) => (
                <button key={t} onClick={() => toggleType(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    activeTypes.has(t)
                      ? "border-gold bg-gold text-black"
                      : "border-outline-variant/30 bg-surface text-on-surface-variant hover:border-outline/50"
                  }`}
                >
                  {typeLabel(t)} ({facets.types[t]})
                </button>
              ))
            )}
          </div>
        </div>

        {/* Barrio */}
        {neighborhoods.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-outline">location_on</span>
              <span>Barrio</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {neighborhoods.map((n) => (
                <button key={n}
                  onClick={() => {
                    const next = new Set(filters.neighborhoods);
                    next.has(n) ? next.delete(n) : next.add(n);
                    setFiltersAndResetPage({ ...filters, neighborhoods: [...next] });
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    filters.neighborhoods.includes(n)
                      ? "border-gold bg-gold text-black"
                      : "border-outline-variant/30 bg-surface text-on-surface-variant hover:border-outline/50"
                  }`}
                >
                  {n} ({facets.neighborhoods[n]})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-outline">pool</span>
            <span>Servicios</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.garageOnly}
              onChange={(e) => setFiltersAndResetPage({ ...filters, garageOnly: e.target.checked })}
              className="h-5 w-5 rounded border-outline-variant/50 text-gold focus:ring-gold"
            />
            <span>Solo con cochera</span>
          </label>
        </div>
      </div>

      {/* Close button (mobile only) */}
      {onClose && (
        <div className="p-md pt-0 mt-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full font-manrope text-label-md bg-secondary text-on-secondary py-3 rounded-lg hover:bg-secondary-fixed-dim transition-colors shadow-sm"
          >
            Cerrar Filtros
          </button>
        </div>
      )}
    </>
  );
}
