import React from 'react'
import Link from 'next/link'
import '../css/style.css'

export const metadata = { title: 'Admin Dashboard' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
          <main className="p-6 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  )
}
