import { Suspense } from "react";
import { SearchPage } from "@/components/SearchPage";

function SearchPageFallback() {
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="font-manrope text-body-md text-on-surface-variant">Cargando...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPage />
    </Suspense>
  );
}
