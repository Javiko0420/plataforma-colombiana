"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash } from "lucide-react";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  if (!isMounted) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-[var(--lt-radius-sm)] overflow-hidden border-[2px] border-[var(--lt-ink)]"
          >
            <div className="z-10 absolute top-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="p-1.5 rounded-full transition-colors border-[2px] border-[var(--lt-ink)]"
                style={{ background: 'var(--lt-accent)', color: 'var(--lt-paper)' }}
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

      {value.length < 5 && (
        <CldUploadWidget
          onSuccess={onUpload}
          uploadPreset="latinterritory_uploads"
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            maxFiles: 5 - value.length,
            maxFileSize: 2000000,
            sources: ['local', 'url', 'camera'],
            styles: {
              palette: {
                window: '#fff3d8',
                sourceBg: '#fffaee',
                windowBorder: '#22150f',
                tabIcon: '#b34020',
                inactiveTabIcon: '#7a4f3b',
                menuIcons: '#7a4f3b',
                link: '#b34020',
                action: '#b34020',
                inProgress: '#f0a932',
                complete: '#336940',
                error: '#b33868',
                textDark: '#22150f',
                textLight: '#fffaee',
              },
            },
          }}
        >
          {({ open }) => (
            <button
              type="button"
              disabled={disabled}
              onClick={() => open()}
              className="flex items-center gap-2 px-4 py-3 rounded-[var(--lt-radius-sm)] border-[2px] border-dashed border-[var(--lt-ink)] transition-all w-full justify-center"
              style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
            >
              <ImagePlus className="w-5 h-5" />
              Subir Imágenes (Máx {5 - value.length})
            </button>
          )}
        </CldUploadWidget>
      )}

      <p className="text-xs mt-2" style={{ color: 'var(--lt-ink-soft)' }}>
        Máximo 5 fotos de 2MB cada una. Formatos: JPG, PNG, WEBP.
      </p>
    </div>
  );
}
