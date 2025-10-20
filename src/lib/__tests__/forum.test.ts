/**
 * Forum Helper Functions Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    forum: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    forumPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    forumComment: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    report: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Forum Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveForums', () => {
    it('should return active forums', async () => {
      const mockForums = [
        {
          id: '1',
          name: 'Foro Diario 1',
          description: 'Test forum',
          slug: 'daily-1-2024-01-01',
          topic: 'DAILY_1',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-01T23:59:59Z'),
          isActive: true,
          isArchived: false,
          _count: { posts: 10 },
        },
      ];

      const { prisma } = await import('@/lib/prisma');
      const { getActiveForums } = await import('@/lib/forum');

      vi.mocked(prisma.forum.findMany).mockResolvedValue(mockForums as any);

      const result = await getActiveForums();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Foro Diario 1');
      expect(result[0].postsCount).toBe(10);
    });
  });

  describe('createPost', () => {
    it('should create a post with valid input', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createPost } = await import('@/lib/forum');

      const mockUser = {
        id: 'user1',
        isBanned: false,
        nickname: 'testuser',
      };

      const mockForum = {
        id: 'forum1',
        isActive: true,
      };

      const mockPost = {
        id: 'post1',
        content: 'Test post',
        authorId: 'user1',
        forumId: 'forum1',
        author: {
          id: 'user1',
          nickname: 'testuser',
          reputation: 0,
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.forum.findUnique).mockResolvedValue(mockForum as any);
      vi.mocked(prisma.forumPost.create).mockResolvedValue(mockPost as any);

      const result = await createPost({
        content: 'Test post',
        forumId: 'forum1',
        authorId: 'user1',
      });

      expect(result).toBeDefined();
      expect(result.content).toBe('Test post');
    });

    it('should throw error if user is banned', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createPost } = await import('@/lib/forum');

      const mockUser = {
        id: 'user1',
        isBanned: true,
        nickname: 'testuser',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(
        createPost({
          content: 'Test post',
          forumId: 'forum1',
          authorId: 'user1',
        })
      ).rejects.toThrow('User is banned from posting');
    });

    it('should throw error if content is too short', async () => {
      const { createPost } = await import('@/lib/forum');

      await expect(
        createPost({
          content: '',
          forumId: 'forum1',
          authorId: 'user1',
        })
      ).rejects.toThrow('Content must be between 1 and 500 characters');
    });

    it('should throw error if content is too long', async () => {
      const { createPost } = await import('@/lib/forum');

      const longContent = 'a'.repeat(501);

      await expect(
        createPost({
          content: longContent,
          forumId: 'forum1',
          authorId: 'user1',
        })
      ).rejects.toThrow('Content must be between 1 and 500 characters');
    });

    it('should throw error if user has no nickname', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createPost } = await import('@/lib/forum');

      const mockUser = {
        id: 'user1',
        isBanned: false,
        nickname: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(
        createPost({
          content: 'Test post',
          forumId: 'forum1',
          authorId: 'user1',
        })
      ).rejects.toThrow('User must set a nickname before posting');
    });
  });

  describe('likePost', () => {
    it('should increment likes and update author reputation', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { likePost } = await import('@/lib/forum');

      const mockPost = {
        id: 'post1',
        likesCount: 5,
        authorId: 'user1',
        author: {
          id: 'user1',
          reputation: 100,
        },
      };

      vi.mocked(prisma.forumPost.update).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await likePost('post1', 'user2');

      expect(prisma.forumPost.update).toHaveBeenCalledWith({
        where: { id: 'post1' },
        data: { likesCount: { increment: 1 } },
        include: { author: { select: { id: true, reputation: true } } },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { reputation: { increment: 5 } },
      });
    });
  });

  describe('createReport', () => {
    it('should create a report and increment report count', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createReport } = await import('@/lib/forum');

      const mockReport = {
        id: 'report1',
        reason: 'SPAM',
        reporterId: 'user1',
        postId: 'post1',
      };

      const mockPost = {
        id: 'post1',
        reportsCount: 2,
        isFlagged: false,
      };

      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);
      vi.mocked(prisma.forumPost.update).mockResolvedValue(mockPost as any);

      const result = await createReport({
        reason: 'SPAM' as any,
        reporterId: 'user1',
        postId: 'post1',
      });

      expect(result).toBeDefined();
      expect(result.reason).toBe('SPAM');
    });

    it('should auto-flag content after 3 reports', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createReport } = await import('@/lib/forum');

      const mockPost = {
        id: 'post1',
        reportsCount: 3,
        isFlagged: false,
      };

      vi.mocked(prisma.report.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.report.create).mockResolvedValue({} as any);
      vi.mocked(prisma.forumPost.update)
        .mockResolvedValueOnce(mockPost as any)
        .mockResolvedValueOnce({ ...mockPost, isFlagged: true } as any);

      await createReport({
        reason: 'SPAM' as any,
        reporterId: 'user1',
        postId: 'post1',
      });

      expect(prisma.forumPost.update).toHaveBeenCalledTimes(2);
    });

    it('should throw error if user already reported', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createReport } = await import('@/lib/forum');

      const existingReport = {
        id: 'report1',
        reporterId: 'user1',
        postId: 'post1',
      };

      vi.mocked(prisma.report.findFirst).mockResolvedValue(existingReport as any);

      await expect(
        createReport({
          reason: 'SPAM' as any,
          reporterId: 'user1',
          postId: 'post1',
        })
      ).rejects.toThrow('You have already reported this content');
    });
  });

  describe('updateUserNickname', () => {
    it('should update nickname with valid input', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateUserNickname } = await import('@/lib/forum');

      const mockUser = {
        id: 'user1',
        nickname: 'newnickname',
        reputation: 0,
        isBanned: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await updateUserNickname('user1', 'newnickname');

      expect(result.nickname).toBe('newnickname');
    });

    it('should throw error for invalid nickname format', async () => {
      const { updateUserNickname } = await import('@/lib/forum');

      await expect(
        updateUserNickname('user1', 'ab')
      ).rejects.toThrow('Nickname must be 3-20 characters');

      await expect(
        updateUserNickname('user1', 'invalid-nickname!')
      ).rejects.toThrow('only letters, numbers, and underscores');
    });

    it('should throw error if nickname is taken', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateUserNickname } = await import('@/lib/forum');

      const existingUser = {
        id: 'user2',
        nickname: 'taken',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);

      await expect(
        updateUserNickname('user1', 'taken')
      ).rejects.toThrow('Nickname is already taken');
    });
  });
});

