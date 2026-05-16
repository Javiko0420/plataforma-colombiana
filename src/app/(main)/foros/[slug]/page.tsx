/**
 * Individual Forum Page
 * Displays posts and comments for a specific forum
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerLocale } from '@/lib/i18n-server';
import { translate } from '@/lib/i18n';
import ForumClient from './forum-client';
import { LtBadge } from '@/components/lt/Badge';
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline';
import { Users } from 'lucide-react';

interface ForumPageProps {
  params: Promise<{ slug: string }>;
}

async function getForumBySlug(slug: string) {
  return prisma.forum.findUnique({
    where: { slug },
    include: { _count: { select: { posts: true } } },
  });
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });
  const session = await getServerSession(authOptions);

  const forum = await getForumBySlug(slug);

  if (!forum) notFound();

  let userProfile = null;
  if (session?.user?.id) {
    userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, nickname: true, reputation: true, isBanned: true, role: true },
    });
  }

  const expiresAt = new Date(forum.endDate).toLocaleString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Australia/Brisbane',
  });

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Miga de pan">
          <Link
            href="/foros"
            className="font-medium transition-colors hover:text-[var(--lt-terracota)] focus:outline-none focus:underline"
            style={{ color: 'var(--lt-ink-soft)' }}
          >
            {t('forums.title')}
          </Link>
          <span style={{ color: 'var(--lt-ink-soft)' }}>/</span>
          <span className="font-semibold" style={{ color: 'var(--lt-ink)' }}>{forum.name}</span>
        </nav>

        {/* ── Header del foro ── */}
        <div
          className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 md:p-8 mb-8"
          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
        >
          <h1
            className="text-3xl md:text-4xl font-black mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {forum.name}
          </h1>
          <HandDrawnUnderline width={160} color="var(--lt-sun-core)" thickness={2.5} className="mb-4" aria-hidden="true" />
          <p
            className="text-sm mb-4"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            {forum.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <LtBadge tone="neutral" rotate={-1}>
              {t('forums.activeUntil')}: {expiresAt}
            </LtBadge>
            <LtBadge tone="sun" rotate={1}>
              <Users className="w-3 h-3" aria-hidden="true" />
              {forum._count.posts} {t('forums.postsCount')}
            </LtBadge>
          </div>
        </div>

        {/* ── Parte interactiva (lógica intacta) ── */}
        <ForumClient
          forumId={forum.id}
          currentUser={userProfile}
          locale={locale}
          translations={{
            authRequired: t('forums.auth.required'),
            authLogin: t('forums.auth.login'),
            nicknameRequired: t('forums.nickname.required'),
            setNickname: t('forums.profile.setNickname'),
            postNew: t('forums.post.new'),
            loading: t('forums.loading'),
            error: t('forums.error'),
            retry: t('forums.retry'),
            emptyPosts: t('forums.empty.posts'),
            postWrite: t('forums.post.write'),
            postSubmit: t('forums.post.submit'),
            postCancel: t('forums.post.cancel'),
            postLike: t('forums.post.like'),
            postReply: t('forums.post.reply'),
            postReport: t('forums.post.report'),
            postReplies: t('forums.post.replies'),
            postLikes: t('forums.post.likes'),
            postEdited: t('forums.post.edited'),
            postFlagged: t('forums.post.flagged'),
            postDeleted: t('forums.post.deleted'),
            postMaxChars: t('forums.post.maxChars'),
            commentWrite: t('forums.comment.write'),
            commentSubmit: t('forums.comment.submit'),
            emptyComments: t('forums.empty.comments'),
            reportTitle: t('forums.report.title'),
            reportReason: t('forums.report.reason'),
            reportDetails: t('forums.report.details'),
            reportSubmit: t('forums.report.submit'),
            reportSpam: t('forums.report.spam'),
            reportHarassment: t('forums.report.harassment'),
            reportHateSpeech: t('forums.report.hateSpeech'),
            reportInappropriate: t('forums.report.inappropriate'),
            reportMisinformation: t('forums.report.misinformation'),
            reportOther: t('forums.report.other'),
            reportSuccess: t('forums.report.success'),
            reportAlreadyReported: t('forums.report.alreadyReported'),
            profileNickname: t('forums.profile.nickname'),
            profileReputation: t('forums.profile.reputation'),
            profilePosts: t('forums.profile.posts'),
            profileComments: t('forums.profile.comments'),
            profileBanned: t('forums.profile.banned'),
            nicknameRules: t('forums.nickname.rules'),
            nicknameTaken: t('forums.nickname.taken'),
            nicknameSave: t('forums.nickname.save'),
          }}
        />
      </div>
    </div>
  );
}
