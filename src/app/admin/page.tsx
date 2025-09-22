import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (session !== 'ok') redirect('/admin/login')
  const [products, categories, banners] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.discountBanner.count(),
  ])
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 rounded-md bg-white shadow">
        <div className="text-sm text-gray-500">Products</div>
        <div className="text-3xl font-bold">{products}</div>
      </div>
      <div className="p-4 rounded-md bg-white shadow">
        <div className="text-sm text-gray-500">Categories</div>
        <div className="text-3xl font-bold">{categories}</div>
      </div>
      <div className="p-4 rounded-md bg-white shadow">
        <div className="text-sm text-gray-500">Banners</div>
        <div className="text-3xl font-bold">{banners}</div>
      </div>
    </div>
  )
}
