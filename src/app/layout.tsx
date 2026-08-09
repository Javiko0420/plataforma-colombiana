import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AudioProvider } from "@/components/providers/audio-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { getServerLocale } from '@/lib/i18n-server'

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
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
