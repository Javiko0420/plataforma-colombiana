import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AudioProvider } from "@/components/providers/audio-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { getServerLocale } from '@/lib/i18n-server'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Latin Territory',
    default: 'Latin Territory - Tu comunidad latina en Australia',
  },
  description: "El punto de encuentro para profesionales, estudiantes y emprendedores latinos en Australia. Empleo, alojamiento, noticias y conexión cultural.",
  keywords: "Latinos en Australia, comunidad latina, colombianos en Australia, empleo, alojamiento, networking, Latin Territory",
  openGraph: {
    title: 'Latin Territory',
    description: 'Tu comunidad latina en Australia',
    type: 'website',
    locale: 'es_AU',
    siteName: 'Latin Territory',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLocale()
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Apple Smart Banner — native iOS prompt */}
        <meta name="apple-itunes-app" content="app-id=6775073125" />
        {/* Google Fonts — dirección visual "Sol" */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Work+Sans:wght@300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        {/* SVG Filters "Sol" — wobble + patrones decorativos */}
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute' }}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* Wobble fuerte — bordes dibujados a mano */}
            <filter id="lt-wobble" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
            </filter>
            {/* Wobble suave — para botones y badges */}
            <filter id="lt-wobble-soft" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
            </filter>
            {/* Patrón tejido — usado en footer overlay */}
            <pattern id="lt-weave" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 20 L 10 10 L 20 20 L 30 10 L 40 20 M 0 30 L 10 40 M 30 40 L 40 30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M 20 0 L 20 8 M 20 32 L 20 40" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            </pattern>
            {/* Patrón diamantes — decorativo */}
            <pattern id="lt-diamonds" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 16 4 L 28 16 L 16 28 L 4 16 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
              <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.5" />
            </pattern>
          </defs>
        </svg>

        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <AudioProvider>
                {children}
              </AudioProvider>
              <AppDownloadBanner />
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
