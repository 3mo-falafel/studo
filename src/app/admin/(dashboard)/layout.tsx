import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (session !== 'ok') redirect('/admin/login')
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-gray-900 text-white p-4 space-y-2">
        <h1 className="text-xl font-bold mb-4">Admin</h1>
        <nav className="flex flex-col gap-2">
          <Link className="hover:underline" href="/admin">Dashboard</Link>
          <Link className="hover:underline" href="/admin/categories">Categories</Link>
          <Link className="hover:underline" href="/admin/products">Products</Link>
          <Link className="hover:underline" href="/admin/banners">Banners</Link>
        </nav>
      </aside>
      <main className="p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div />
          <form action={async () => { 'use server'; (await cookies()).delete('admin_session'); redirect('/admin/login') }}>
            <button className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
          </form>
        </div>
        {children}
      </main>
    </div>
  )
}
