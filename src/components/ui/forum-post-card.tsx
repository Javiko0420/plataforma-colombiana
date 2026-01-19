'use client';

/**
 * Forum Post Card Component
 * Displays a single forum post with actions (like, reply, report)
 */

import React from 'react';
import { Heart, MessageCircle, Flag, MoreVertical } from 'lucide-react';
import { PostWithAuthor } from '@/lib/forum';
import { useRouter } from 'next/navigation';

interface ForumPostCardProps {
  post: PostWithAuthor;
  t: (key: string) => string;
  onLike?: (postId: string) => Promise<void>;
  onReport?: (postId: string) => void;
  onReply?: (postId: string) => void;
  currentUserId?: string;
}

export function ForumPostCard({
  post,
  t,
  onLike,
  onReport,
  onReply,
  currentUserId,
}: ForumPostCardProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = React.useState(false);

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

  if (post.isDeleted) {
    return (
      <div className="border border-border rounded-lg p-4 bg-background/50">
        <p className="text-foreground/50 italic">{t('postDeleted')}</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-background hover:bg-background/80 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {post.author.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {post.author.nickname}
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

        {currentUserId && currentUserId !== post.author.id && (
          <button
            onClick={() => onReport?.(post.id)}
            className="p-1 hover:bg-background/50 rounded transition-colors"
            aria-label={t('postReport')}
          >
            <MoreVertical className="w-5 h-5 text-foreground/50" />
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
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          disabled={!currentUserId || isLiking}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isLiking ? 'text-primary' : 'text-foreground/50 group-hover:text-primary'
            }`}
          />
          <span className="text-sm text-foreground/70 group-hover:text-foreground">
            {post.likesCount} {t('postLikes')}
          </span>
        </button>

        <button
          onClick={() => onReply?.(post.id)}
          disabled={!currentUserId}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <MessageCircle className="w-5 h-5 text-foreground/50 group-hover:text-primary" />
          <span className="text-sm text-foreground/70 group-hover:text-foreground">
            {post.commentsCount} {t('postReplies')}
          </span>
        </button>

        {currentUserId && currentUserId !== post.author.id && (
          <button
            onClick={() => onReport?.(post.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors group ml-auto"
          >
            <Flag className="w-5 h-5 text-foreground/50 group-hover:text-red-500" />
            <span className="text-sm text-foreground/70 group-hover:text-red-500">
              {t('postReport')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

