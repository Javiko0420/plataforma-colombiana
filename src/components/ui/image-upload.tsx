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
          <div key={url} style={{ position: 'relative', width: 160, height: 160, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--lh-border)' }}>
            <button
              type="button"
              onClick={() => onRemove(url)}
              aria-label="Quitar imagen"
              style={{ position: 'absolute', zIndex: 10, top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 0, background: 'rgba(0,0,0,.6)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Trash size={15} />
            </button>
            <Image fill style={{ objectFit: 'cover' }} alt="Imagen del negocio" src={url} />
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
                window: '#FFFFFF',
                sourceBg: '#FAF6EF',
                windowBorder: '#181B21',
                tabIcon: '#2E5E8C',
                inactiveTabIcon: '#5C616D',
                menuIcons: '#5C616D',
                link: '#2E5E8C',
                action: '#2E5E8C',
                inProgress: '#D4A24C',
                complete: '#5C8A6B',
                error: '#D8775F',
                textDark: '#181B21',
                textLight: '#FFFFFF',
              },
            },
          }}
        >
          {({ open }) => (
            <button
              type="button"
              disabled={disabled}
              onClick={() => open()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px dashed var(--lh-border)', background: 'var(--lh-surface2)', color: 'var(--lh-fg2)', fontFamily: 'var(--lh-font)', fontSize: 14.5, fontWeight: 500, cursor: 'pointer' }}
            >
              <ImagePlus size={18} />
              Subir imágenes (máx {5 - value.length})
            </button>
          )}
        </CldUploadWidget>
      )}

      <p style={{ fontSize: 12.5, marginTop: 8, color: 'var(--lh-fg3)' }}>
        Máximo 5 fotos de 2MB cada una. Formatos: JPG, PNG, WEBP.
      </p>
    </div>
  );
}
