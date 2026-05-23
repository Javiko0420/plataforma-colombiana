'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/components/providers/language-provider'
import { 
  Briefcase,
  Building2, 
  CalendarDays,
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  Edit,
  ExternalLink,
  Calendar, 
  Mail, 
  User as UserIcon, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  Settings,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DateDisplay } from '@/components/ui/date-display'
import UserJobOffers from '@/components/jobs/UserJobOffers'
import UserEvents from '@/components/eventos/UserEvents'
import JobPostingContractModal from '@/components/jobs/JobPostingContractModal'
import EventPostingContractModal from '@/components/eventos/EventPostingContractModal'
import { acceptJobPostingTerms } from '@/app/actions/jobActions'
import { acceptEventPostingTerms } from '@/app/actions/eventActions'
import { JobOffer, Event } from '@prisma/client'
import { LtPageShell, LtPanel, LtButton, LtBadge, LtEmptyState, SunMotif, Squiggle } from '@/components/lt'

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
    images: string[]
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
  userJobs: JobOffer[]
  userEvents: Event[]
  hasAcceptedJobPostingTerms: boolean
  hasAcceptedEventPostingTerms: boolean
}

const statCards = [
  { key: 'posts', icon: MessageSquare, tone: 'terracota' as const, valueKey: 'postsCount' as const },
  { key: 'comments', icon: MessageSquare, tone: 'accent' as const, valueKey: 'commentsCount' as const },
  { key: 'likes', icon: ThumbsUp, tone: 'verde' as const, valueKey: 'totalLikes' as const },
  { key: 'reputation', icon: Award, tone: 'sun' as const, valueKey: 'reputation' as const },
]

export default function ProfileClient({ user, recentPosts, recentComments, userJobs, userEvents, hasAcceptedJobPostingTerms, hasAcceptedEventPostingTerms }: ProfileClientProps) {
  const router = useRouter()
  const { t } = useTranslations()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false)
  const [showEventContractModal, setShowEventContractModal] = useState(false)
  const [isAcceptingEventTerms, setIsAcceptingEventTerms] = useState(false)

  const handleDeleteBusiness = async (businessId: string, businessName: string) => {
    const confirmed = window.confirm(
      `⚠️ ¿Estás seguro de que quieres eliminar "${businessName}"?\n\nEsta acción no se puede deshacer y borrará todas las fotos y reseñas asociadas.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error al eliminar')

      alert('Negocio eliminado correctamente.')
      router.refresh()
    } catch {
      alert('Hubo un error al intentar eliminar el negocio.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishJobClick = () => {
    if (hasAcceptedJobPostingTerms) {
      router.push('/empleos/publicar')
    } else {
      setShowContractModal(true)
    }
  }

  const handleAcceptTerms = async () => {
    setIsAcceptingTerms(true)
    try {
      const result = await acceptJobPostingTerms()
      if (result.success) {
        setShowContractModal(false)
        router.push('/empleos/publicar')
      } else {
        alert(result.error || 'Error al aceptar los términos.')
      }
    } catch {
      alert('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsAcceptingTerms(false)
    }
  }

  const handlePublishEventClick = () => {
    if (hasAcceptedEventPostingTerms) {
      router.push('/perfil/eventos/crear')
    } else {
      setShowEventContractModal(true)
    }
  }

  const handleAcceptEventTerms = async () => {
    setIsAcceptingEventTerms(true)
    try {
      const result = await acceptEventPostingTerms()
      if (result.success) {
        setShowEventContractModal(false)
        router.push('/perfil/eventos/crear')
      } else {
        alert(result.error || 'Error al aceptar los términos.')
      }
    } catch {
      alert('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsAcceptingEventTerms(false)
    }
  }

  const roleNames: Record<string, string> = {
    USER: 'Usuario',
    BUSINESS_OWNER: 'Propietario de Negocio',
    MODERATOR: 'Moderador',
    ADMIN: 'Administrador',
  }

  const statValues: Record<string, number> = {
    postsCount: user.postsCount,
    commentsCount: user.commentsCount,
    totalLikes: user.totalLikes,
    reputation: user.reputation,
  }

  return (
    <LtPageShell>
      {/* Header */}
      <LtPanel className="overflow-hidden mb-8" shadow="lg">
        <div
          className="relative h-28 border-b-[2.2px] border-[var(--lt-ink)] overflow-hidden"
          style={{ background: 'var(--lt-sun)' }}
        >
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-end pr-6 opacity-20">
            <SunMotif size={120} />
          </div>
        </div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14">
            <div
              className="w-28 h-28 rounded-full border-[3px] border-[var(--lt-ink)] flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-14 h-14" style={{ color: 'var(--lt-ink-soft)' }} aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl sm:text-3xl font-black truncate"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                {user.name || user.email}
              </h1>
              {user.nickname && (
                <p className="text-base" style={{ color: 'var(--lt-ink-soft)' }}>
                  @{user.nickname}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <LtBadge tone="terracota" rotate={-1}>
                  {roleNames[user.role] || user.role}
                </LtBadge>
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--lt-ink)' }}>
                  <Award className="h-4 w-4" style={{ color: 'var(--lt-sun)' }} aria-hidden="true" />
                  {user.reputation} pts
                </div>
              </div>
            </div>

            <Link href="/perfil/editar">
              <LtButton variant="outline" tone="paper" size="sm" iconLeft={<Settings className="w-4 h-4" />}>
                Editar perfil
              </LtButton>
            </Link>
          </div>
        </div>
      </LtPanel>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ key, icon: Icon, tone, valueKey }, i) => (
          <LtPanel key={key} tone="paper" shadow="sm" className="p-5">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)]"
                style={{
                  background: tone === 'sun' ? 'var(--lt-sun)' : tone === 'terracota' ? 'var(--lt-terracota)' : tone === 'verde' ? 'var(--lt-verde)' : 'var(--lt-accent)',
                  color: tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                  boxShadow: '2px 2px 0 var(--lt-ink)',
                  transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-black" style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}>
                  {statValues[valueKey]}
                </p>
                <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                  {t(`profile.stats.${key}`)}
                </p>
              </div>
            </div>
          </LtPanel>
        ))}
      </div>

      {/* Action bar */}
      <div className="mb-8 flex flex-wrap gap-3 justify-end">
        <LtButton
          variant="sticker"
          tone="sun"
          size="md"
          rotate={-1}
          iconLeft={<CalendarDays className="w-5 h-5" />}
          onClick={handlePublishEventClick}
        >
          Publicar Evento
        </LtButton>
        <LtButton
          variant="sticker"
          tone="terracota"
          size="md"
          rotate={1}
          iconLeft={<PlusCircle className="w-5 h-5" />}
          onClick={handlePublishJobClick}
        >
          Publicar Oferta de Empleo
        </LtButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-8">

          {/* Mis Eventos */}
          <LtPanel shadow="md">
            <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b-[2.2px] border-[var(--lt-ink)]">
              <h2
                className="text-xl font-bold flex items-center gap-2"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                <CalendarDays className="h-5 w-5" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                Mis Eventos
              </h2>
              <LtButton
                variant="sticker"
                tone="sun"
                size="sm"
                rotate={-1}
                iconLeft={<PlusCircle className="h-4 w-4" />}
                onClick={handlePublishEventClick}
              >
                Nuevo Evento
              </LtButton>
            </div>
            <div className="p-5">
              <UserEvents initialEvents={userEvents} onCreateClick={handlePublishEventClick} />
            </div>
          </LtPanel>

          {/* Mis Ofertas */}
          <LtPanel shadow="md">
            <div className="p-5 border-b-[2.2px] border-[var(--lt-ink)]">
              <h2
                className="text-xl font-bold flex items-center gap-2"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                <Briefcase className="h-5 w-5" style={{ color: 'var(--lt-sun)' }} aria-hidden="true" />
                Mis Ofertas de Empleo
              </h2>
            </div>
            <div className="p-5">
              <UserJobOffers initialJobs={userJobs} onCreateClick={handlePublishJobClick} />
            </div>
          </LtPanel>

          {/* Mis Negocios */}
          <LtPanel shadow="md">
            <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b-[2.2px] border-[var(--lt-ink)]">
              <h2
                className="text-xl font-bold flex items-center gap-2"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                <Building2 className="h-5 w-5" style={{ color: 'var(--lt-verde)' }} aria-hidden="true" />
                Mis Territorios (Negocios)
              </h2>
              <Link href="/registrar-negocio">
                <LtButton variant="sticker" tone="verde" size="sm" rotate={1} iconLeft={<PlusCircle className="h-4 w-4" />}>
                  Nuevo Negocio
                </LtButton>
              </Link>
            </div>
            <div className="p-5">
              {user.businesses.length === 0 ? (
                <LtEmptyState
                  title="Aún no tienes negocios"
                  description="¡Es hora de conquistar el mercado! Registra tu emprendimiento y llega a miles de latinos en Australia."
                  icon={<Building2 className="w-12 h-12" style={{ color: 'var(--lt-ink-soft)' }} />}
                  action={
                    <Link href="/registrar-negocio">
                      <LtButton variant="sticker" tone="verde" size="md" rotate={-1}>
                        Comenzar ahora
                      </LtButton>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {user.businesses.map((business, i) => (
                    <LtPanel key={business.id} tone="bg" shadow="sm" className="overflow-hidden group flex flex-col">
                      <Link
                        href={`/negocio/${business.slug}`}
                        className="block h-20 relative border-b-[2px] border-[var(--lt-ink)]"
                        style={{ background: i % 2 === 0 ? 'var(--lt-terracota)' : 'var(--lt-verde)' }}
                      >
                        {business.isVerified && (
                          <span className="absolute top-2 right-2 z-10">
                            <LtBadge tone="sun" rotate={1}>
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Verificado
                            </LtBadge>
                          </span>
                        )}
                      </Link>

                      <div className="p-4 pt-0 relative flex-1 flex flex-col">
                        <Link
                          href={`/negocio/${business.slug}`}
                          className="w-14 h-14 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-ink)] absolute -top-7 overflow-hidden transition-transform group-hover:scale-105"
                          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                        >
                          {business.images && business.images.length > 0 ? (
                            <Image src={business.images[0]} alt={business.name} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🏢</div>
                          )}
                        </Link>

                        <div className="mt-9 flex-1">
                          <Link href={`/negocio/${business.slug}`}>
                            <h3
                              className="font-bold text-base leading-tight hover:opacity-80 transition-opacity"
                              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                            >
                              {business.name}
                            </h3>
                          </Link>
                          <p className="text-sm font-medium mt-1" style={{ color: 'var(--lt-terracota)' }}>
                            {business.category}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: 'var(--lt-ink-soft)' }}>
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {business.city || 'Australia'}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t-[1.6px] border-[var(--lt-ink)]/20 flex gap-2">
                          <Link href={`/negocio/${business.slug}`} className="flex-1">
                            <LtButton variant="outline" tone="paper" size="sm" className="w-full" iconLeft={<ExternalLink className="w-3 h-3" />}>
                              Ver
                            </LtButton>
                          </Link>
                          <Link href={`/negocio/editar/${business.slug}`} className="flex-1">
                            <LtButton variant="sticker" tone="terracota" size="sm" className="w-full" iconLeft={<Edit className="w-3 h-3" />}>
                              Editar
                            </LtButton>
                          </Link>
                          <button
                            onClick={() => handleDeleteBusiness(business.id, business.name)}
                            disabled={isDeleting}
                            className="flex items-center justify-center px-3 py-2 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-terracota)] transition-colors hover:bg-[var(--lt-terracota)] hover:text-[var(--lt-paper)] disabled:opacity-50"
                            style={{ color: 'var(--lt-terracota)' }}
                            title="Eliminar Negocio"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </LtPanel>
                  ))}
                </div>
              )}
            </div>
          </LtPanel>
        </div>

        {/* Información */}
        <div className="lg:col-span-1">
          <LtPanel shadow="md" className="p-5">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              Información
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('profile.info.email')}</p>
                  <p className="font-medium text-sm break-all" style={{ color: 'var(--lt-ink)' }}>{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('profile.info.member')}</p>
                  <p className="font-medium text-sm" style={{ color: 'var(--lt-ink)' }}>
                    <DateDisplay date={user.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                  </p>
                </div>
              </div>
              {user.lastLoginAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('profile.info.lastLogin')}</p>
                    <p className="font-medium text-sm" style={{ color: 'var(--lt-ink)' }}>
                      <DateDisplay date={user.lastLoginAt} options={{ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </LtPanel>
        </div>

        {/* Actividad reciente */}
        <div className="lg:col-span-2">
          <LtPanel shadow="md" className="p-5">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              {t('profile.activity.title')}
            </h2>
            <Squiggle width={160} height={8} color="var(--lt-terracota)" amplitude={2} className="mb-4" aria-hidden="true" />

            {recentPosts.length === 0 && recentComments.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
                {t('profile.activity.empty')}
              </p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={`post-${post.id}`}
                    className="border-l-[3px] pl-4 py-2"
                    style={{ borderColor: 'var(--lt-terracota)' }}
                  >
                    <Link
                      href={`/foros/${post.forum.slug}`}
                      className="text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--lt-terracota)' }}
                    >
                      {post.forum.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm" style={{ color: 'var(--lt-ink)' }}>{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                      <DateDisplay date={post.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                        {post.likesCount}
                      </span>
                    </div>
                  </div>
                ))}

                {recentComments.map((comment) => (
                  <div
                    key={`comment-${comment.id}`}
                    className="border-l-[3px] pl-4 py-2"
                    style={{ borderColor: 'var(--lt-accent)' }}
                  >
                    <Link
                      href={`/foros/${comment.post.forum.slug}`}
                      className="text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--lt-accent)' }}
                    >
                      {comment.post.forum.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm" style={{ color: 'var(--lt-ink)' }}>{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                      <DateDisplay date={comment.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                        {comment.likesCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LtPanel>
        </div>
      </div>

      <JobPostingContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        onAccept={handleAcceptTerms}
        isSubmitting={isAcceptingTerms}
      />

      <EventPostingContractModal
        isOpen={showEventContractModal}
        onClose={() => setShowEventContractModal(false)}
        onAccept={handleAcceptEventTerms}
        isSubmitting={isAcceptingEventTerms}
      />
    </LtPageShell>
  )
}
