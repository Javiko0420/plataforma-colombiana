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
import { Users } from 'lucide-react';

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

const neutralChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)',
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)',
  padding: '6px 11px', borderRadius: 99,
};

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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 900, paddingTop: 40 }}>

        {/* ── Breadcrumb ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 24 }} aria-label="Miga de pan">
          <Link href="/foros" style={{ fontWeight: 500, color: 'var(--lh-fg2)' }}>
            {t('forums.title')}
          </Link>
          <span style={{ color: 'var(--lh-fg3)' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--lh-fg)' }}>{forum.name}</span>
        </nav>

        {/* ── Header del foro ── */}
        <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)', marginBottom: 28 }}>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,3.6vw,36px)', margin: '0 0 10px' }}>
            {forum.name}
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: '0 0 16px' }}>
            {forum.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={neutralChip}>{t('forums.activeUntil')}: {expiresAt}</span>
            <span style={{ ...neutralChip, color: 'var(--lh-accent)', background: tint('var(--lh-accent)'), border: 'none' }}>
              <Users size={12} aria-hidden="true" />
              {forum._count.posts} {t('forums.postsCount')}
            </span>
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
