import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Latin Territory - Convocatoria Negocios Fundadores',
  description: 'Sé parte de los 100 primeros negocios en la plataforma más grande para latinos en Australia. Posicionamiento exclusivo y beneficios vitalicios.',
  openGraph: {
    title: 'Latin Territory - Negocios Fundadores',
    description: 'Convocatoria cerrada exclusiva para 100 Negocios Fundadores. Posicionamiento Top 1, insignia permanente y exposición internacional.',
    type: 'website',
    locale: 'es_AU',
    siteName: 'Latin Territory',
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
