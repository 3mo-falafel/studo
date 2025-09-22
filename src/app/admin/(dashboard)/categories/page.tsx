import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

async function addCategory(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim() || null
  if (!name) return
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  await prisma.category.create({ data: { name, slug } })
  revalidatePath('/admin/categories')
}

async function updateCategory(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  const name = String(formData.get('name') || '').trim()
  if (!name || !id) return
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  await prisma.category.update({ where: { id }, data: { name, slug } })
  revalidatePath('/admin/categories')
}

async function deleteCategory(id: number) {
  'use server'
  // Check if category has products
  const productCount = await prisma.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    throw new Error(`Cannot delete category with ${productCount} products`)
  }
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}

export default async function CategoriesPage() {
  const [categories, categoryStats] = await Promise.all([
    prisma.category.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    }),
    prisma.category.count()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Categories Management</h2>
        <div className="text-sm text-gray-600">
          {categoryStats} categories total
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{categoryStats}</div>
          <div className="text-sm text-gray-500">Total Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {categories.reduce((acc, cat) => acc + cat._count.products, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Products</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {categories.filter(cat => cat._count.products === 0).length}
          </div>
          <div className="text-sm text-gray-500">Empty Categories</div>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
        <form action={addCategory} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input 
                name="name" 
                placeholder="Electronics, Clothing, Books..." 
                required
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                name="description" 
                placeholder="Brief description of the category"
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Add Category
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">All Categories</h3>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📂</div>
            <div className="text-lg font-medium mb-2">No categories yet</div>
            <div className="text-sm">Create your first product category above</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/{category.slug}</code>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        category._count.products > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category._count.products} products
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Edit Form */}
                        <details className="relative">
                          <summary className="text-blue-600 hover:underline cursor-pointer text-sm">
                            Edit
                          </summary>
                          <div className="absolute top-full left-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-10 w-80">
                            <form action={updateCategory} className="space-y-3">
                              <input type="hidden" name="id" value={category.id} />
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Category Name
                                </label>
                                <input 
                                  name="name" 
                                  defaultValue={category.name}
                                  required
                                  className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    const details = (e.target as HTMLElement).closest('details')
                                    if (details) details.removeAttribute('open')
                                  }}
                                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit" 
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        </details>
                        
                        {/* Delete Button */}
                        <form action={async () => { 'use server'; await deleteCategory(category.id) }} className="inline">
                          <button 
                            type="submit" 
                            className={`text-sm hover:underline ${
                              category._count.products > 0 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600'
                            }`}
                            disabled={category._count.products > 0}
                            onClick={(e) => {
                              if (category._count.products > 0) {
                                e.preventDefault()
                                alert(`Cannot delete category with ${category._count.products} products. Move or delete products first.`)
                                return
                              }
                              if (!confirm(`Delete "${category.name}" category?`)) {
                                e.preventDefault()
                              }
                            }}
                            title={
                              category._count.products > 0 
                                ? `Cannot delete: ${category._count.products} products in this category`
                                : 'Delete this category'
                            }
                          >
                            {category._count.products > 0 ? 'Has Products' : 'Delete'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Category Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Keep category names clear and descriptive</li>
          <li>• Categories cannot be deleted if they contain products</li>
          <li>• Slugs are automatically generated from category names</li>
          <li>• Consider creating subcategories for better organization</li>
        </ul>
      </div>
    </div>
  )
}
