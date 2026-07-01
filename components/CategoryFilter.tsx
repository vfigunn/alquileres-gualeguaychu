"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { SearchPage } from "./SearchPage";

function CategoryFilterInner({ tipo }: { tipo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If we're on a category page without the tipo filter in URL, redirect
    const currentTipo = searchParams.get("tipo");
    if (
      pathname !== "/" &&
      !currentTipo &&
      ["departamento", "casa", "local", "terreno"].includes(tipo)
    ) {
      // Redirect to homepage with tipo filter
      router.replace(`/?tipo=${tipo}`);
    }
  }, [pathname, searchParams, tipo, router]);

  // Render SearchPage — once redirected to /?tipo=X, SearchPage will auto-filter
  return (
    <div className="mt-8">
      <h2 className="font-ebGaramond text-headline-md text-primary mb-4">
        Resultados
      </h2>
      <Suspense
        fallback={
          <div className="w-full min-h-[30vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        }
      >
        <SearchPage />
      </Suspense>
    </div>
  );
}

export function CategoryFilter({ tipo }: { tipo: string }) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <CategoryFilterInner tipo={tipo} />
    </Suspense>
  );
}
