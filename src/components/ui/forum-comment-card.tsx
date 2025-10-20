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
}

export function ForumCommentCard({
  comment,
  t,
  onLike,
  onReport,
  currentUserId,
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

  if (comment.isDeleted) {
    return (
      <div className="ml-12 p-3 bg-background/30 rounded-lg">
        <p className="text-foreground/50 italic text-sm">{t('forums.post.deleted')}</p>
      </div>
    );
  }

  return (
    <div className="ml-12 border-l-2 border-primary/20 pl-4 py-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {comment.author.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">
                {comment.author.nickname}
              </span>
              <span className="text-xs text-foreground/50">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-foreground/50 italic">
                  ({t('forums.post.edited')})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-2">
        {comment.isFlagged && (
          <div className="mb-2 p-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-600 dark:text-red-400">
            ⚠️ {t('forums.post.flagged')}
          </div>
        )}
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={!currentUserId || isLiking}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiking ? 'text-primary' : 'text-foreground/50 group-hover:text-primary'
            }`}
          />
          <span className="text-xs text-foreground/70">
            {comment.likesCount}
          </span>
        </button>

        {currentUserId && currentUserId !== comment.author.id && (
          <button
            onClick={() => onReport?.(comment.id)}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-red-500/10 transition-colors group"
          >
            <Flag className="w-4 h-4 text-foreground/50 group-hover:text-red-500" />
            <span className="text-xs text-foreground/70 group-hover:text-red-500">
              {t('forums.post.report')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

