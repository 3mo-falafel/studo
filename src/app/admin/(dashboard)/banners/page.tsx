import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

async function addBanner(formData: FormData) {
  'use server'
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  const alt = String(formData.get('alt') || '').trim() || null
  const productIdStr = String(formData.get('productId') || '')
  const productId = productIdStr ? Number(productIdStr) : null
  if (!imageUrl) return
  await prisma.discountBanner.create({ data: { imageUrl, alt, productId: productId ?? undefined } })
  revalidatePath('/admin/banners')
}

async function deleteBanner(id: number) {
  'use server'
  await prisma.discountBanner.delete({ where: { id } })
  revalidatePath('/admin/banners')
}

export default async function BannersPage() {
  const [banners, products] = await Promise.all([
    prisma.discountBanner.findMany({ include: { product: true }, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Discount & Hero Banners</h2>
      <form action={addBanner} className="grid gap-2 bg-white p-4 rounded shadow">
        <input name="imageUrl" placeholder="Image URL (or upload target)" className="border px-3 py-2 rounded" />
        <input name="alt" placeholder="Alt text (optional)" className="border px-3 py-2 rounded" />
        <select name="productId" className="border px-3 py-2 rounded">
          <option value="">Link to product (optional)</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-fit">Add banner</button>
        <p className="text-sm text-gray-500">You can upload images to /public or to object storage and paste the URL here. We can add direct file upload later.</p>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded shadow overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt={b.alt ?? ''} className="w-full h-40 object-cover" />
            <div className="p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-medium">Banner #{b.id}</div>
                <div className="text-gray-500">{b.product ? `Linked: ${b.product.name}` : 'Not linked'}</div>
              </div>
              <form action={async () => deleteBanner(b.id)}>
                <button className="text-red-600 hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
