import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileClient from './profile-client.tsx'

export const metadata: Metadata = {
  title: 'Mi Perfil | Plataforma Colombiana',
  description: 'Gestiona tu perfil y configuración',
}

export default async function ProfilePage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/perfil')
  }

  // Fetch user data with stats
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      role: true,
      reputation: true,
      image: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          forumPosts: true,
          forumComments: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch recent activity
  const recentPosts = await prisma.forumPost.findMany({
    where: {
      authorId: user.id,
      isDeleted: false,
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      likesCount: true,
      forum: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  })

  const recentComments = await prisma.forumComment.findMany({
    where: {
      authorId: user.id,
      isDeleted: false,
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      likesCount: true,
      post: {
        select: {
          id: true,
          forum: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  })

  // Calculate total likes
  const postsLikes = recentPosts.reduce((sum, post) => sum + post.likesCount, 0)
  const commentsLikes = recentComments.reduce((sum, comment) => sum + comment.likesCount, 0)
  const totalLikes = postsLikes + commentsLikes

  return (
    <ProfileClient
      user={{
        ...user,
        postsCount: user._count.forumPosts,
        commentsCount: user._count.forumComments,
        totalLikes,
      }}
      recentPosts={recentPosts}
      recentComments={recentComments}
    />
  )
}

