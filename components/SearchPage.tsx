"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { Property, PropertyType, Source } from "@/lib/types";
import { EMPTY_FILTERS, Filters } from "@/lib/filters";
import { PropertyCard } from "./PropertyCard";
import { typeLabel } from "@/lib/format";

const ALL_TYPES: PropertyType[] = [
  "casa",
  "departamento",
  "ph",
  "terreno",
  "local",
  "galpon",
  "otro",
];

type SortKey = "relevance" | "price_asc" | "price_desc" | "newest";

interface Facets {
  types: Record<string, number>;
  neighborhoods: Record<string, number>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PAGE_SIZE = 12;

export function SearchPage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [facets, setFacets] = useState<Facets>({ types: {}, neighborhoods: {} });
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [sources, setSources] = useState<Source[]>([]);

  // Hydrate from sessionStorage and URL query params on mount
  useEffect(() => {
    try {
      const savedFiltersRaw = sessionStorage.getItem("zcode_filters");
      const savedSort = sessionStorage.getItem("zcode_sort");
      const savedPage = sessionStorage.getItem("zcode_page");

      let initialFilters: Filters = savedFiltersRaw
        ? { ...EMPTY_FILTERS, ...JSON.parse(savedFiltersRaw) }
        : EMPTY_FILTERS;

      const tipoParam = searchParams.get("tipo");
      if (
        tipoParam &&
        ["casa", "departamento", "ph", "terreno", "local", "galpon", "otro"].includes(tipoParam)
      ) {
        initialFilters = { ...initialFilters, types: [tipoParam as PropertyType] };
      }

      const urlQ = searchParams.get("q");
      if (urlQ) initialFilters = { ...initialFilters, q: urlQ };

      const urlTypes = searchParams.get("types");
      if (urlTypes) {
        initialFilters = {
          ...initialFilters,
          types: urlTypes.split(",").filter((t): t is PropertyType =>
            ALL_TYPES.includes(t as PropertyType)
          ),
        };
      }

      const urlNeighborhoods = searchParams.get("neighborhoods");
      if (urlNeighborhoods) {
        initialFilters = {
          ...initialFilters,
          neighborhoods: urlNeighborhoods.split(",").filter(Boolean),
        };
      }

      const urlBedrooms = searchParams.get("bedroomsMin");
      if (urlBedrooms) initialFilters.bedroomsMin = Number(urlBedrooms) || null;

      const urlCurrency = searchParams.get("currency");
      if (urlCurrency === "ARS" || urlCurrency === "USD" || urlCurrency === "any") {
        initialFilters.currency = urlCurrency;
      }

      const urlGarage = searchParams.get("garageOnly");
      if (urlGarage) initialFilters.garageOnly = urlGarage === "true";

      setFilters(initialFilters);

      if (savedSort && ["relevance", "price_asc", "price_desc", "newest"].includes(savedSort)) {
        setSort(savedSort as SortKey);
      }

      const urlSort = searchParams.get("sort");
      if (urlSort && ["relevance", "price_asc", "price_desc", "newest"].includes(urlSort)) {
        setSort(urlSort as SortKey);
      }

      const initialPage = Number(savedPage || searchParams.get("page") || "1");
      setPage(Math.max(1, initialPage));
    } catch (e) {
      // ignore
    }

    setHydrated(true);
  }, []);

  // Persist filters, sort and page to sessionStorage
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem("zcode_filters", JSON.stringify(filters));
  }, [filters, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem("zcode_sort", sort);
  }, [sort, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem("zcode_page", String(page));
  }, [page, hydrated]);

  // Fetch sources once
  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then((d: Source[]) => setSources(d))
      .catch(() => setSources([]));
  }, []);

  // Fetch facets once
  useEffect(() => {
    fetch("/api/facets")
      .then((r) => r.json())
      .then((d: Facets) => setFacets(d))
      .catch(() => setFacets({ types: {}, neighborhoods: {} }))
      .finally(() => setFacetsLoading(false));
  }, []);

  // Fetch properties when filters/sort/page change
  useEffect(() => {
    if (!hydrated) return;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    params.set("sort", sort);

    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.types.length) params.set("types", filters.types.join(","));
    if (filters.neighborhoods.length) params.set("neighborhoods", filters.neighborhoods.join(","));
    if (filters.bedroomsMin != null) params.set("bedroomsMin", String(filters.bedroomsMin));
    if (filters.priceMin != null) params.set("priceMin", String(filters.priceMin));
    if (filters.priceMax != null) params.set("priceMax", String(filters.priceMax));
    if (filters.currency !== "any") params.set("currency", filters.currency);
    if (filters.garageOnly) params.set("garageOnly", "true");

    setLoading(true);
    setError(null);

    fetch(`/api/properties?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Error al cargar propiedades");
        return r.json();
      })
      .then((d: { properties: Property[]; pagination: PaginationInfo }) => {
        setProperties(d.properties);
        setPagination(d.pagination);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setProperties([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [filters, sort, page, hydrated]);

  // Reset page when filters change (except manual page navigation)
  const setFiltersAndResetPage = useCallback((next: Filters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const neighborhoods = useMemo(
    () => Object.keys(facets.neighborhoods).sort(),
    [facets.neighborhoods]
  );
  const activeTypes = new Set(filters.types);

  const toggleType = (t: PropertyType) => {
    const next = new Set(filters.types);
    next.has(t) ? next.delete(t) : next.add(t);
    setFiltersAndResetPage({ ...filters, types: [...next] });
  };

  const reset = () => {
    setFiltersAndResetPage(EMPTY_FILTERS);
    setSort("relevance");
  };

  const resultText = useMemo(() => {
    if (loading) return "Cargando...";
    if (error) return "Error al cargar datos";
    if (!pagination) return "Sin resultados";
    return `${pagination.totalCount} resultados encontrados`;
  }, [loading, error, pagination]);

  return (
    <>
      {/* SideNavBar (Filters) */}
      <aside
        className={`bg-surface-container-low dark:bg-surface-container-high h-fit w-80 sticky top-[120px] rounded-2xl overflow-hidden mt-8 ${
          showFilters ? "flex" : "hidden"
        } lg:flex flex-col border border-outline-variant/20 shadow-sm shrink-0`}
      >
        <div className="p-md border-b border-outline-variant/20 flex justify-between items-center">
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

        <div className="flex flex-col gap-md p-md font-manrope text-label-md">
          {/* Precio */}
          <div className="flex flex-col gap-2 group">
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
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={filters.priceMin ?? ""}
                onChange={(e) =>
                  setFiltersAndResetPage({
                    ...filters,
                    priceMin: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-1/2 rounded-lg border border-outline-variant/30 bg-surface-container focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary font-manrope text-label-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={filters.priceMax ?? ""}
                onChange={(e) =>
                  setFiltersAndResetPage({
                    ...filters,
                    priceMax: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-1/2 rounded-lg border border-outline-variant/30 bg-surface-container focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary font-manrope text-label-md px-3 py-2"
              />
            </div>
          </div>

          {/* Habitaciones */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-outline">bed</span>
              <span>Dormitorios mín.</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setFiltersAndResetPage({
                      ...filters,
                      bedroomsMin: filters.bedroomsMin === n ? null : n,
                    })
                  }
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

          {/* Tipo de Propiedad */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-outline">home_work</span>
              <span>Tipo de Propiedad</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {facetsLoading ? (
                <span className="text-label-sm text-on-surface-variant">Cargando...</span>
              ) : (
                ALL_TYPES.filter((t) => facets.types[t]).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
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
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-outline">location_on</span>
                <span>Barrio</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
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
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-outline">pool</span>
              <span>Servicios</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={filters.garageOnly}
                onChange={(e) =>
                  setFiltersAndResetPage({ ...filters, garageOnly: e.target.checked })
                }
                className="h-5 w-5 rounded border-outline-variant/50 text-gold focus:ring-gold"
              />
              <span>Solo con cochera</span>
            </label>
          </div>
        </div>

        <div className="p-md pt-0 mt-4">
          <button
            onClick={() => setShowFilters(false)}
            className="w-full font-manrope text-label-md bg-secondary text-on-secondary py-3 rounded-lg hover:bg-secondary-fixed-dim transition-colors shadow-sm lg:hidden"
          >
            Cerrar Filtros
          </button>
        </div>
      </aside>

      {/* Main Property Grid */}
      <section className="flex-grow flex flex-col gap-lg min-w-0 mt-8">
        {/* Hero / Search Minimal */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 flex flex-col items-center text-center">
          <h1 className="font-ebGaramond text-display-lg text-primary mb-4">
            Descubra Gualeguaychú
          </h1>
          <p className="font-manrope text-body-lg text-on-surface-variant mb-8 max-w-2xl">
            Propiedades residenciales exclusivas seleccionadas para quienes buscan confort, diseño
            y ubicación privilegiada en la ciudad.
          </p>
          <div className="relative w-full max-w-xl group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-gold transition-colors">
              search
            </span>
            <input
              value={filters.q}
              onChange={(e) => setFiltersAndResetPage({ ...filters, q: e.target.value })}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-outline-variant/30 bg-surface-container focus:bg-surface-container-lowest focus:border-gold focus:ring-1 focus:ring-gold font-manrope text-body-md transition-all"
              placeholder="Buscar por barrio, calle, palabra clave..."
              type="text"
            />
          </div>
        </div>

        {/* Header Grid */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h2 className="font-ebGaramond text-headline-lg text-primary">Propiedades Destacadas</h2>
            <p className="font-manrope text-body-md text-on-surface-variant mt-1">{resultText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="font-manrope text-label-md border border-outline-variant/30 rounded-lg px-4 py-2 hover:bg-surface-container-low transition-colors lg:hidden"
            >
              Filtros
            </button>
            <div className="flex items-center gap-2 font-manrope text-label-sm text-on-surface-variant">
              <span>Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortKey);
                  setPage(1);
                }}
                className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface font-semibold cursor-pointer focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2345464d%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat pr-8"
              >
                <option value="relevance">Relevancia</option>
                <option value="newest">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest py-20 text-center">
            <p className="font-manrope text-lg text-on-surface-variant">Cargando propiedades...</p>
          </div>
        ) : error ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest py-20 text-center">
            <p className="font-manrope text-lg text-error">{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest py-20 text-center">
            <p className="font-ebGaramond text-headline-md text-primary mb-2">No hay resultados</p>
            <p className="font-manrope text-body-md text-on-surface-variant mb-6">
              Pruebe ajustando los filtros de búsqueda.
            </p>
            <button
              onClick={reset}
              className="font-manrope text-label-md bg-gold text-black px-6 py-2 rounded-lg hover:bg-gold-dark transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {properties.map((p) => {
              const sourceName = sources.find((s) => s.slug === p.source)?.name;
              return <PropertyCard key={p.id} p={p} sourceName={sourceName} />;
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 rounded-lg border border-outline-variant/30 bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-manrope text-label-md"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1 font-manrope text-label-md">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    p === page
                      ? "bg-gold text-black font-bold"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 rounded-lg border border-outline-variant/30 bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-manrope text-label-md"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </>
  );
}
