import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  async function login(formData: FormData) {
    'use server'
    const user = String(formData.get('user') || '')
    const pass = String(formData.get('pass') || '')
    const expected = process.env.ADMIN_PASSWORD || ''
    if (user === 'admin' && pass === expected) {
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'ok', { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 8 })
      redirect('/admin')
    }
    redirect('/admin/login?error=1')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form action={login} className="bg-white shadow rounded p-6 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Admin Login</h1>
        <input name="user" placeholder="Username" className="border w-full px-3 py-2 rounded" />
        <input name="pass" type="password" placeholder="Password" className="border w-full px-3 py-2 rounded" />
        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded">Sign in</button>
      </form>
    </div>
  )
}
