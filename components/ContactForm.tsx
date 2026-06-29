"use client";

import { useState, useEffect } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      inmobiliaria: formData.get("inmobiliaria") as string,
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      mensaje: formData.get("mensaje") as string,
    };

    // Basic frontend validation
    if (cooldown > 0) {
      setErrorMessage(`Por favor, espere ${cooldown} segundos antes de enviar otro mensaje.`);
      setStatus("error");
      return;
    }

    if (!data.inmobiliaria || !data.nombre || !data.email || !data.mensaje) {
      setErrorMessage("Por favor complete todos los campos obligatorios.");
      setStatus("error");
      return;
    }

    if (data.telefono && !/^[0-9+\-\s()]+$/.test(data.telefono)) {
      setErrorMessage("El teléfono solo puede contener números, espacios y los caracteres + - ( )");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        throw new Error("El servidor no devolvió una respuesta válida. Es posible que necesite reiniciar el servidor de desarrollo.");
      }

      if (!response.ok || result.error) {
        throw new Error(result.error?.message || "Ocurrió un error al enviar el mensaje.");
      }

      setStatus("success");
      setCooldown(60);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error.message || "Error de conexión. Intente nuevamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md relative z-10">
      {status === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-4 text-center">
          <p className="font-body-md font-semibold">¡Mensaje enviado con éxito!</p>
          <p className="font-body-sm mt-1">Nos pondremos en contacto a la brevedad.</p>
        </div>
      )}
      
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4 text-center">
          <p className="font-body-md font-semibold">Hubo un problema</p>
          <p className="font-body-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Inmobiliaria Field */}
      <div className="space-y-base">
        <label
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block"
          htmlFor="inmobiliaria"
        >
          Nombre de la inmobiliaria
        </label>
        <input
          className="w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-md text-body-md py-sm px-0 focus:ring-0 focus:border-b-primary transition-all placeholder-on-surface-variant/50 outline-none"
          id="inmobiliaria"
          name="inmobiliaria"
          placeholder="Ej. Inmobiliaria Gualeguaychú"
          required
          type="text"
          disabled={status === "loading"}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Name Field */}
        <div className="space-y-base">
          <label
            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block"
            htmlFor="nombre"
          >
            Nombre de la persona que se comunica
          </label>
          <input
            className="w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-md text-body-md py-sm px-0 focus:ring-0 focus:border-b-primary transition-all placeholder-on-surface-variant/50 outline-none"
            id="nombre"
            name="nombre"
            placeholder="Ej. Juan Pérez"
            required
            type="text"
            disabled={status === "loading"}
          />
        </div>
        {/* Email Field */}
        <div className="space-y-base">
          <label
            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block"
            htmlFor="email"
          >
            Correo electrónico
          </label>
          <input
            className="w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-md text-body-md py-sm px-0 focus:ring-0 focus:border-b-primary transition-all placeholder-on-surface-variant/50 outline-none"
            id="email"
            name="email"
            placeholder="juan@ejemplo.com"
            required
            type="email"
            disabled={status === "loading"}
          />
        </div>
      </div>
      {/* Phone Field */}
      <div className="space-y-base w-full md:w-1/2 md:pr-xs">
        <label
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block"
          htmlFor="telefono"
        >
          Teléfono o celular
        </label>
        <input
          className="w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-md text-body-md py-sm px-0 focus:ring-0 focus:border-b-primary transition-all placeholder-on-surface-variant/50 outline-none"
          id="telefono"
          name="telefono"
          placeholder="Ej. 3446 15123456"
          type="tel"
          disabled={status === "loading"}
        />
      </div>
      {/* Message Field */}
      <div className="space-y-base pt-sm">
        <label
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block"
          htmlFor="mensaje"
        >
          Mensaje
        </label>
        <textarea
          className="w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-md text-body-md py-sm px-0 focus:ring-0 focus:border-b-primary transition-all placeholder-on-surface-variant/50 resize-none outline-none"
          id="mensaje"
          name="mensaje"
          placeholder="¿En qué podemos ayudarle?"
          required
          rows={4}
          disabled={status === "loading"}
        ></textarea>
      </div>
      {/* Submit Button */}
      <div className="pt-md text-center md:text-left">
        <button
          className="w-full md:w-auto bg-primary-container text-on-primary-container hover:bg-primary-container/90 hover:text-on-primary font-label-md text-label-md px-lg py-4 rounded transition-all duration-200 inline-flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Enviando..." : "Enviar mensaje"}
          {status !== "loading" && (
            <span className="material-symbols-outlined text-xl">
              arrow_forward
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
