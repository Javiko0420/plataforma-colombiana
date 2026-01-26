'use client'

import { useTranslations } from '@/components/providers/language-provider'
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  Edit,          // 👈 Nuevo
  ExternalLink,  // 👈 Nuevo
  Calendar, 
  Mail, 
  User as UserIcon, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  Settings 
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image' // 👈 Agregado
import { DateDisplay } from '@/components/ui/date-display'

interface ProfileUser {
  id: string
  name: string | null
  email: string
  nickname: string | null
  role: string
  reputation: number
  image: string | null
  createdAt: Date
  lastLoginAt: Date | null
  postsCount: number
  commentsCount: number
  totalLikes: number
  businesses: Array<{
    id: string
    name: string
    slug: string
    category: string
    city: string | null
    isVerified: boolean
    images: string[]  // 👈 Agregado para mostrar miniatura
    createdAt: Date
  }>
}

interface RecentPost {
  id: string
  content: string
  createdAt: Date
  likesCount: number
  forum: {
    name: string
    slug: string
  }
}

interface RecentComment {
  id: string
  content: string
  createdAt: Date
  likesCount: number
  post: {
    id: string
    forum: {
      name: string
      slug: string
    }
  }
}

interface ProfileClientProps {
  user: ProfileUser
  recentPosts: RecentPost[]
  recentComments: RecentComment[]
}

export default function ProfileClient({ user, recentPosts, recentComments }: ProfileClientProps) {
  const { t } = useTranslations()

  const roleNames: Record<string, string> = {
    USER: 'Usuario',
    BUSINESS_OWNER: 'Propietario de Negocio',
    MODERATOR: 'Moderador',
    ADMIN: 'Administrador',
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.name || user.email}
                </h1>
                {user.nickname && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    @{user.nickname}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                    {roleNames[user.role] || user.role}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">{user.reputation} pts</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link 
                href="/perfil/editar"
                className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-600"
              >
                <Settings className="w-4 h-4" />
                Editar perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.postsCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.posts')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.commentsCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.comments')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <ThumbsUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.totalLikes}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.likes')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.reputation}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.reputation')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SECCIÓN: MIS NEGOCIOS */}
          <div className="lg:col-span-3 mb-8"> {/* Ocupa todo el ancho */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Mis Territorios (Negocios)
                </h2>
                <Link 
                  href="/registrar-negocio" 
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Nuevo Negocio
                </Link>
              </div>

              {user.businesses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aún no tienes negocios</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    ¡Es hora de conquistar el mercado! Registra tu emprendimiento y llega a miles de latinos en Australia.
                  </p>
                  <Link 
                    href="/registrar-negocio" 
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Comenzar ahora &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.businesses.map((business) => (
                    <div key={business.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 group flex flex-col">
                      
                      {/* Cabecera de color (Clickeable: lleva al público) */}
                      <Link href={`/negocio/${business.slug}`} className="block h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative cursor-pointer">
                        {business.isVerified && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                            <CheckCircle2 className="h-3 w-3" /> Verificado
                          </span>
                        )}
                      </Link>

                      <div className="p-4 pt-0 relative flex-1 flex flex-col">
                        {/* BLOQUE NUEVO (Miniatura inteligente) */}
                        <Link 
                          href={`/negocio/${business.slug}`} 
                          className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg border-4 border-white dark:border-slate-800 absolute -top-8 overflow-hidden shadow-md transition-transform group-hover:scale-110 relative"
                        >
                          {/* Si hay fotos, mostramos la primera */}
                          {business.images && business.images.length > 0 ? (
                            <Image
                              src={business.images[0]}
                              alt={business.name}
                              fill
                              className="object-cover"
                              sizes="64px" // Optimización para imágenes pequeñas
                            />
                          ) : (
                            // Si no hay fotos, mostramos el icono por defecto
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🏢
                            </div>
                          )}
                        </Link>

                        <div className="mt-10 flex-1">
                          <Link href={`/negocio/${business.slug}`} className="hover:text-blue-500 transition-colors">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                              {business.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                            {business.category}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <MapPin className="h-3 w-3" />
                            {business.city || 'Australia'}
                          </div>
                        </div>
                        
                        {/* 👇 NUEVA ZONA DE BOTONES DE ACCIÓN */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                          
                          {/* Botón 1: Ver Público */}
                          <Link 
                            href={`/negocio/${business.slug}`} 
                            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver Público
                          </Link>

                          {/* Botón 2: EDITAR (La clave) */}
                          <Link 
                            href={`/negocio/editar/${business.slug}`} 
                            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                          >
                            <Edit className="w-3 h-3" />
                            Gestionar
                          </Link>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Información
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.info.email')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.info.member')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      <DateDisplay date={user.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                    </p>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profile.info.lastLogin')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        <DateDisplay date={user.lastLoginAt} options={{ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('profile.activity.title')}
              </h2>

              {recentPosts.length === 0 && recentComments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('profile.activity.empty')}
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Recent Posts */}
                  {recentPosts.map((post) => (
                    <div
                      key={`post-${post.id}`}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/foros/${post.forum.slug}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {post.forum.name}
                          </Link>
                          <p className="text-gray-900 dark:text-white mt-1 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <DateDisplay date={post.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.likesCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Recent Comments */}
                  {recentComments.map((comment) => (
                    <div
                      key={`comment-${comment.id}`}
                      className="border-l-4 border-purple-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/foros/${comment.post.forum.slug}`}
                            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {comment.post.forum.name}
                          </Link>
                          <p className="text-gray-900 dark:text-white mt-1 line-clamp-2">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <DateDisplay date={comment.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {comment.likesCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

