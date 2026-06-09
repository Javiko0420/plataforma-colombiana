'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from '@/components/providers/language-provider'

const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((m) => m.QRCodeSVG),
  { ssr: false }
)

type DeviceType = 'ios' | 'android' | 'desktop' | null

const DISMISSED_KEY = 'app_banner_dismissed'
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? 'https://apps.apple.com/us/app/latinterritory/id6775073125'
const GOOGLE_PLAY_URL = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ?? ''

function detectDevice(): DeviceType {
  const ua = navigator.userAgent
  const isStandalone =
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  if (isStandalone) return null
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

export function AppDownloadBanner() {
  const { t } = useTranslations()
  const [device, setDevice] = useState<DeviceType>(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    const detected = detectDevice()
    if (process.env.NODE_ENV === 'development') {
      console.log('[AppDownloadBanner] detected device:', detected)
    }
    if (!detected) return
    if (detected === 'android' && !GOOGLE_PLAY_URL) return
    setDevice(detected)
    setMounted(true)
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
    setTimeout(() => setMounted(false), 350)
  }

  if (!mounted) return null

  const isDesktop = device === 'desktop'

  return (
    <div
      role="banner"
      aria-label={t('banner.cta', 'Download the App')}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isDesktop ? '480px' : '100%',
          margin: isDesktop ? '0 auto 12px' : 0,
          borderRadius: isDesktop ? '16px' : '0',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: '0 -2px 20px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: isDesktop ? '12px 16px' : '10px 14px',
          minHeight: isDesktop ? '64px' : '56px',
          position: 'relative',
        }}
      >
        {/* App icon — solo móvil */}
        {!isDesktop && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e8b86d 0%, #c8963c 100%)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
            aria-hidden="true"
          >
            🌎
          </div>
        )}

        {/* QR code — solo desktop */}
        {isDesktop && (
          <div
            style={{
              background: '#fff',
              borderRadius: '6px',
              padding: '4px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <QRCodeSVG value={APP_STORE_URL} size={72} level="M" />
            <span style={{ fontSize: '9px', color: '#333', lineHeight: 1 }}>
              {t('banner.qr_label', 'Scan to download')}
            </span>
          </div>
        )}

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: '#fff',
              fontSize: isDesktop ? '15px' : '14px',
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t('banner.message', 'Want faster access?')}
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '12px',
              margin: '2px 0 0',
              lineHeight: 1.2,
            }}
          >
            Latin Territory App
          </p>
        </div>

        {/* CTA button */}
        {device === 'ios' && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('banner.cta', 'Download the App')}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#000',
              color: '#fff',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.1 268.5-317.1 71 0 130.1 46.9 174.9 46.9 42.8 0 110.1-49.9 190.5-49.9zm-160.1-90.5c0-75.4 46.9-141.2 112.4-182.5-51.6-79.4-142.8-124.2-227.8-124.2-90.5 0-172.7 53.1-218.1 53.1-43.5 0-115-49.3-199.5-49.3C92.7 18 20.9 62.8 0 100.2c.7 4.5 5.1 30.1 32.7 60.1 40.1 43.5 122.2 86.1 160.1 86.1 42.2 0 107.7-44.8 199.5-44.8 84.8 0 156.8 44.9 195.7 49z" />
            </svg>
            {t('banner.cta', 'Download')}
          </a>
        )}

        {device === 'android' && GOOGLE_PLAY_URL && (
          <span
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'not-allowed',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {t('banner.coming_soon', 'Coming soon')}
          </span>
        )}

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Cerrar banner"
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
