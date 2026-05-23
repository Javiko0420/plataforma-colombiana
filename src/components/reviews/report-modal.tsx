"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { AccessibleModal } from "@/components/ui/accessible-modal";
import { LtButton } from "@/components/lt";

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
        className="text-xs flex items-center gap-1 transition-colors hover:opacity-80"
        style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
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
          <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
            ¿Por qué quieres reportar esta reseña? Esto nos ayuda a mantener segura la comunidad.
          </p>

          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 p-2 rounded-[var(--lt-radius-sm)] cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: selectedReason === reason ? 'var(--lt-bg)' : 'transparent' }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="accent-[var(--lt-terracota)]"
                />
                <span className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
                  {reason}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t-[2px] border-[var(--lt-ink)]">
            <LtButton
              onClick={() => setIsOpen(false)}
              variant="outline"
              tone="paper"
              size="sm"
            >
              Cancelar
            </LtButton>
            <LtButton
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              variant="sticker"
              tone="accent"
              size="sm"
              rotate={-1}
              loading={isSubmitting}
              loadingText="Enviando..."
            >
              Enviar Reporte
            </LtButton>
          </div>
        </div>
      </AccessibleModal>
    </>
  );
}
