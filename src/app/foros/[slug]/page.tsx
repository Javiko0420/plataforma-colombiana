/**
 * Individual Forum Page
 * Displays posts and comments for a specific forum
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerLocale } from '@/lib/i18n-server';
import { translate } from '@/lib/i18n';
import ForumClient from './forum-client';

interface ForumPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getForumBySlug(slug: string) {
  const forum = await prisma.forum.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return forum;
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });
  const session = await getServerSession(authOptions);

  const forum = await getForumBySlug(slug);

  if (!forum) {
    notFound();
  }

  // Get user profile if logged in
  let userProfile = null;
  if (session?.user?.id) {
    userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nickname: true,
        reputation: true,
        isBanned: true,
      },
    });
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Forum Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
            <a
              href="/foros"
              className="hover:text-primary transition-colors"
            >
              {t('forums.title')}
            </a>
            <span>/</span>
            <span>{forum.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {forum.name}
          </h1>
          <p className="text-foreground/70">{forum.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-foreground/60">
            <span>
              {t('forums.activeUntil')}:{' '}
              {new Date(forum.endDate).toLocaleString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Australia/Sydney',
              })}
            </span>
            <span>•</span>
            <span>
              {forum._count.posts} {t('forums.postsCount')}
            </span>
          </div>
        </div>

        {/* Client Component for Interactive Parts */}
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
    </main>
  );
}

