"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // URL actual del navegador
    const url = window.location.href;

    // 1. Intenta usar la API nativa del móvil (Navigator Share)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        return;
      } catch (error) {
        console.log("Error al compartir o cancelado", error);
      }
    }

    // 2. Si falla o estamos en PC, copiamos al portapapeles
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Volver al icono original después de 2 segundos
      setTimeout(() => setCopied(false), 2000);
      
      // Opcional: Si tienes un sistema de Toast/Alertas, úsalo aquí.
      // alert("¡Enlace copiado!"); 
    } catch (err) {
      console.error("Error al copiar", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`
        flex items-center justify-center w-12 h-12 rounded-full 
        transition-all duration-300 shadow-sm
        ${copied 
          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-110" 
          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        }
      `}
      title="Compartir negocio"
    >
      {copied ? (
        <Check className="w-5 h-5" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
    </button>
  );
}
