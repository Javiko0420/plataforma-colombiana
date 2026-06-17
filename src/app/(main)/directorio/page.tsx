// src/app/directorio/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DirectoryClient from './directory-client'
import { PageHeader } from '@/components/lh/PageHeader'

export const metadata: Metadata = {
  title: 'Directorio Latino | Latin Territory',
  description: 'Encuentra servicios, restaurantes y profesionales latinos en Australia.',
}

export const revalidate = 3600

export default async function DirectorioPage() {
  const businesses = await prisma.business.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
      whatsapp: true,
      instagram: true,
      images: true,
      isVerified: true,
    }
  })

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <PageHeader
        eyebrow="Directorio latino"
        title="Encuentra tu gente, tu sabor, tu hogar"
        subtitle="Conecta con el talento de nuestra comunidad — desde gastronomía hasta servicios profesionales en toda Australia."
        accent="var(--lh-terra)"
      />

      <DirectoryClient initialBusinesses={businesses} />
    </div>
  )
}
