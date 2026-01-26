import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { MapPin, Globe, Phone, Mail, MessageCircle, CheckCircle2, Share2, ArrowLeft, ImageIcon, Edit } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// 1. Metadata dinámica
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug 
  
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true }
  })

  if (!business) return { title: 'Negocio no encontrado' }

  return {
    title: `${business.name} | Latin Territory`,
    description: business.description.substring(0, 160),
    openGraph: {
      images: business.images[0] ? [business.images[0]] : [], // Usa la foto real para compartir en WhatsApp
    }
  }
}

// 2. Página Principal
export default async function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const session = await getServerSession(authOptions) // 👈 Obtenemos al usuario actual

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true, image: true } }
    }
  })

  if (!business) notFound()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* HERO SECTION (Portada Dinámica) */}
      <div className="relative h-64 md:h-96 bg-slate-900 overflow-hidden">
        
        {/* Lógica de Imagen de Fondo */}
        {business.images && business.images.length > 0 ? (
          <>
            <Image 
              src={business.images[0]} 
              alt={`Portada de ${business.name}`}
              fill
              className="object-cover opacity-60 blur-[2px] scale-105" // Un poco borrosa para resaltar el texto
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          </>
        ) : (
            // Fallback si no hay fotos
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90" />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-5xl md:text-9xl font-black text-white opacity-10 uppercase tracking-tighter select-none truncate max-w-4xl px-4">
                {business.category}
            </h1>
        </div>

        {/* Botón Volver */}
        <Link href="/directorio" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md transition-all text-sm font-medium border border-white/10">
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
        </Link>

        {/* BOTÓN DE EDICIÓN (Solo visible para el dueño) */}
        {session?.user?.id === business.ownerId && (
          <Link 
            href={`/negocio/editar/${business.slug}`}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-full shadow-lg shadow-blue-900/50 transition-all font-bold text-sm transform hover:scale-105"
          >
            <Edit className="w-4 h-4" />
            Editar Negocio
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQUIERDA (Info + Galería) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
              
              {/* Encabezado */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {business.category}
                        </span>
                        {business.isVerified && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Verificado
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                        {business.name}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{business.city || 'Australia'} {business.state && `, ${business.state}`}</span>
                    </div>
                </div>

                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 my-8" />

              {/* Descripción */}
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sobre nosotros</h3>
                <p className="whitespace-pre-line">{business.description}</p>
              </div>

              {/* NUEVA SECCIÓN: GALERÍA DE FOTOS */}
              {business.images && business.images.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" /> Galería
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.images.map((img, index) => (
                      <div key={index} className={`relative rounded-xl overflow-hidden shadow-sm group cursor-pointer ${index === 0 ? 'col-span-2 row-span-2 h-64 md:h-auto' : 'h-32'}`}>
                        <Image 
                          src={img} 
                          alt={`Foto ${index + 1} de ${business.name}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* COLUMNA DERECHA (Sidebar - Igual que antes) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contacto Directo</h3>
                <div className="space-y-4">
                    {business.whatsapp && (
                        <a 
                            href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20 transform hover:-translate-y-1"
                        >
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp
                        </a>
                    )}
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm">
                              <Phone className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Llamar</p>
                            <p className="font-medium text-slate-900 dark:text-white">{business.phone}</p>
                          </div>
                      </a>
                    )}
                    {business.email && (
                      <a href={`mailto:${business.email}`} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm">
                              <Mail className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                            <p className="font-medium text-slate-900 dark:text-white">{business.email}</p>
                          </div>
                      </a>
                    )}
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm">
                              <Globe className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Sitio Web</p>
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-[180px]">{business.website}</p>
                          </div>
                      </a>
                    )}
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
