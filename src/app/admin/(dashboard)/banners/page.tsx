import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

async function addBanner(formData: FormData) {
  'use server'
  const file = formData.get('bannerImage') as File | null
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  const alt = String(formData.get('alt') || '').trim() || null
  const title = String(formData.get('title') || '').trim() || null
  const subtitle = String(formData.get('subtitle') || '').trim() || null
  const href = String(formData.get('href') || '').trim() || null
  const isActive = formData.get('isActive') === 'on'
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const productIdStr = String(formData.get('productId') || '')
  const productId = productIdStr ? Number(productIdStr) : null

  let finalImageUrl = imageUrl

  // Handle file upload if provided
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners')
    await mkdir(uploadDir, { recursive: true })
    const fileName = `banner-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    finalImageUrl = `/uploads/banners/${fileName}`
  }

  if (!finalImageUrl) return

  await prisma.discountBanner.create({ 
    data: { 
      imageUrl: finalImageUrl, 
      alt, 
      title, 
      subtitle, 
      href, 
      isActive, 
      sortOrder, 
      productId: productId ?? undefined 
    } 
  })
  revalidatePath('/admin/banners')
}

async function deleteBanner(id: number) {
  'use server'
  const banner = await prisma.discountBanner.findUnique({ where: { id } })
  if (banner) {
    // Try to delete the file if it's an uploaded file
    if (banner.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', banner.imageUrl.replace(/^\/+/, ''))
      try { await unlink(filePath) } catch {}
    }
  }
  await prisma.discountBanner.delete({ where: { id } })
  revalidatePath('/admin/banners')
}

async function updateBanner(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!id) return
  
  const file = formData.get('bannerImage') as File | null
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  const alt = String(formData.get('alt') || '').trim() || null
  const title = String(formData.get('title') || '').trim() || null
  const subtitle = String(formData.get('subtitle') || '').trim() || null
  const href = String(formData.get('href') || '').trim() || null
  const isActive = formData.get('isActive') === 'on'
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const productIdStr = String(formData.get('productId') || '')
  const productId = productIdStr ? Number(productIdStr) : null

  let finalImageUrl = imageUrl

  // Handle file upload if provided
  if (file && file.size > 0) {
    // Delete old image if it was uploaded
    const oldBanner = await prisma.discountBanner.findUnique({ where: { id } })
    if (oldBanner?.imageUrl.startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), 'public', oldBanner.imageUrl.replace(/^\/+/, ''))
      try { await unlink(oldPath) } catch {}
    }

    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners')
    await mkdir(uploadDir, { recursive: true })
    const fileName = `banner-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    finalImageUrl = `/uploads/banners/${fileName}`
  }

  await prisma.discountBanner.update({
    where: { id },
    data: {
      imageUrl: finalImageUrl || undefined,
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

async function bulkUpdateBanners(formData: FormData) {
  'use server'
  const action = formData.get('bulkAction') as string
  const selectedIds = formData.getAll('selectedBanners').map(id => Number(id))
  
  if (!selectedIds.length) return
  
  switch (action) {
    case 'activate':
      await prisma.discountBanner.updateMany({
        where: { id: { in: selectedIds } },
        data: { isActive: true }
      })
      break
    case 'deactivate':
      await prisma.discountBanner.updateMany({
        where: { id: { in: selectedIds } },
        data: { isActive: false }
      })
      break
    case 'delete':
      for (const id of selectedIds) {
        await deleteBanner(id)
      }
      break
  }
  
  revalidatePath('/admin/banners')
}

export default async function BannersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  
  const whereConditions: any = {}
  if (statusFilter === 'active') {
    whereConditions.isActive = true
  } else if (statusFilter === 'inactive') {
    whereConditions.isActive = false
  }

  const [banners, products, stats] = await Promise.all([
    prisma.discountBanner.findMany({ 
      where: whereConditions,
      include: { product: true }, 
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] 
    }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.discountBanner.groupBy({
      by: ['isActive'],
      _count: { id: true }
    })
  ])

  const activeCount = stats.find(s => s.isActive)?._count.id || 0
  const inactiveCount = stats.find(s => !s.isActive)?._count.id || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Banners & Promotions</h2>
        <div className="text-sm text-gray-600">
          Manage hero banners, promotional offers, and marketing content
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Active Banners</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">{inactiveCount}</div>
          <div className="text-sm text-gray-500">Inactive Banners</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{banners.length}</div>
          <div className="text-sm text-gray-500">Total Banners</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form className="flex items-center gap-4">
          <select name="status" defaultValue={statusFilter} className="border px-3 py-2 rounded-md">
            <option value="all">All Banners</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Filter
          </button>
        </form>
      </div>

      {/* Add Banner Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Banner</h3>
        <form action={addBanner} className="grid gap-4" encType="multipart/form-data">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <input 
                type="file" 
                name="bannerImage" 
                accept="image/*" 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              <div className="text-xs text-gray-500 mt-1">Recommended: 1200x400px for hero banners</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
              <input 
                name="imageUrl" 
                placeholder="https://example.com/banner.jpg" 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              <div className="text-xs text-gray-500 mt-1">Use file upload above or paste URL here</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                name="title" 
                placeholder="Special Offer!" 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input 
                name="subtitle" 
                placeholder="Up to 50% off selected items" 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input 
                name="href" 
                placeholder="/shop/category/electronics" 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Product</label>
              <select name="productId" className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Product (Optional)</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input 
                name="sortOrder" 
                type="number" 
                defaultValue={0} 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input 
                name="alt" 
                placeholder="Descriptive text for screen readers" 
                className="border border-gray-300 px-3 py-2 rounded-md w-96 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="isActive" defaultChecked className="rounded" />
                <span className="text-sm font-medium">Active</span>
              </label>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Add Banner
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form action={bulkUpdateBanners}>
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select name="bulkAction" className="border px-3 py-2 rounded-md text-sm">
                <option value="">Bulk Actions</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900">
                Apply
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {banners.length} banners found
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {banners.map(b => (
              <div key={b.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={b.imageUrl} alt={b.alt ?? ''} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 left-2">
                    <input type="checkbox" name="selectedBanners" value={b.id} className="rounded" />
                  </div>
                  <div className="absolute top-2 right-2 space-x-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    Order: {b.sortOrder}
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Banner #{b.id}</div>
                    <form action={async () => { 'use server'; await deleteBanner(b.id) }} className="inline">
                      <button 
                        type="submit" 
                        className="text-red-600 hover:underline text-sm"
                        onClick={(e) => !confirm('Delete this banner?') && e.preventDefault()}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                  
                  {(b.title || b.subtitle) && (
                    <div className="text-sm">
                      {b.title && <div className="font-medium">{b.title}</div>}
                      {b.subtitle && <div className="text-gray-600">{b.subtitle}</div>}
                    </div>
                  )}
                  
                  {b.product && (
                    <div className="text-sm text-blue-600">
                      Linked to: {b.product.name}
                    </div>
                  )}
                  
                  <form action={updateBanner} className="space-y-2 text-sm" encType="multipart/form-data">
                    <input type="hidden" name="id" value={b.id} />
                    
                    <div>
                      <input 
                        type="file" 
                        name="bannerImage" 
                        accept="image/*" 
                        className="text-xs w-full" 
                      />
                    </div>
                    
                    <input 
                      name="imageUrl" 
                      defaultValue={b.imageUrl} 
                      placeholder="Image URL" 
                      className="border px-2 py-1 rounded text-xs w-full" 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        name="title" 
                        defaultValue={b.title ?? ''} 
                        placeholder="Title" 
                        className="border px-2 py-1 rounded text-xs" 
                      />
                      <input 
                        name="subtitle" 
                        defaultValue={b.subtitle ?? ''} 
                        placeholder="Subtitle" 
                        className="border px-2 py-1 rounded text-xs" 
                      />
                    </div>
                    
                    <input 
                      name="href" 
                      defaultValue={b.href ?? ''} 
                      placeholder="Link URL" 
                      className="border px-2 py-1 rounded text-xs w-full" 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select name="productId" defaultValue={b.product?.id ?? ''} className="border px-2 py-1 rounded text-xs">
                        <option value="">No product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name.substring(0, 20)}...</option>
                        ))}
                      </select>
                      <input 
                        name="sortOrder" 
                        type="number" 
                        defaultValue={b.sortOrder} 
                        className="border px-2 py-1 rounded text-xs" 
                      />
                    </div>
                    
                    <input 
                      name="alt" 
                      defaultValue={b.alt ?? ''} 
                      placeholder="Alt text" 
                      className="border px-2 py-1 rounded text-xs w-full" 
                    />
                    
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-1 text-xs">
                        <input type="checkbox" name="isActive" defaultChecked={b.isActive} className="rounded" />
                        Active
                      </label>
                      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>
          
          {banners.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🎯</div>
              <div className="text-lg font-medium mb-2">No banners found</div>
              <div className="text-sm">Create your first promotional banner above</div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
