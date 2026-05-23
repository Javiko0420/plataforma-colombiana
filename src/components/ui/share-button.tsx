"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

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

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border-[2px] border-[var(--lt-ink)] shadow-[var(--lt-shadow-sticker)]"
      style={{
        background: copied ? 'var(--lt-verde)' : 'var(--lt-paper)',
        color: copied ? 'var(--lt-paper)' : 'var(--lt-ink-soft)',
        transform: copied ? 'scale(1.1)' : 'scale(1)',
      }}
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
