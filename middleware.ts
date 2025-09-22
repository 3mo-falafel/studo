import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple Basic Auth for /admin; set ADMIN_PASSWORD in env
export function middleware(req: NextRequest) {
  const url = req.nextUrl
  console.log('MIDDLEWARE: Running for', url.pathname)
  
  if (!url.pathname.startsWith('/admin')) {
    console.log('MIDDLEWARE: Not admin path, skipping')
    return NextResponse.next()
  }

  console.log('MIDDLEWARE: Admin path detected')
  
  const expected = process.env.ADMIN_PASSWORD
  console.log('MIDDLEWARE: Expected password set?', !!expected)
  
  if (!expected) return new NextResponse('ADMIN_PASSWORD not set', { status: 500 })

  const auth = req.headers.get('authorization')
  console.log('MIDDLEWARE: Auth header present?', !!auth)
  
  if (!auth?.startsWith('Basic ')) {
    console.log('MIDDLEWARE: Requesting Basic Auth')
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

  console.log('MIDDLEWARE: User:', user, 'Pass valid:', pass === expected)
  
  if (user !== 'admin' || pass !== expected) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  console.log('MIDDLEWARE: Auth successful')
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
