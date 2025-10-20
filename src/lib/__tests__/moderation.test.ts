/**
 * Moderation System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    forumPost: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    forumComment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    report: {
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

global.fetch = vi.fn();

describe('Moderation System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  describe('moderateContent', () => {
    it('should return unflagged when API key not configured', async () => {
      const { moderateContent } = await import('@/lib/moderation');

      const result = await moderateContent('test content');

      expect(result.flagged).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should flag inappropriate content', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { moderateContent } = await import('@/lib/moderation');

      const mockResponse = {
        ok: true,
        json: async () => ({
          results: [
            {
              flagged: true,
              categories: {
                hate: true,
                harassment: false,
              },
              category_scores: {
                hate: 0.9,
                harassment: 0.1,
              },
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await moderateContent('inappropriate content');

      expect(result.flagged).toBe(true);
      expect(result.reason).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/moderations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('should not flag appropriate content', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { moderateContent } = await import('@/lib/moderation');

      const mockResponse = {
        ok: true,
        json: async () => ({
          results: [
            {
              flagged: false,
              categories: {
                hate: false,
                harassment: false,
              },
              category_scores: {
                hate: 0.01,
                harassment: 0.01,
              },
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await moderateContent('normal content');

      expect(result.flagged).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { moderateContent } = await import('@/lib/moderation');

      vi.mocked(fetch).mockRejectedValue(new Error('API Error'));

      const result = await moderateContent('test content');

      expect(result.flagged).toBe(false);
    });
  });

  describe('moderatePost', () => {
    it('should update post with moderation results', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { prisma } = await import('@/lib/prisma');
      const { moderatePost } = await import('@/lib/moderation');

      const mockPost = {
        content: 'test content',
        authorId: 'user1',
      };

      const mockResponse = {
        ok: true,
        json: async () => ({
          results: [
            {
              flagged: false,
              categories: {},
              category_scores: { hate: 0.1 },
            },
          ],
        }),
      };

      vi.mocked(prisma.forumPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.forumPost.update).mockResolvedValue({} as any);
      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await moderatePost('post1');

      expect(prisma.forumPost.update).toHaveBeenCalledWith({
        where: { id: 'post1' },
        data: {
          moderationScore: 0.1,
          isFlagged: false,
          flagReason: null,
        },
      });
    });

    it('should decrease reputation when content is flagged', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { prisma } = await import('@/lib/prisma');
      const { moderatePost } = await import('@/lib/moderation');

      const mockPost = {
        content: 'inappropriate content',
        authorId: 'user1',
      };

      const mockResponse = {
        ok: true,
        json: async () => ({
          results: [
            {
              flagged: true,
              categories: { hate: true },
              category_scores: { hate: 0.9 },
            },
          ],
        }),
      };

      vi.mocked(prisma.forumPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.forumPost.update).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await moderatePost('post1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { reputation: { decrement: 10 } },
      });
    });
  });

  describe('checkAutoBan', () => {
    it('should ban user with low reputation', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkAutoBan } = await import('@/lib/moderation');

      const mockUser = {
        reputation: -51,
        isBanned: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.forumPost.count).mockResolvedValue(0);
      vi.mocked(prisma.report.count).mockResolvedValue(0);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await checkAutoBan('user1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          isBanned: true,
          reputation: { decrement: 20 },
        },
      });
    });

    it('should ban user with multiple flagged posts', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkAutoBan } = await import('@/lib/moderation');

      const mockUser = {
        reputation: 0,
        isBanned: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.forumPost.count).mockResolvedValue(5);
      vi.mocked(prisma.report.count).mockResolvedValue(0);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await checkAutoBan('user1');

      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should not ban user with good standing', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkAutoBan } = await import('@/lib/moderation');

      const mockUser = {
        reputation: 100,
        isBanned: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.forumPost.count).mockResolvedValue(0);
      vi.mocked(prisma.report.count).mockResolvedValue(0);

      await checkAutoBan('user1');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});

