import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/sports/summary/route'

describe('sports summary API', () => {
  it('returns 400 for invalid season', async () => {
    const req = new NextRequest('http://localhost/api/sports/summary?season=20x5')
    const res = await GET(req as any)
    expect(res.status).toBe(400)
  })
})
