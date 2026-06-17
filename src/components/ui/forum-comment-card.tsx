'use client';

/**
 * Forum Comment Card Component
 * Displays a single comment with actions
 */

import React from 'react';
import { Heart, Flag } from 'lucide-react';

interface ForumCommentData {
  id: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  likesCount: number;
  createdAt: Date;
  author: {
    id: string;
    nickname: string;
    reputation: number;
  };
}

interface ForumCommentCardProps {
  comment: ForumCommentData;
  t: (key: string) => string;
  onLike?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string) => void;
  currentUserId?: string;
  /** User role — ADMIN/MODERATOR can report any content including their own */
  userRole?: string;
}

const actionBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '4px 8px', borderRadius: 8, border: 0,
  background: 'transparent', cursor: 'pointer', fontFamily: 'var(--lh-font)',
  color: 'var(--lh-fg3)', fontSize: 12, transition: 'color .18s',
};

export function ForumCommentCard({
  comment,
  t,
  onLike,
  onReport,
  currentUserId,
  userRole,
}: ForumCommentCardProps) {
  const [isLiking, setIsLiking] = React.useState(false);

  const handleLike = async () => {
    if (!currentUserId || !onLike || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(comment.id);
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const canReport = currentUserId && (currentUserId !== comment.author.id || userRole === 'ADMIN' || userRole === 'MODERATOR');

  if (comment.isDeleted) {
    return (
      <div style={{ marginLeft: 48, padding: 12, borderRadius: 10, background: 'var(--lh-surface2)' }}>
        <p style={{ color: 'var(--lh-fg3)', fontStyle: 'italic', fontSize: 14, margin: 0 }}>{t('postDeleted')}</p>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: 48, borderLeft: '2px solid var(--lh-border)', paddingLeft: 16, paddingTop: 8, paddingBottom: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span aria-hidden="true" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-accent) 14%, transparent)', color: 'var(--lh-accent)', fontWeight: 600, fontSize: 13 }}>
          {comment.author.nickname.charAt(0).toUpperCase()}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--lh-fg)' }}>{comment.author.nickname}</span>
          <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
          {comment.isEdited && (
            <span style={{ fontSize: 12, color: 'var(--lh-fg3)', fontStyle: 'italic' }}>({t('postEdited')})</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 8 }}>
        {comment.isFlagged && (
          <div style={{ marginBottom: 8, padding: '6px 8px', borderRadius: 8, fontSize: 12, background: 'color-mix(in oklch, var(--lh-terra) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--lh-terra) 25%, transparent)', color: 'var(--lh-terra)' }}>
            ⚠️ {t('postFlagged')}
          </div>
        )}
        <p style={{ fontSize: 14, color: 'var(--lh-fg)', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
          {comment.content}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={handleLike} disabled={!currentUserId || isLiking} style={{ ...actionBtn, opacity: !currentUserId ? 0.5 : 1 }}>
          <Heart size={14} style={{ color: isLiking ? 'var(--lh-terra)' : 'var(--lh-fg3)' }} aria-hidden="true" />
          {comment.likesCount}
        </button>

        {canReport && (
          <button onClick={() => onReport?.(comment.id)} style={actionBtn}>
            <Flag size={14} style={{ color: 'var(--lh-fg3)' }} aria-hidden="true" />
            {t('postReport')}
          </button>
        )}
      </div>
    </div>
  );
}
