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
import { MessageSquare, AlertCircle, Plus } from 'lucide-react';

interface UserProfile {
  id: string;
  nickname: string | null;
  reputation: number;
  isBanned: boolean;
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
}

export default function ForumClient({
  forumId,
  currentUser,
  locale: _locale,
  translations: t,
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
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-foreground/70">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadPosts}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nickname Form - Show automatically if user has no nickname */}
      {currentUser && !currentUser.nickname && (
        <div className="p-6 bg-primary/10 border border-primary/20 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t.setNickname || 'Configura tu nickname'}
          </h3>
          <p className="text-sm text-foreground/70 mb-4">
            {t.nicknameRules || 'Para participar en los foros necesitas un nickname. Debe tener entre 3-20 caracteres (letras, números y guión bajo).'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="mi_nickname"
              maxLength={20}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleUpdateNickname}
              disabled={!nicknameInput.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {t.nicknameSave || 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* New Post Button/Form */}
      {currentUser && currentUser.nickname && !currentUser.isBanned && (
        <div className="space-y-4">
          {!showNewPost ? (
            <button
              onClick={() => setShowNewPost(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">{t.postNew}</span>
            </button>
          ) : (
            <div className="p-6 border border-border rounded-lg bg-background">
              <h3 className="text-lg font-semibold text-foreground mb-4">
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
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70">{t.emptyPosts}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="space-y-4">
              <ForumPostCard
                post={post}
                t={(key) => t[key] || key}
                currentUserId={currentUser?.id}
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
                  {currentUser && currentUser.nickname && !currentUser.isBanned && (
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
                    <p className="ml-12 text-foreground/50 text-sm">{t.emptyComments}</p>
                  ) : (
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <ForumCommentCard
                          key={comment.id}
                          comment={comment}
                          t={(key) => t[key] || key}
                          currentUserId={currentUser?.id}
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

