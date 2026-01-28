"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ReviewFormProps {
  businessId: string;
}

export default function ReviewForm({ businessId }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si no está logueado, mostramos botón de Login
  if (!session) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Inicia sesión para compartir tu opinión</p>
        <Link 
          href="/auth/signin" 
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Por favor selecciona una calificación (estrellas)");
    
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al publicar");
      }

      setComment("");
      setRating(0);
      router.refresh(); // Recarga la página para mostrar la nueva reseña
      alert("¡Gracias por tu opinión! ⭐");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Escribir una reseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de Estrellas */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400" // Estrella llena
                    : "text-slate-300 dark:text-slate-600" // Estrella vacía
                }`}
              />
            </button>
          ))}
        </div>

        {/* Texto */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció el servicio? Cuéntanos tu experiencia..."
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Publicando..." : "Publicar Reseña"}
        </button>
      </form>
    </div>
  );
}
