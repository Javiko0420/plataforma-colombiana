"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    // Cloudinary devuelve la URL segura de la imagen
    onChange(result.info.secure_url);
  };

  if (!isMounted) return null;

  return (
    <div>
      {/* 1. Grid de imágenes ya subidas */}
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border border-slate-700">
            <div className="z-10 absolute top-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors shadow-lg"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Imagen del negocio"
              src={url}
            />
          </div>
        ))}
      </div>

      {/* 2. Botón de Carga (Cloudinary Widget) */}
      {value.length < 5 && ( // 👈 Límite de 5 imágenes visualmente
        <CldUploadWidget 
          onSuccess={onUpload} // Cambio en v6: usamos onSuccess en vez de onUpload
          uploadPreset="latinterritory_uploads" // ⚠️ PON AQUÍ EL NOMBRE DE TU PRESET
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            maxFiles: 5 - value.length, // Restamos las que ya subió
            maxFileSize: 2000000, // 2MB máximo (en bytes)
            sources: ['local', 'url', 'camera'],
            styles: {
                palette: {
                    window: "#0F172A",
                    sourceBg: "#1E293B",
                    windowBorder: "#334155",
                    tabIcon: "#3B82F6",
                    inactiveTabIcon: "#94A3B8",
                    menuIcons: "#64748B",
                    link: "#3B82F6",
                    action: "#3B82F6",
                    inProgress: "#0078FF",
                    complete: "#22C55E",
                    error: "#EF4444",
                    textDark: "#0F172A",
                    textLight: "#F8FAFC"
                }
            }
          }}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                disabled={disabled}
                onClick={() => open()}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-xl border border-dashed border-slate-600 transition-all w-full justify-center"
              >
                <ImagePlus className="w-5 h-5" />
                Subir Imágenes (Máx {5 - value.length})
              </button>
            );
          }}
        </CldUploadWidget>
      )}
      
      <p className="text-xs text-slate-500 mt-2">
        Máximo 5 fotos de 2MB cada una. Formatos: JPG, PNG, WEBP.
      </p>
    </div>
  );
}
