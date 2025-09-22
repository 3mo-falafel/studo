import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const hasError = params.error === '1'
  
  async function login(formData: FormData) {
    'use server'
    const user = String(formData.get('user') || '')
    const pass = String(formData.get('pass') || '')
    const expected = process.env.ADMIN_PASSWORD || ''
    
    if (!expected) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      redirect('/admin/login?error=2')
    }
    
    if (user === 'admin' && pass === expected) {
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'ok', { 
        httpOnly: true, 
        path: '/', 
        sameSite: 'lax', 
        maxAge: 60 * 60 * 8,
        secure: process.env.NODE_ENV === 'production'
      })
      redirect('/admin')
    }
    redirect('/admin/login?error=1')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form action={login} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to your admin dashboard</p>
        </div>
        
        {hasError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Invalid credentials. Please try again.
          </div>
        )}
        
        {params.error === '2' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Server configuration error. Contact administrator.
          </div>
        )}
        
        <div className="space-y-4">
          <input 
            name="user" 
            placeholder="Username" 
            required
            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <input 
            name="pass" 
            type="password" 
            placeholder="Password" 
            required
            className="border border-gray-300 w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-md font-medium transition duration-200">
          Sign in
        </button>
        
        <div className="text-center text-sm text-gray-500">
          <p>Use username: <code>admin</code></p>
          <p>Password set via ADMIN_PASSWORD env variable</p>
        </div>
      </form>
    </div>
  )
}
