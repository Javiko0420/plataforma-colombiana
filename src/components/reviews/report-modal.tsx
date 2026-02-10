"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { AccessibleModal } from "@/components/ui/accessible-modal";

interface ReportModalProps {
  reviewId: string;
}

const REPORT_REASONS = [
  "Es spam o publicidad",
  "Contenido ofensivo o de odio",
  "No es una experiencia real",
  "Conflicto de interés",
  "Información privada expuesta"
];

export default function ReportModal({ reviewId }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: selectedReason }),
      });
      
      if (!res.ok) throw new Error("Error al enviar reporte");
      
      alert("Gracias. Revisaremos esta reseña.");
      setIsOpen(false);
    } catch {
      alert("No pudimos enviar el reporte. Intenta luego.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors"
        aria-label="Reportar reseña"
      >
        <Flag className="w-3 h-3" />
        Reportar
      </button>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Reportar Reseña"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ¿Por qué quieres reportar esta reseña? Esto nos ayuda a mantener segura la comunidad.
          </p>

          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{reason}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar Reporte"}
            </button>
          </div>
        </div>
      </AccessibleModal>
    </>
  );
}
