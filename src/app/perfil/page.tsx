// src/app/perfil/page.tsx
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileClient from './profile-client' // Asegúrate que la importación no tenga .tsx

export const metadata: Metadata = {
  title: 'Mi Perfil | Latin Territory',
  description: 'Gestiona tu perfil y tus negocios',
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/perfil')
  }

  // Fetch user data WITH businesses
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
      // Relación nueva: Negocios
      businesses: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          city: true,
          isVerified: true,
          images: true,  // 👈 Agregado para mostrar miniatura
          createdAt: true,
        }
      },
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

  // Fetch recent activity (sin cambios aquí)
  const recentPosts = await prisma.forumPost.findMany({
    where: { authorId: user.id, isDeleted: false },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, content: true, createdAt: true, likesCount: true,
      forum: { select: { name: true, slug: true } },
    },
  })

  const recentComments = await prisma.forumComment.findMany({
    where: { authorId: user.id, isDeleted: false },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, content: true, createdAt: true, likesCount: true,
      post: { select: { id: true, forum: { select: { name: true, slug: true } } } },
    },
  })

  const totalLikes = recentPosts.reduce((s, p) => s + p.likesCount, 0) + 
                     recentComments.reduce((s, c) => s + c.likesCount, 0)

  return (
    <ProfileClient
      user={{
        ...user,
        // @ts-ignore - Prisma types a veces son estrictos con nulls, esto es seguro
        businesses: user.businesses || [],
        postsCount: user._count.forumPosts,
        commentsCount: user._count.forumComments,
        totalLikes,
      }}
      recentPosts={recentPosts}
      recentComments={recentComments}
    />
  )
}
