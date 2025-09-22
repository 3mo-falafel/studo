import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple Basic Auth for /admin; set ADMIN_PASSWORD in env
export function middleware(req: NextRequest) {
  const url = req.nextUrl
  if (!url.pathname.startsWith('/admin')) return NextResponse.next()

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return new NextResponse('ADMIN_PASSWORD not set', { status: 500 })

  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }
  const [, encoded] = auth.split(' ')
  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return new NextResponse('Bad Authorization header', { status: 400 })
  }
  const [user, pass] = decoded.split(':')

  if (user !== 'admin' || pass !== expected) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
