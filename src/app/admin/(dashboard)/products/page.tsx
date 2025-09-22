import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function addProduct(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const originalPrice = Number(formData.get('originalPrice') || 0)
  const discountPrice = formData.get('discountPrice') ? Number(formData.get('discountPrice')) : null
  const categoryId = Number(formData.get('categoryId'))
  const isRecentlyAdded = formData.get('recent') === 'on'
  if (!name || !description || !categoryId) return

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      originalPrice,
      discountPrice,
      isRecentlyAdded,
      categoryId,
    },
  })
  revalidatePath('/admin/products')
}

async function deleteProduct(id: number) {
  'use server'
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Products</h2>
      <form action={addProduct} className="grid gap-2 bg-white p-4 rounded shadow">
        <div className="grid md:grid-cols-2 gap-2">
          <input name="name" placeholder="Name" className="border px-3 py-2 rounded" />
          <select name="categoryId" className="border px-3 py-2 rounded">
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <textarea name="description" placeholder="Description" className="border px-3 py-2 rounded" rows={3} />
        <div className="grid md:grid-cols-3 gap-2">
          <input name="originalPrice" type="number" step="0.01" placeholder="Original price" className="border px-3 py-2 rounded" />
          <input name="discountPrice" type="number" step="0.01" placeholder="Discount price (optional)" className="border px-3 py-2 rounded" />
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="recent" /> Recently added</label>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-fit">Add product</button>
        <p className="text-sm text-gray-500">Images can be attached after creation in the edit dialog (to be implemented) or via the Banners section.</p>
      </form>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Prices</th>
              <th className="p-3">Recent</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3"><a className="text-blue-600 hover:underline" href={`/admin/products/${p.id}`}>{p.name}</a></td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">${'{'}p.originalPrice.toString(){'}'} → {p.discountPrice ? p.discountPrice.toString() : '-'}
                </td>
                <td className="p-3">{p.isRecentlyAdded ? 'Yes' : 'No'}</td>
                <td className="p-3 text-right">
                  <form action={async () => deleteProduct(p.id)}>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
