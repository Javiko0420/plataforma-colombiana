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
        await navigator.share({ title, text, url });
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
      title="Compartir"
      aria-label="Compartir"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 44, height: 44, borderRadius: '50%',
        border: '1px solid', cursor: 'pointer',
        transition: 'background .2s, color .2s, border-color .2s',
        background: copied ? 'var(--lh-green)' : 'var(--lh-surface)',
        borderColor: copied ? 'var(--lh-green)' : 'var(--lh-border)',
        color: copied ? '#fff' : 'var(--lh-fg2)',
      }}
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}
