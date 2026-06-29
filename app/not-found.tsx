import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <h1 className="font-ebGaramond text-[120px] md:text-[180px] leading-none font-bold text-primary/10 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[80px] md:text-[120px] drop-shadow-md">
            location_off
          </span>
        </div>
      </div>
      
      <h2 className="mt-8 font-ebGaramond text-headline-lg md:text-display-sm text-on-surface">
        ¡Ups! Perdimos el rumbo
      </h2>
      
      <p className="mt-4 font-manrope text-body-lg text-on-surface-variant max-w-md mx-auto">
        La página que intentás visitar no existe, fue movida o no está disponible en este momento.
      </p>
      
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 bg-primary text-on-primary font-manrope font-medium text-label-lg py-3 px-8 rounded-full hover:bg-primary/90 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
      >
        <span className="material-symbols-outlined text-[20px]">
          home
        </span>
        Volver al inicio
      </Link>
    </div>
  );
}
