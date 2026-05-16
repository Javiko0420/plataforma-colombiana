'use client';

/**
 * Forum Post Card Component
 * Displays a single forum post with actions (like, reply, report)
 */

import React, { useState } from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import { PostWithAuthor } from '@/lib/forum';

interface ForumPostCardProps {
  post: PostWithAuthor;
  t: (key: string) => string;
  onLike?: (postId: string) => Promise<void>;
  onReport?: (postId: string) => void;
  onReply?: (postId: string) => void;
  currentUserId?: string;
  /** User role — ADMIN/MODERATOR can report any content including their own */
  userRole?: string;
}

export function ForumPostCard({
  post,
  t,
  onLike,
  onReport,
  onReply,
  currentUserId,
  userRole,
}: ForumPostCardProps) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId || !onLike || isLiking) return;

    setIsLiking(true);
    try {
      await onLike(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReportClick = () => {
    onReport?.(post.id);
  };

  if (post.isDeleted) {
    return (
      <div
        className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-4 opacity-60"
        style={{ background: 'var(--lt-paper)' }}
      >
        <p className="text-sm italic" style={{ color: 'var(--lt-ink-soft)' }}>{t('postDeleted')}</p>
      </div>
    );
  }

  return (
      <div
        className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] p-4 transition-all hover:-translate-y-0.5"
        style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-[1.6px] border-[var(--lt-ink)] flex items-center justify-center shrink-0"
              style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
              aria-hidden="true"
            >
              <span className="text-base font-bold">
                {(post.author.nickname || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {post.author.nickname || 'Anónimo'}
                </span>
                <span className="text-xs text-foreground/50">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
                {post.isEdited && (
                  <span className="text-xs text-foreground/50 italic">
                    ({t('postEdited')})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <span>{t('profileReputation')}: {post.author.reputation}</span>
              </div>
            </div>
          </div>

          {/* Header report shortcut (icon-only, discreto) */}
          {currentUserId && (currentUserId !== post.author.id || userRole === 'ADMIN' || userRole === 'MODERATOR') && (
            <button
              onClick={handleReportClick}
              className="text-foreground/40 hover:text-red-500 transition-colors p-1 rounded"
              aria-label={t('postReport')}
              title={t('postReport')}
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          {post.isFlagged && (
            <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
              ⚠️ {t('postFlagged')}
              {post.flagReason && `: ${post.flagReason}`}
            </div>
          )}
          <p className="text-foreground whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t-[1.6px] border-[var(--lt-ink)]/20">
          <button
            onClick={handleLike}
            disabled={!currentUserId || isLiking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--lt-radius-sm)] border border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-[var(--lt-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] group"
            style={{ fontFamily: 'var(--lt-font-sans)' }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isLiking ? '' : ''}`}
              style={{ color: isLiking ? 'var(--lt-terracota)' : 'var(--lt-ink-soft)' }}
              aria-hidden="true"
            />
            <span className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
              {post.likesCount} {t('postLikes')}
            </span>
          </button>

          <button
            onClick={() => onReply?.(post.id)}
            disabled={!currentUserId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--lt-radius-sm)] border border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-[var(--lt-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] group"
            style={{ fontFamily: 'var(--lt-font-sans)' }}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" style={{ color: 'var(--lt-ink-soft)' }} />
            <span className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
              {post.commentsCount} {t('postReplies')}
            </span>
          </button>

          {currentUserId && (currentUserId !== post.author.id || userRole === 'ADMIN' || userRole === 'MODERATOR') && (
            <button
              onClick={handleReportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--lt-radius-sm)] border border-transparent transition-all hover:border-[var(--lt-terracota)] ml-auto focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] group"
              style={{ fontFamily: 'var(--lt-font-sans)' }}
            >
              <Flag className="w-4 h-4" aria-hidden="true" style={{ color: 'var(--lt-ink-soft)' }} />
              <span className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                {t('postReport')}
              </span>
            </button>
          )}
        </div>
      </div>
  );
}

