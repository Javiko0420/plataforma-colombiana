/**
 * Daily Forums Hub
 * "What is being talked about now" — live rooms + trending across forums.
 */

import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getForumsHubData } from '@/lib/forum';
import { getServerLocale } from '@/lib/i18n-server';
import { translate, type SupportedLocale } from '@/lib/i18n';
import { MessageSquare, Calendar, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RetryButton } from '@/components/ui/retry-button';
import { PageHeader } from '@/components/lh/PageHeader';
import { EmptyState } from '@/components/lh/EmptyState';
import { ForumRoomCard } from '@/components/foros/forum-room-card';
import { ForumsTrending } from '@/components/foros/forums-trending';
import { ForumGuidelinesNotice } from '@/components/foros/forum-guidelines-notice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

/* Info-cards: contexto para visitantes nuevos. Solo se muestran sin sesión,
   donde aportan; para usuarios recurrentes ocupaban demasiado espacio. */
const INFO_CARDS = [
  {
    icon: MessageSquare,
    title: 'Conversaciones diarias',
    desc: 'Los foros se renuevan cada día para mantener las conversaciones frescas y relevantes.',
    color: 'var(--lh-accent)',
  },
  {
    icon: Users,
    title: 'Comunidad moderada',
    desc: 'Sistema de moderación automática y reportes comunitarios para mantener un ambiente respetuoso.',
    color: 'var(--lh-green)',
  },
  {
    icon: Calendar,
    title: 'Sistema de reputación',
    desc: 'Gana reputación participando activamente y recibiendo likes en tus publicaciones.',
    color: 'var(--lh-warm)',
  },
];

/* Carga de datos del hub: vive en un Server Component suspendido. */
async function ForumsHub({ locale }: { locale: SupportedLocale }) {
  const t = (k: string) => translate(k, { locale });

  try {
    const { rooms, trending } = await getForumsHubData();

    if (rooms.length === 0) {
      return (
        <EmptyState
          icon={<MessageSquare size={26} />}
          title={t('forums.empty.posts')}
          description={t('forums.subtitle')}
        />
      );
    }

    return (
      <>
        {/* Salas vivas (una por foro activo) */}
        <div className="grid gap-5 md:grid-cols-2">
          {rooms.map((room) => (
            <ForumRoomCard key={room.id} room={room} locale={locale} />
          ))}
        </div>

        {/* Lo más comentado ahora (mezcla todos los foros) */}
        <ForumsTrending trending={trending} locale={locale} />

        {/* Enlace a foros anteriores (vista de archivo, pendiente) */}
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <Link href="/foros/archivo" className="lh-seemore" style={{ justifyContent: 'center' }}>
            {t('forums.archive.link')} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading forums hub:', error);
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ marginBottom: 16, fontWeight: 500, color: 'var(--lh-terra)' }}>{t('forums.error')}</p>
        <RetryButton className="lh-btn lh-btn--md lh-btn--primary">
          {t('forums.retry')}
        </RetryButton>
      </div>
    );
  }
}

export default async function ForumsPage() {
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });
  const session = await getServerSession(authOptions);

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Foros & comunidad"
        title={t('forums.title')}
        subtitle={t('forums.subtitle')}
        accent="var(--lh-accent)"
      />

      <main className="lh-container" style={{ maxWidth: 1100, paddingTop: 40, paddingBottom: 64 }}>

        {/* Auth notice (solo sin sesión) */}
        {!session && (
          <div style={{ marginBottom: 28, padding: '14px 18px', borderRadius: 14, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: 0 }}>
              {t('forums.auth.required')}{' '}
              <Link href="/api/auth/signin" style={{ fontWeight: 600, color: 'var(--lh-accent)', textDecoration: 'underline' }}>
                {t('forums.auth.login')}
              </Link>
            </p>
          </div>
        )}

        {/* Aviso de normas de comunidad (dismissable, una sola vez) */}
        <ForumGuidelinesNotice
          title={t('forums.guidelines.title')}
          body={t('forums.guidelines.body')}
          linkLabel={t('forums.guidelines.link')}
          dismissLabel={t('forums.guidelines.dismiss')}
        />

        {/* Hub: salas + trending */}
        <Suspense
          fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <span className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--lh-border)', borderTopColor: 'var(--lh-accent)', marginBottom: 16 }} aria-hidden="true" />
              <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('forums.loading')}</p>
            </div>
          }
        >
          <ForumsHub locale={locale} />
        </Suspense>

        {/* Info cards: contexto para visitantes (solo sin sesión) */}
        {!session && (
          <div style={{ marginTop: 56 }}>
            <div className="grid gap-5 md:grid-cols-3">
              {INFO_CARDS.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="lh-card" style={{ padding: 24 }}>
                  <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint(color), color, marginBottom: 16 }}>
                    <Icon size={22} />
                  </span>
                  <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 8px' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Foros Diarios | Latin Territory',
  description: 'Participa en conversaciones diarias sobre emprendimiento, negocios y oportunidades en nuestra comunidad latina.',
};
