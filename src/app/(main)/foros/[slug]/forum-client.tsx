'use client';

/**
 * Forum Client Component
 * Handles all interactive forum features (posts, comments, likes, reports)
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ForumPostCard } from '@/components/ui/forum-post-card';
import { ForumCommentCard } from '@/components/ui/forum-comment-card';
import { ForumPostForm } from '@/components/ui/forum-post-form';
import { ForumReportModal } from '@/components/ui/forum-report-modal';
import { PostWithAuthor } from '@/lib/forum';
import { ReportReason } from '@prisma/client';
import { MessageSquare, AlertCircle, Plus, Archive } from 'lucide-react';

interface UserProfile {
  id: string;
  nickname: string | null;
  reputation: number;
  isBanned: boolean;
  role?: string;
}

interface CommentData {
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

interface ForumClientProps {
  forumId: string;
  currentUser: UserProfile | null;
  locale: string;
  translations: Record<string, string>;
  /** Archived/closed forum: read-only (no new posts/comments/likes/reports). */
  readOnly?: boolean;
}

export default function ForumClient({
  forumId,
  currentUser,
  locale: _locale,
  translations: t,
  readOnly = false,
}: ForumClientProps) {
  const router = useRouter();
  const [posts, setPosts] = React.useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showNewPost, setShowNewPost] = React.useState(false);
  const [expandedPost, setExpandedPost] = React.useState<string | null>(null);
  const [comments, setComments] = React.useState<Record<string, CommentData[]>>({});
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [reportTarget, setReportTarget] = React.useState<{
    type: 'post' | 'comment';
    id: string;
  } | null>(null);
  const [nicknameInput, setNicknameInput] = React.useState('');

  // Load posts
  React.useEffect(() => {
    loadPosts();
  }, [forumId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forums/${forumId}/posts`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  // Load comments for a post
  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments((prev) => ({ ...prev, [postId]: data.data }));
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  // Create new post
  const handleCreatePost = async (content: string) => {
    if (!currentUser) {
      router.push('/api/auth/signin');
      return;
    }

    if (currentUser.isBanned) {
      alert(t.profileBanned);
      return;
    }

    try {
      const response = await fetch(`/api/forums/${forumId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        await loadPosts();
        setShowNewPost(false);
      } else {
        throw new Error(data.error || 'Error creating post');
      }
    } catch (err) {
      throw err;
    }
  };

  // Create comment
  const handleCreateComment = async (postId: string, content: string) => {
    if (!currentUser) {
      router.push('/api/auth/signin');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        await loadComments(postId);
      } else {
        throw new Error(data.error || 'Error creating comment');
      }
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  // Like post
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadPosts();
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        // Reload comments for the relevant post
        const postId = expandedPost;
        if (postId) {
          await loadComments(postId);
        }
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  // Report content
  const handleReport = async (reason: ReportReason, details?: string) => {
    if (!reportTarget) return;

    try {
      const endpoint =
        reportTarget.type === 'post'
          ? `/api/posts/${reportTarget.id}/report`
          : `/api/comments/${reportTarget.id}/report`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      });

      const data = await response.json();

      if (data.success) {
        alert(t.reportSuccess);
      } else {
        alert(data.error || 'Error submitting report');
      }
    } catch (err) {
      alert('Error submitting report');
    }
  };

  // Update nickname
  const handleUpdateNickname = async () => {
    if (!nicknameInput.trim()) return;

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || t.nicknameTaken);
      }
    } catch (err) {
      alert('Error updating nickname');
    }
  };

  // Toggle post expansion
  const togglePostExpansion = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12" role="status" aria-live="polite">
        <span
          className="animate-spin"
          style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--lh-border)', borderTopColor: 'var(--lh-accent)', marginBottom: 16 }}
          aria-hidden="true"
        />
        <p style={{ color: 'var(--lh-fg3)' }}>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} style={{ color: 'var(--lh-terra)', margin: '0 auto 16px' }} aria-hidden="true" />
        <p style={{ marginBottom: 16, fontWeight: 500, color: 'var(--lh-terra)' }}>{error}</p>
        <button onClick={loadPosts} className="lh-btn lh-btn--md lh-btn--primary">
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Read-only banner for archived/closed forums */}
      {readOnly && (
        <div role="note" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)' }}>
          <Archive size={16} style={{ color: 'var(--lh-warm)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--lh-fg2)', margin: 0 }}>{t.readOnlyBanner}</p>
        </div>
      )}

      {/* Nickname Form - Show automatically if user has no nickname */}
      {!readOnly && currentUser && !currentUser.nickname && (
        <div className="lh-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 6px' }}>
            {t.setNickname || 'Configura tu nickname'}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: '0 0 16px' }}>
            {t.nicknameRules || 'Para participar en los foros necesitas un nickname. Debe tener entre 3-20 caracteres (letras, números y guión bajo).'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <label htmlFor="forum-nickname" className="sr-only">Nickname</label>
            <input
              id="forum-nickname"
              name="nickname"
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="mi_nickname"
              maxLength={20}
              className="lh-input"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleUpdateNickname}
              disabled={!nicknameInput.trim()}
              className="lh-btn lh-btn--md lh-btn--primary"
            >
              {t.nicknameSave || 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* New Post Button/Form */}
      {!readOnly && currentUser && currentUser.nickname && !currentUser.isBanned && (
        <div className="space-y-4">
          {!showNewPost ? (
            <button
              onClick={() => setShowNewPost(true)}
              aria-expanded={false}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderRadius: 16, border: '1.5px dashed var(--lh-border)', background: 'var(--lh-surface)', color: 'var(--lh-fg2)', cursor: 'pointer', fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 14.5, transition: 'border-color .2s, color .2s' }}
            >
              <Plus size={18} aria-hidden="true" />
              <span>{t.postNew}</span>
            </button>
          ) : (
            <div className="lh-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 16px' }}>
                {t.postNew}
              </h3>
              <ForumPostForm
                t={(key) => t[key] || key}
                onSubmit={handleCreatePost}
                onCancel={() => setShowNewPost(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="lh-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <MessageSquare size={48} style={{ color: 'var(--lh-fg3)', opacity: 0.5, margin: '0 auto 16px' }} aria-hidden="true" />
          <p style={{ color: 'var(--lh-fg2)' }}>{t.emptyPosts}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="space-y-4">
              <ForumPostCard
                post={post}
                t={(key) => t[key] || key}
                currentUserId={currentUser?.id}
                userRole={currentUser?.role}
                readOnly={readOnly}
                onLike={handleLikePost}
                onReport={(postId) => {
                  setReportTarget({ type: 'post', id: postId });
                  setReportModalOpen(true);
                }}
                onReply={togglePostExpansion}
              />

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="ml-4 space-y-4">
                  {/* Comment Form */}
                  {!readOnly && currentUser && currentUser.nickname && !currentUser.isBanned && (
                    <div className="pl-12 pt-4">
                      <ForumPostForm
                        t={(key) => t[key] || key}
                        onSubmit={(content) => handleCreateComment(post.id, content)}
                        placeholder={t.commentWrite}
                        maxLength={500}
                      />
                    </div>
                  )}

                  {/* Comments List */}
                  {comments[post.id]?.length === 0 ? (
                    <p className="ml-12 text-sm" style={{ color: 'var(--lh-fg3)' }}>{t.emptyComments}</p>
                  ) : (
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <ForumCommentCard
                          key={comment.id}
                          comment={comment}
                          t={(key) => t[key] || key}
                          currentUserId={currentUser?.id}
                          userRole={currentUser?.role}
                          readOnly={readOnly}
                          onLike={handleLikeComment}
                          onReport={(commentId) => {
                            setReportTarget({ type: 'comment', id: commentId });
                            setReportModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ForumReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportTarget(null);
        }}
        onSubmit={handleReport}
        t={(key) => t[key] || key}
        contentType={reportTarget?.type || 'post'}
      />
    </div>
  );
}

