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

const actionBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 11px', borderRadius: 9, border: '1px solid transparent',
  background: 'transparent', cursor: 'pointer', fontFamily: 'var(--lh-font)',
  color: 'var(--lh-fg2)', fontSize: 12.5, transition: 'background .18s, color .18s',
};

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

  const canReport = currentUserId && (currentUserId !== post.author.id || userRole === 'ADMIN' || userRole === 'MODERATOR');

  if (post.isDeleted) {
    return (
      <div className="lh-card" style={{ padding: 16, opacity: 0.6 }}>
        <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--lh-fg3)', margin: 0 }}>{t('postDeleted')}</p>
      </div>
    );
  }

  return (
    <div className="lh-card" style={{ padding: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden="true"
            style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff', fontWeight: 700, fontSize: 16 }}
          >
            {(post.author.nickname || 'A').charAt(0).toUpperCase()}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--lh-fg)' }}>
                {post.author.nickname || 'Anónimo'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>
                {new Date(post.createdAt).toLocaleString()}
              </span>
              {post.isEdited && (
                <span style={{ fontSize: 12, color: 'var(--lh-fg3)', fontStyle: 'italic' }}>({t('postEdited')})</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>
              {t('profileReputation')}: {post.author.reputation}
            </div>
          </div>
        </div>

        {canReport && (
          <button
            onClick={handleReportClick}
            style={{ color: 'var(--lh-fg3)', background: 'transparent', border: 0, cursor: 'pointer', padding: 4, borderRadius: 8, display: 'inline-flex' }}
            aria-label={t('postReport')}
            title={t('postReport')}
          >
            <Flag size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ marginBottom: 14 }}>
        {post.isFlagged && (
          <div style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 10, fontSize: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--lh-terra) 25%, transparent)', color: 'var(--lh-terra)' }}>
            ⚠️ {t('postFlagged')}{post.flagReason && `: ${post.flagReason}`}
          </div>
        )}
        <p style={{ color: 'var(--lh-fg)', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
          {post.content}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 12, borderTop: '1px solid var(--lh-border2)' }}>
        <button onClick={handleLike} disabled={!currentUserId || isLiking} style={{ ...actionBtn, opacity: !currentUserId ? 0.5 : 1 }}>
          <Heart size={15} style={{ color: isLiking ? 'var(--lh-terra)' : 'var(--lh-fg3)' }} aria-hidden="true" />
          {post.likesCount} {t('postLikes')}
        </button>

        <button onClick={() => onReply?.(post.id)} disabled={!currentUserId} style={{ ...actionBtn, opacity: !currentUserId ? 0.5 : 1 }}>
          <MessageCircle size={15} style={{ color: 'var(--lh-fg3)' }} aria-hidden="true" />
          {post.commentsCount} {t('postReplies')}
        </button>

        {canReport && (
          <button onClick={handleReportClick} style={{ ...actionBtn, marginLeft: 'auto' }}>
            <Flag size={15} style={{ color: 'var(--lh-fg3)' }} aria-hidden="true" />
            {t('postReport')}
          </button>
        )}
      </div>
    </div>
  );
}
