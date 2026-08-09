'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/components/providers/language-provider'
import { BUSINESS_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
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
  Trash2,
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
import { Button } from '@/components/lh/Button'
import { EmptyState } from '@/components/lh/EmptyState'

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
  forum: { name: string; slug: string }
}

interface RecentComment {
  id: string
  content: string
  createdAt: Date
  likesCount: number
  post: { id: string; forum: { name: string; slug: string } }
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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

const statCards = [
  { key: 'posts', icon: MessageSquare, color: 'var(--lh-terra)', valueKey: 'postsCount' as const },
  { key: 'comments', icon: MessageSquare, color: 'var(--lh-accent)', valueKey: 'commentsCount' as const },
  { key: 'likes', icon: ThumbsUp, color: 'var(--lh-green)', valueKey: 'totalLikes' as const },
  { key: 'reputation', icon: Award, color: 'var(--lh-warm)', valueKey: 'reputation' as const },
]

/* Header de sección de panel */
function PanelHeader({ icon, color, title, action }: { icon: React.ReactNode; color: string; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid var(--lh-border)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: 0 }}>
        <span style={{ color }}>{icon}</span>
        {title}
      </h2>
      {action}
    </div>
  )
}

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
      const res = await fetch(`/api/businesses/${businessId}`, { method: 'DELETE' })
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
    if (hasAcceptedJobPostingTerms) router.push('/empleos/publicar')
    else setShowContractModal(true)
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
    if (hasAcceptedEventPostingTerms) router.push('/perfil/eventos/crear')
    else setShowEventContractModal(true)
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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* Header */}
        <div className="lh-card" style={{ overflow: 'hidden', marginBottom: 28, padding: 0 }}>
          <div style={{ position: 'relative', height: 100, background: 'linear-gradient(160deg,var(--lh-accent),var(--lh-accent-ink))' }} />
          <div style={{ position: 'relative', padding: '0 24px 24px' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4" style={{ marginTop: -52 }}>
              <div style={{ width: 104, height: 104, borderRadius: '50%', border: '4px solid var(--lh-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, background: 'var(--lh-surface2)', boxShadow: 'var(--lh-shadow)' }}>
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || user.email} width={104} height={104} decoding="async" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={52} style={{ color: 'var(--lh-fg3)' }} aria-hidden="true" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className="truncate" style={{ fontFamily: 'var(--lh-font)', fontSize: 'clamp(24px,4vw,30px)', fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
                  {user.name || user.email}
                </h1>
                {user.nickname && <p style={{ fontSize: 15, color: 'var(--lh-fg2)', margin: '2px 0 0' }}>@{user.nickname}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 99, background: tint('var(--lh-accent)'), color: 'var(--lh-accent)', fontSize: 12.5, fontWeight: 600 }}>
                    {roleNames[user.role] || user.role}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: 'var(--lh-fg)' }}>
                    <Award size={16} style={{ color: 'var(--lh-warm)' }} aria-hidden="true" />
                    {user.reputation} pts
                  </span>
                </div>
              </div>

              <Button href="/perfil/editar" variant="secondary" size="sm">
                <Settings size={15} /> Editar perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 28 }}>
          {statCards.map(({ key, icon: Icon, color, valueKey }) => (
            <div key={key} className="lh-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint(color), color }}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <p style={{ fontFamily: 'var(--lh-font)', fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>{statValues[valueKey]}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--lh-fg3)', margin: 0 }}>{t(`profile.stats.${key}`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="md" onClick={handlePublishEventClick}>
            <CalendarDays size={18} /> Publicar evento
          </Button>
          <Button variant="primary" size="md" onClick={handlePublishJobClick}>
            <PlusCircle size={18} /> Publicar oferta de empleo
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Mis Eventos */}
          <div className="lh-card" style={{ padding: 0 }}>
            <PanelHeader
              icon={<CalendarDays size={20} />}
              color="var(--lh-warm)"
              title="Mis eventos"
              action={<Button variant="secondary" size="sm" onClick={handlePublishEventClick}><PlusCircle size={15} /> Nuevo evento</Button>}
            />
            <div style={{ padding: 20 }}>
              <UserEvents initialEvents={userEvents} onCreateClick={handlePublishEventClick} />
            </div>
          </div>

          {/* Mis Ofertas */}
          <div className="lh-card" style={{ padding: 0 }}>
            <PanelHeader icon={<Briefcase size={20} />} color="var(--lh-green)" title="Mis ofertas de empleo" />
            <div style={{ padding: 20 }}>
              <UserJobOffers initialJobs={userJobs} onCreateClick={handlePublishJobClick} />
            </div>
          </div>

          {/* Mis Negocios */}
          <div className="lh-card" style={{ padding: 0 }}>
            <PanelHeader
              icon={<Building2 size={20} />}
              color="var(--lh-accent)"
              title="Mis negocios"
              action={<Button href="/registrar-negocio" variant="secondary" size="sm"><PlusCircle size={15} /> Nuevo negocio</Button>}
            />
            <div style={{ padding: 20 }}>
              {user.businesses.length === 0 ? (
                <EmptyState
                  icon={<Building2 size={26} />}
                  title="Aún no tienes negocios"
                  description="¡Es hora de conquistar el mercado! Registra tu emprendimiento y llega a miles de latinos en Australia."
                  action={<Button href="/registrar-negocio" variant="primary" size="md">Comenzar ahora</Button>}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {user.businesses.map((business) => (
                    <div key={business.id} className="lh-card" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
                      <Link href={`/negocio/${business.slug}`} style={{ display: 'block', height: 64, position: 'relative', background: tint('var(--lh-accent)') }}>
                        {business.isVerified && (
                          <span style={{ position: 'absolute', top: 8, right: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 99, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', fontSize: 11, fontWeight: 600, color: 'var(--lh-green)' }}>
                            <CheckCircle2 size={11} aria-hidden="true" /> Verificado
                          </span>
                        )}
                      </Link>

                      <div style={{ padding: '0 16px 16px', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Link href={`/negocio/${business.slug}`} style={{ width: 56, height: 56, borderRadius: 14, border: '3px solid var(--lh-surface)', position: 'absolute', top: -28, overflow: 'hidden', background: 'var(--lh-surface2)', display: 'block' }}>
                          {business.images && business.images.length > 0 ? (
                            <Image src={business.images[0]} alt={business.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                          )}
                        </Link>

                        <div style={{ marginTop: 36, flex: 1 }}>
                          <Link href={`/negocio/${business.slug}`}>
                            <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: 'var(--lh-fg)', margin: 0 }}>{business.name}</h3>
                          </Link>
                          <p style={{ fontSize: 13.5, fontWeight: 500, marginTop: 4, color: 'var(--lh-accent)' }}>
                            {categoryLabel(BUSINESS_CATEGORIES, business.category)}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, marginTop: 8, color: 'var(--lh-fg3)' }}>
                            <MapPin size={13} aria-hidden="true" />
                            {business.city || 'Australia'}
                          </div>
                        </div>

                        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--lh-border2)', display: 'flex', gap: 8 }}>
                          <Link href={`/negocio/${business.slug}`} className="lh-btn lh-btn--sm lh-btn--secondary" style={{ flex: 1 }}>
                            <ExternalLink size={13} /> Ver
                          </Link>
                          <Link href={`/negocio/editar/${business.slug}`} className="lh-btn lh-btn--sm lh-btn--primary" style={{ flex: 1 }}>
                            <Edit size={13} /> Editar
                          </Link>
                          <button
                            onClick={() => handleDeleteBusiness(business.id, business.name)}
                            disabled={isDeleting}
                            className="lh-btn lh-btn--sm lh-btn--secondary"
                            style={{ color: 'var(--lh-terra)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, transparent)', paddingLeft: 12, paddingRight: 12 }}
                            title="Eliminar negocio"
                            aria-label={`Eliminar ${business.name}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info + Actividad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información */}
            <div className="lh-card" style={{ padding: 20 }}>
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 16px' }}>Información</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <Mail size={18} style={{ marginTop: 2, flexShrink: 0, color: 'var(--lh-accent)' }} aria-hidden="true" />
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--lh-fg3)', margin: 0 }}>{t('profile.info.email')}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)', margin: 0, wordBreak: 'break-all' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <Calendar size={18} style={{ marginTop: 2, flexShrink: 0, color: 'var(--lh-accent)' }} aria-hidden="true" />
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--lh-fg3)', margin: 0 }}>{t('profile.info.member')}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)', margin: 0 }}>
                      <DateDisplay date={user.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                    </p>
                  </div>
                </div>
                {user.lastLoginAt && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                    <Calendar size={18} style={{ marginTop: 2, flexShrink: 0, color: 'var(--lh-accent)' }} aria-hidden="true" />
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--lh-fg3)', margin: 0 }}>{t('profile.info.lastLogin')}</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)', margin: 0 }}>
                        <DateDisplay date={user.lastLoginAt} options={{ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="lh-card lg:col-span-2" style={{ padding: 20 }}>
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 16px' }}>
                {t('profile.activity.title')}
              </h2>

              {recentPosts.length === 0 && recentComments.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 14, color: 'var(--lh-fg3)' }}>
                  {t('profile.activity.empty')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recentPosts.map((post) => (
                    <div key={`post-${post.id}`} style={{ borderLeft: '3px solid var(--lh-terra)', paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                      <Link href={`/foros/${post.forum.slug}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-terra)' }}>{post.forum.name}</Link>
                      <p className="line-clamp-2" style={{ marginTop: 4, fontSize: 14, color: 'var(--lh-fg)' }}>{post.content}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 12, color: 'var(--lh-fg3)' }}>
                        <DateDisplay date={post.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={12} aria-hidden="true" /> {post.likesCount}</span>
                      </div>
                    </div>
                  ))}

                  {recentComments.map((comment) => (
                    <div key={`comment-${comment.id}`} style={{ borderLeft: '3px solid var(--lh-accent)', paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                      <Link href={`/foros/${comment.post.forum.slug}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-accent)' }}>{comment.post.forum.name}</Link>
                      <p className="line-clamp-2" style={{ marginTop: 4, fontSize: 14, color: 'var(--lh-fg)' }}>{comment.content}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 12, color: 'var(--lh-fg3)' }}>
                        <DateDisplay date={comment.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={12} aria-hidden="true" /> {comment.likesCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
    </div>
  )
}
