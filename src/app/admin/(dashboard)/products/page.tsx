import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

async function addProduct(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '').trim()
  const shortDescription = String(formData.get('shortDescription') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const originalPrice = Number(formData.get('originalPrice') || 0)
  const discountPrice = formData.get('discountPrice') ? Number(formData.get('discountPrice')) : null
  const categoryId = Number(formData.get('categoryId'))
  const stockQuantity = Number(formData.get('stockQuantity') || 0)
  const sku = String(formData.get('sku') || '').trim() || null
  const weight = formData.get('weight') ? Number(formData.get('weight')) : null
  const dimensions = String(formData.get('dimensions') || '').trim() || null
  const isRecentlyAdded = formData.get('recent') === 'on'
  const isFeatured = formData.get('featured') === 'on'
  const isActive = formData.get('active') === 'on'
  
  if (!name || !description || !categoryId) return

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      shortDescription: shortDescription || null,
      originalPrice,
      discountPrice,
      isRecentlyAdded,
      isFeatured,
      isActive,
      stockQuantity,
      sku,
      weight,
      dimensions,
      categoryId,
    },
  })
  revalidatePath('/admin/products')
}

async function deleteProduct(id: number) {
  'use server'
  // Delete associated images first
  const images = await prisma.productImage.findMany({ where: { productId: id } })
  for (const img of images) {
    await prisma.productImage.delete({ where: { id: img.id } })
  }
  
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
}

async function bulkUpdateProducts(formData: FormData) {
  'use server'
  const action = formData.get('bulkAction') as string
  const selectedIds = formData.getAll('selectedProducts').map(id => Number(id))
  
  if (!selectedIds.length) return
  
  switch (action) {
    case 'activate':
      await prisma.product.updateMany({
        where: { id: { in: selectedIds } },
        data: { isActive: true }
      })
      break
    case 'deactivate':
      await prisma.product.updateMany({
        where: { id: { in: selectedIds } },
        data: { isActive: false }
      })
      break
    case 'feature':
      await prisma.product.updateMany({
        where: { id: { in: selectedIds } },
        data: { isFeatured: true }
      })
      break
    case 'unfeature':
      await prisma.product.updateMany({
        where: { id: { in: selectedIds } },
        data: { isFeatured: false }
      })
      break
    case 'delete':
      for (const id of selectedIds) {
        await deleteProduct(id)
      }
      break
  }
  
  revalidatePath('/admin/products')
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string; search?: string }> }) {
  const params = await searchParams
  const categoryFilter = params.category ? Number(params.category) : null
  const statusFilter = params.status || 'all'
  const searchQuery = params.search || ''
  
  // Build dynamic where conditions
  const whereConditions: any = {}
  
  if (categoryFilter) {
    whereConditions.categoryId = categoryFilter
  }
  
  if (statusFilter === 'active') {
    whereConditions.isActive = true
  } else if (statusFilter === 'inactive') {
    whereConditions.isActive = false
  } else if (statusFilter === 'featured') {
    whereConditions.isFeatured = true
  } else if (statusFilter === 'low-stock') {
    whereConditions.stockQuantity = { lte: 10 }
  }
  
  if (searchQuery) {
    whereConditions.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
      { sku: { contains: searchQuery, mode: 'insensitive' } }
    ]
  }

  const [products, categories, stats] = await Promise.all([
    prisma.product.findMany({ 
      where: whereConditions,
      include: { category: true, images: true }, 
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }]
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.groupBy({
      by: ['isActive'],
      _count: { id: true }
    })
  ])

  const activeCount = stats.find(s => s.isActive)?._count.id || 0
  const inactiveCount = stats.find(s => !s.isActive)?._count.id || 0
  const featuredCount = await prisma.product.count({ where: { isFeatured: true } })
  const lowStockCount = await prisma.product.count({ where: { stockQuantity: { lte: 10 } } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products Management</h2>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk-import" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Bulk Import
          </Link>
          <Link href="/admin/products/export" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
            Export
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Active Products</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">{inactiveCount}</div>
          <div className="text-sm text-gray-500">Inactive Products</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{featuredCount}</div>
          <div className="text-sm text-gray-500">Featured</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
          <div className="text-sm text-gray-500">Low Stock</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            name="search" 
            placeholder="Search products..."
            defaultValue={searchQuery}
            className="border px-3 py-2 rounded-md"
          />
          <select name="category" defaultValue={categoryFilter || ''} className="border px-3 py-2 rounded-md">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={statusFilter} className="border px-3 py-2 rounded-md">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="low-stock">Low Stock</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Filter
          </button>
        </form>
      </div>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
        <form action={addProduct} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input name="name" placeholder="Product Name *" required className="border px-3 py-2 rounded-md" />
            <select name="categoryId" required className="border px-3 py-2 rounded-md">
              <option value="">Select Category *</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <input name="shortDescription" placeholder="Short Description" className="border px-3 py-2 rounded-md" />
          <textarea name="description" placeholder="Full Description *" required className="border px-3 py-2 rounded-md" rows={3} />
          
          <div className="grid md:grid-cols-4 gap-4">
            <input name="originalPrice" type="number" step="0.01" placeholder="Original Price *" required className="border px-3 py-2 rounded-md" />
            <input name="discountPrice" type="number" step="0.01" placeholder="Sale Price" className="border px-3 py-2 rounded-md" />
            <input name="stockQuantity" type="number" placeholder="Stock Quantity *" required className="border px-3 py-2 rounded-md" />
            <input name="sku" placeholder="SKU" className="border px-3 py-2 rounded-md" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <input name="weight" type="number" step="0.01" placeholder="Weight (kg)" className="border px-3 py-2 rounded-md" />
            <input name="dimensions" placeholder="Dimensions (L×W×H cm)" className="border px-3 py-2 rounded-md" />
          </div>
          
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="recent" />
              Recently Added
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="featured" />
              Featured Product
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form action={bulkUpdateProducts}>
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select name="bulkAction" className="border px-3 py-2 rounded-md text-sm">
                <option value="">Bulk Actions</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
                <option value="feature">Feature Selected</option>
                <option value="unfeature">Remove Feature</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900">
                Apply
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {products.length} products found
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3"><input type="checkbox" className="rounded" /></th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" name="selectedProducts" value={p.id} className="rounded" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          <img src={p.images[0].url} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <div>
                          <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline font-medium">
                            {p.name}
                          </Link>
                          <div className="text-xs text-gray-500 space-x-2">
                            {p.sku && <span>SKU: {p.sku}</span>}
                            {p.isFeatured && <span className="text-yellow-600">★ Featured</span>}
                            {p.isRecentlyAdded && <span className="text-green-600">🆕 New</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{p.category.name}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className={`${p.discountPrice ? 'line-through text-gray-500' : 'font-medium'}`}>
                          ${p.originalPrice.toString()}
                        </div>
                        {p.discountPrice && (
                          <div className="text-red-600 font-medium">${p.discountPrice.toString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        p.stockQuantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : p.stockQuantity > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        p.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/products/${p.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        <form action={async () => { 'use server'; await deleteProduct(p.id) }} className="inline">
                          <button 
                            type="submit" 
                            className="text-red-600 hover:underline text-sm"
                            onClick={(e) => !confirm('Delete this product?') && e.preventDefault()}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </div>
    </div>
  )
}
