import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'

interface Props { params: { id: string } }

async function updateProduct(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  const name = String(formData.get('name') || '')
  const description = String(formData.get('description') || '')
  const originalPrice = Number(formData.get('originalPrice') || 0)
  const discountPrice = formData.get('discountPrice') ? Number(formData.get('discountPrice')) : null
  const categoryId = Number(formData.get('categoryId'))
  const isRecentlyAdded = formData.get('recent') === 'on'
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  await prisma.product.update({
    where: { id },
    data: { name, description, originalPrice, discountPrice, categoryId, isRecentlyAdded, slug },
  })
  revalidatePath(`/admin/products/${id}`)
  revalidatePath('/admin/products')
}

export default async function ProductEditPage({ params }: Props) {
  const id = Number(params.id)
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { category: true, images: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) return <div>Product not found</div>
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Edit Product</h2>
      <form action={updateProduct} className="grid gap-2 bg-white p-4 rounded shadow">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid md:grid-cols-2 gap-2">
          <input name="name" defaultValue={product.name} placeholder="Name" className="border px-3 py-2 rounded" />
          <select name="categoryId" defaultValue={product.categoryId} className="border px-3 py-2 rounded">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <textarea name="description" defaultValue={product.description} className="border px-3 py-2 rounded" rows={3} />
        <div className="grid md:grid-cols-3 gap-2">
          <input name="originalPrice" type="number" step="0.01" defaultValue={String(product.originalPrice)} className="border px-3 py-2 rounded" />
          <input name="discountPrice" type="number" step="0.01" defaultValue={product.discountPrice ? String(product.discountPrice) : ''} className="border px-3 py-2 rounded" />
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="recent" defaultChecked={product.isRecentlyAdded} /> Recently added</label>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-fit">Save changes</button>
      </form>

      {/* Images */}
      <ImagesSection productId={product.id} images={(product.images ?? []).map(i => ({ id: i.id, url: i.url }))} />
    </div>
  )
}

async function addImage(formData: FormData) {
  'use server'
  const productId = Number(formData.get('productId'))
  const file = formData.get('image') as File | null
  if (!file || !productId) return
  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`
  const filePath = path.join(uploadDir, fileName)
  await writeFile(filePath, buffer)
  await prisma.productImage.create({ data: { productId, url: `/uploads/${fileName}` } })
  revalidatePath(`/admin/products/${productId}`)
}

async function deleteImage(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  const productId = Number(formData.get('productId'))
  const img = await prisma.productImage.findUnique({ where: { id } })
  if (img) {
    // Try remove file from disk (best-effort)
    const p = path.join(process.cwd(), 'public', img.url.replace(/^\/+/, ''))
    try { await unlink(p) } catch {}
  }
  await prisma.productImage.delete({ where: { id } })
  revalidatePath(`/admin/products/${productId}`)
}

function ImagesSection({ productId, images }: { productId: number; images: { id: number; url: string }[] }) {
  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="text-lg font-semibold">Product Images</h3>
      <form action={addImage} className="flex items-center gap-3" encType="multipart/form-data">
        <input type="hidden" name="productId" value={productId} />
        <input type="file" name="image" accept="image/*" className="border px-3 py-2 rounded" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Upload</button>
      </form>
      <div className="grid md:grid-cols-4 gap-3">
        {images.map(img => (
          <div key={img.id} className="relative group border rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-40 object-cover" />
            <form action={deleteImage} className="absolute top-2 right-2">
              <input type="hidden" name="id" value={img.id} />
              <input type="hidden" name="productId" value={productId} />
              <button className="bg-red-600 text-white text-xs px-2 py-1 rounded opacity-90 hover:opacity-100">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
