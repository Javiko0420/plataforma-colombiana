import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/sports/fixtures/route'

describe('sports fixtures API', () => {
  it('validates query and returns 400 for invalid date', async () => {
    const req = new NextRequest('http://localhost/api/sports/fixtures?date=20250101')
    const res = await GET(req as any)
    expect(res.status).toBe(400)
  })
})


