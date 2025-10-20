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
  title: "Plataforma Colombiana - Conectando Emprendedores",
  description: "Descubre productos únicos, emprendimientos locales y mantente conectado con Colombia. Emisoras, clima, deportes y más.",
  keywords: "Colombia, emprendimientos, productos locales, emisoras, clima, deportes, foros",
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
