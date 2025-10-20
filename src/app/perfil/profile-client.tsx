'use client'

import { useTranslations } from '@/components/providers/language-provider'
import { Calendar, Mail, User as UserIcon, MessageSquare, ThumbsUp, Award, Settings } from 'lucide-react'
import Link from 'next/link'
import { DateDisplay } from '@/components/ui/date-display'

interface ProfileUser {
  id: string
  name: string | null
  email: string
  nickname: string | null
  role: string
  reputation: number
  image: string | null
  createdAt: Date
  lastLoginAt: Date | null
  postsCount: number
  commentsCount: number
  totalLikes: number
}

interface RecentPost {
  id: string
  content: string
  createdAt: Date
  likesCount: number
  forum: {
    name: string
    slug: string
  }
}

interface RecentComment {
  id: string
  content: string
  createdAt: Date
  likesCount: number
  post: {
    id: string
    forum: {
      name: string
      slug: string
    }
  }
}

interface ProfileClientProps {
  user: ProfileUser
  recentPosts: RecentPost[]
  recentComments: RecentComment[]
}

export default function ProfileClient({ user, recentPosts, recentComments }: ProfileClientProps) {
  const { t } = useTranslations()

  const roleNames: Record<string, string> = {
    USER: 'Usuario',
    BUSINESS_OWNER: 'Propietario de Negocio',
    MODERATOR: 'Moderador',
    ADMIN: 'Administrador',
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.name || user.email}
                </h1>
                {user.nickname && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    @{user.nickname}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                    {roleNames[user.role] || user.role}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">{user.reputation} pts</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                href="/perfil/configuracion"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>{t('profile.edit')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.postsCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.posts')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.commentsCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.comments')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <ThumbsUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.totalLikes}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.likes')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.reputation}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.stats.reputation')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Información
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.info.email')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.info.member')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      <DateDisplay date={user.createdAt} format="short" />
                    </p>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profile.info.lastLogin')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        <DateDisplay date={user.lastLoginAt} format="relative" />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('profile.activity.title')}
              </h2>

              {recentPosts.length === 0 && recentComments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('profile.activity.empty')}
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Recent Posts */}
                  {recentPosts.map((post) => (
                    <div
                      key={`post-${post.id}`}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/foros/${post.forum.slug}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {post.forum.name}
                          </Link>
                          <p className="text-gray-900 dark:text-white mt-1 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <DateDisplay date={post.createdAt} format="relative" />
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.likesCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Recent Comments */}
                  {recentComments.map((comment) => (
                    <div
                      key={`comment-${comment.id}`}
                      className="border-l-4 border-purple-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/foros/${comment.post.forum.slug}`}
                            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {comment.post.forum.name}
                          </Link>
                          <p className="text-gray-900 dark:text-white mt-1 line-clamp-2">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <DateDisplay date={comment.createdAt} format="relative" />
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {comment.likesCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

