import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AudioProvider } from "@/components/providers/audio-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
    locale: 'es_AU', // Español en Australia
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
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <AudioProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
                <AudioPlayer />
              </AudioProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
