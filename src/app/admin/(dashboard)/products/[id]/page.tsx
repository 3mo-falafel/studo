import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import Link from 'next/link'

// Next.js 15 can pass params as a Promise in server components
interface Props { params: Promise<{ id: string }> }

async function updateProduct(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  const name = String(formData.get('name') || '')
  const shortDescription = String(formData.get('shortDescription') || '').trim() || null
  const description = String(formData.get('description') || '')
  const originalPrice = Number(formData.get('originalPrice') || 0)
  const discountPrice = formData.get('discountPrice') ? Number(formData.get('discountPrice')) : null
  const categoryId = Number(formData.get('categoryId'))
  const stockQuantity = Number(formData.get('stockQuantity') || 0)
  const sku = String(formData.get('sku') || '').trim() || null
  const weight = formData.get('weight') ? Number(formData.get('weight')) : null
  const dimensions = String(formData.get('dimensions') || '').trim() || null
  const seoTitle = String(formData.get('seoTitle') || '').trim() || null
  const seoDescription = String(formData.get('seoDescription') || '').trim() || null
  const seoKeywords = String(formData.get('seoKeywords') || '').trim() || null
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const isRecentlyAdded = formData.get('recent') === 'on'
  const isFeatured = formData.get('featured') === 'on'
  const isActive = formData.get('active') === 'on'
  
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  await prisma.product.update({
    where: { id },
    data: { 
      name, 
      description, 
      shortDescription,
      originalPrice, 
      discountPrice, 
      categoryId, 
      isRecentlyAdded, 
      isFeatured,
      isActive,
      stockQuantity,
      sku,
      weight,
      dimensions,
      seoTitle,
      seoDescription,
      seoKeywords,
      sortOrder,
      slug 
    },
  })
  revalidatePath(`/admin/products/${id}`)
  revalidatePath('/admin/products')
}

export default async function ProductEditPage({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { category: true, images: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  
  if (!product) return <div className="p-6"><h2 className="text-xl font-semibold text-red-600">Product not found</h2></div>
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Edit Product</h2>
          <div className="text-sm text-gray-500 mt-1">Product ID: {product.id}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            ← Back to Products
          </Link>
          <Link href={`/shop/products/${product.slug}`} target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            View Live
          </Link>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Status</div>
          <div className={`text-lg font-semibold ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {product.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Stock Level</div>
          <div className={`text-lg font-semibold ${
            product.stockQuantity > 10 ? 'text-green-600' : 
            product.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {product.stockQuantity} units
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Images</div>
          <div className="text-lg font-semibold text-blue-600">{product.images.length} photos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Created</div>
          <div className="text-lg font-semibold text-gray-700">
            {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Product Details Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Product Information</h3>
        <form action={updateProduct} className="grid gap-6">
          <input type="hidden" name="id" value={product.id} />
          
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input 
                  name="name" 
                  defaultValue={product.name} 
                  required
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select 
                  name="categoryId" 
                  defaultValue={product.categoryId} 
                  required
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input 
                name="shortDescription" 
                defaultValue={product.shortDescription || ''} 
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief product summary for listings"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
              <textarea 
                name="description" 
                defaultValue={product.description} 
                required
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows={4}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Pricing & Inventory</h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price *</label>
                <input 
                  name="originalPrice" 
                  type="number" 
                  step="0.01" 
                  defaultValue={String(product.originalPrice)} 
                  required
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                <input 
                  name="discountPrice" 
                  type="number" 
                  step="0.01" 
                  defaultValue={product.discountPrice ? String(product.discountPrice) : ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input 
                  name="stockQuantity" 
                  type="number" 
                  defaultValue={product.stockQuantity} 
                  required
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input 
                  name="sku" 
                  defaultValue={product.sku || ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product code"
                />
              </div>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Physical Properties</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input 
                  name="weight" 
                  type="number" 
                  step="0.01" 
                  defaultValue={product.weight ? String(product.weight) : ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                <input 
                  name="dimensions" 
                  defaultValue={product.dimensions || ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="L×W×H cm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input 
                  name="sortOrder" 
                  type="number" 
                  defaultValue={product.sortOrder} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4">SEO Settings</h4>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input 
                  name="seoTitle" 
                  defaultValue={product.seoTitle || ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Page title for search engines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <textarea 
                  name="seoDescription" 
                  defaultValue={product.seoDescription || ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  rows={3}
                  placeholder="Meta description for search engines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                <input 
                  name="seoKeywords" 
                  defaultValue={product.seoKeywords || ''} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Comma-separated keywords"
                />
              </div>
            </div>
          </div>

          {/* Product Flags */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Product Settings</h4>
            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="recent" defaultChecked={product.isRecentlyAdded} className="rounded" />
                <span className="text-sm font-medium">Recently Added</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="featured" defaultChecked={product.isFeatured} className="rounded" />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="active" defaultChecked={product.isActive} className="rounded" />
                <span className="text-sm font-medium">Active (visible to customers)</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Images Section */}
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
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <div className="text-sm text-gray-500">{images.length} images uploaded</div>
      </div>
      
      <form action={addImage} className="flex items-center gap-3 p-4 bg-gray-50 rounded-md" encType="multipart/form-data">
        <input type="hidden" name="productId" value={productId} />
        <div className="flex-1">
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            required
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          Upload Image
        </button>
      </form>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img, index) => (
          <div key={img.id} className="relative group border rounded-lg overflow-hidden bg-gray-100">
            <img src={img.url} alt="" className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <form action={deleteImage}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="productId" value={productId} />
                <button 
                  type="submit" 
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700"
                  onClick={(e) => !confirm('Delete this image?') && e.preventDefault()}
                >
                  Delete
                </button>
              </form>
            </div>
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <div>No images uploaded yet</div>
          <div className="text-sm">Upload your first product image above</div>
        </div>
      )}
    </div>
  )
}
