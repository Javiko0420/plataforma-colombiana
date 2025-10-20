/**
 * Daily Forums Page
 * Main page for the daily forum system
 */

import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveForums } from '@/lib/forum';
import { getServerLocale } from '@/lib/i18n-server';
import { translate } from '@/lib/i18n';
import { MessageSquare, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { RetryButton } from '@/components/ui/retry-button';
import { DateDisplay } from '@/components/ui/date-display';

// Force dynamic rendering for forums
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ForumsList() {
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });

  try {
    const forums = await getActiveForums();

    if (forums.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t('forums.empty.posts')}
          </h3>
          <p className="text-foreground/70">
            {t('forums.subtitle')}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {forums.map((forum) => (
          <div
            key={forum.id}
            className="border border-border rounded-xl p-6 bg-background hover:bg-background/80 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {forum.topic === 'DAILY_1'
                    ? t('forums.daily1')
                    : t('forums.daily2')}
                </h3>
                <p className="text-foreground/70 text-sm">
                  {forum.description}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Calendar className="w-4 h-4" />
                <span>
                  {t('forums.activeUntil')}:{' '}
                  <DateDisplay 
                    date={forum.endDate} 
                    locale={locale}
                    options={{
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Australia/Sydney',
                    }}
                  />
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Users className="w-4 h-4" />
                <span>
                  {forum.postsCount} {t('forums.postsCount')}
                </span>
              </div>
            </div>

            <Link
              href={`/foros/${forum.slug}`}
              className="block w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground text-center font-semibold hover:bg-primary/90 transition-colors"
            >
              {t('forums.enter')}
            </Link>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading forums:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{t('forums.error')}</p>
        <RetryButton className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('forums.title')}
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            {t('forums.subtitle')}
          </p>
        </div>

        {/* Auth Notice */}
        {!session && (
          <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-center text-foreground/80">
              {t('forums.auth.required')}{' '}
              <Link
                href="/api/auth/signin"
                className="font-semibold text-primary hover:underline"
              >
                {t('forums.auth.login')}
              </Link>
            </p>
          </div>
        )}

        {/* Forums List */}
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-foreground/70">{t('forums.loading')}</p>
            </div>
          }
        >
          <ForumsList />
        </Suspense>

        {/* Info Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-lg bg-background border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Conversaciones Diarias
            </h3>
            <p className="text-sm text-foreground/70">
              Los foros se renuevan cada día para mantener las conversaciones frescas y relevantes.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-background border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Comunidad Moderada
            </h3>
            <p className="text-sm text-foreground/70">
              Sistema de moderación automática y reportes comunitarios para mantener un ambiente respetuoso.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-background border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sistema de Reputación
            </h3>
            <p className="text-sm text-foreground/70">
              Gana reputación participando activamente y recibiendo likes en tus publicaciones.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Foros Diarios - Plataforma Colombiana',
  description:
    'Participa en conversaciones diarias sobre emprendimiento, negocios y oportunidades en Colombia.',
};

