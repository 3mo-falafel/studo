import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

async function addBanner(formData: FormData) {
  'use server'
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  const alt = String(formData.get('alt') || '').trim() || null
  const title = String(formData.get('title') || '').trim() || null
  const subtitle = String(formData.get('subtitle') || '').trim() || null
  const href = String(formData.get('href') || '').trim() || null
  const isActive = formData.get('isActive') === 'on'
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const productIdStr = String(formData.get('productId') || '')
  const productId = productIdStr ? Number(productIdStr) : null
  if (!imageUrl) return
  await prisma.discountBanner.create({ data: { imageUrl, alt, title, subtitle, href, isActive, sortOrder, productId: productId ?? undefined } })
  revalidatePath('/admin/banners')
}

async function deleteBanner(id: number) {
  'use server'
  await prisma.discountBanner.delete({ where: { id } })
  revalidatePath('/admin/banners')
}

async function updateBanner(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!id) return
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  const alt = String(formData.get('alt') || '').trim() || null
  const title = String(formData.get('title') || '').trim() || null
  const subtitle = String(formData.get('subtitle') || '').trim() || null
  const href = String(formData.get('href') || '').trim() || null
  const isActive = formData.get('isActive') === 'on'
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const productIdStr = String(formData.get('productId') || '')
  const productId = productIdStr ? Number(productIdStr) : null
  await prisma.discountBanner.update({
    where: { id },
    data: {
      imageUrl: imageUrl || undefined,
      alt,
      title,
      subtitle,
      href,
      isActive,
      sortOrder,
      productId: productId ?? undefined,
    },
  })
  revalidatePath('/admin/banners')
}

export default async function BannersPage() {
  const [banners, products] = await Promise.all([
    prisma.discountBanner.findMany({ include: { product: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Discount & Hero Banners</h2>
      <form action={addBanner} className="grid gap-2 bg-white p-4 rounded shadow">
        <div className="grid md:grid-cols-2 gap-2">
          <input name="imageUrl" placeholder="Image URL (or upload target)" className="border px-3 py-2 rounded" />
          <input name="alt" placeholder="Alt text (optional)" className="border px-3 py-2 rounded" />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          <input name="title" placeholder="Title (optional)" className="border px-3 py-2 rounded" />
          <input name="subtitle" placeholder="Subtitle (optional)" className="border px-3 py-2 rounded" />
        </div>
        <div className="grid md:grid-cols-3 gap-2 items-center">
          <input name="href" placeholder="Link href (optional)" className="border px-3 py-2 rounded" />
          <select name="productId" className="border px-3 py-2 rounded">
            <option value="">Link to product (optional)</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
            <input name="sortOrder" type="number" defaultValue={0} className="border px-3 py-2 rounded w-28" placeholder="Order" />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-fit">Add banner</button>
        <p className="text-sm text-gray-500">You can upload images to /public or to object storage and paste the URL here. We can add direct file upload later.</p>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded shadow overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt={b.alt ?? ''} className="w-full h-40 object-cover" />
            <div className="p-3 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Banner #{b.id} {b.isActive ? '' : '(inactive)'}</div>
                  <div className="text-gray-500">{b.product ? `Linked: ${b.product.name}` : 'Not linked'}</div>
                </div>
                <form action={async () => deleteBanner(b.id)}>
                  <button className="text-red-600 hover:underline">Delete</button>
                </form>
              </div>
              <form action={updateBanner} className="grid gap-2">
                <input type="hidden" name="id" value={b.id} />
                <div className="grid md:grid-cols-2 gap-2">
                  <input name="imageUrl" defaultValue={b.imageUrl} placeholder="Image URL" className="border px-3 py-2 rounded" />
                  <input name="alt" defaultValue={b.alt ?? ''} placeholder="Alt" className="border px-3 py-2 rounded" />
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <input name="title" defaultValue={b.title ?? ''} placeholder="Title" className="border px-3 py-2 rounded" />
                  <input name="subtitle" defaultValue={b.subtitle ?? ''} placeholder="Subtitle" className="border px-3 py-2 rounded" />
                </div>
                <div className="grid md:grid-cols-3 gap-2 items-center">
                  <input name="href" defaultValue={b.href ?? ''} placeholder="Link href" className="border px-3 py-2 rounded" />
                  <select name="productId" defaultValue={b.product?.id ?? ''} className="border px-3 py-2 rounded">
                    <option value="">No product link</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={b.isActive} /> Active</label>
                    <input name="sortOrder" type="number" defaultValue={b.sortOrder} className="border px-3 py-2 rounded w-28" placeholder="Order" />
                  </div>
                </div>
                <div className="text-right">
                  <button className="bg-gray-900 text-white px-3 py-2 rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
