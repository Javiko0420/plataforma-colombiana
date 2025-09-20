import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/sports/league/route'

describe('league API', () => {
  it('returns 400 for missing league', async () => {
    const req = new NextRequest('http://localhost/api/sports/league')
    const res = await GET(req as any)
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown alias', async () => {
    const req = new NextRequest('http://localhost/api/sports/league?league=unknown')
    const res = await GET(req as any)
    expect(res.status).toBe(404)
  })
})
