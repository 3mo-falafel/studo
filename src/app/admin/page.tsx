import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (session !== 'ok') redirect('/admin/login')
  
  const [
    productsCount, 
    categoriesCount, 
    bannersCount,
    activeProducts,
    featuredProducts,
    lowStockProducts,
    recentProducts,
    activeBanners
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.discountBanner.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { stockQuantity: { lte: 10 } } }),
    prisma.product.findMany({ 
      take: 5, 
      orderBy: { createdAt: 'desc' },
      include: { category: true, images: true }
    }),
    prisma.discountBanner.count({ where: { isActive: true } })
  ])

  const stats = [
    { title: 'Total Products', count: productsCount, subtitle: `${activeProducts} active`, color: 'blue', icon: '📦' },
    { title: 'Categories', count: categoriesCount, subtitle: 'Product categories', color: 'green', icon: '📂' },
    { title: 'Banners', count: bannersCount, subtitle: `${activeBanners} active`, color: 'purple', icon: '🎯' },
    { title: 'Featured Products', count: featuredProducts, subtitle: 'Promoted items', color: 'yellow', icon: '⭐' },
    { title: 'Low Stock Alert', count: lowStockProducts, subtitle: '≤10 units remaining', color: 'red', icon: '⚠️' },
  ]

  const quickActions = [
    { title: 'Add Product', href: '/admin/products', icon: '➕', color: 'blue' },
    { title: 'Manage Categories', href: '/admin/categories', icon: '📂', color: 'green' },
    { title: 'Create Banner', href: '/admin/banners', icon: '🎨', color: 'purple' },
    { title: 'View Products', href: '/admin/products', icon: '👁️', color: 'gray' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Manage your e-commerce store with professional tools</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{stat.icon}</div>
              <div className={`text-2xl font-bold ${
                stat.color === 'blue' ? 'text-blue-600' :
                stat.color === 'green' ? 'text-green-600' :
                stat.color === 'purple' ? 'text-purple-600' :
                stat.color === 'yellow' ? 'text-yellow-600' :
                stat.color === 'red' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.count}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
            <div className="text-xs text-gray-500">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              href={action.href}
              className={`p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all text-center group ${
                action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50' :
                action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50' :
                action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50' :
                'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {action.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Products and Alerts */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Products</h2>
            <Link href="/admin/products" className="text-blue-600 hover:underline text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                {product.images[0] ? (
                  <img src={product.images[0].url} alt="" className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.category.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">${product.originalPrice.toString()}</span>
                    {product.discountPrice && (
                      <span className="text-xs text-red-600">${product.discountPrice.toString()}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      product.stockQuantity > 10 ? 'bg-green-100 text-green-800' :
                      product.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stockQuantity} stock
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {product.isFeatured && <span className="text-yellow-500 text-xs">⭐</span>}
                  {product.isRecentlyAdded && <span className="text-green-500 text-xs">🆕</span>}
                  {!product.isActive && <span className="text-gray-400 text-xs">💤</span>}
                </div>
              </div>
            ))}
            {recentProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">📦</div>
                <div className="text-sm">No products yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts and Notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Store Alerts</h2>
          <div className="space-y-3">
            {lowStockProducts > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span>⚠️</span>
                  <span className="font-medium">Low Stock Alert</span>
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {lowStockProducts} products have 10 or fewer units in stock
                </div>
                <Link href="/admin/products?status=low-stock" className="text-red-700 hover:underline text-xs">
                  View Products →
                </Link>
              </div>
            )}
            
            {activeProducts === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <span>📦</span>
                  <span className="font-medium">No Active Products</span>
                </div>
                <div className="text-sm text-yellow-600 mt-1">
                  Add some products to start selling
                </div>
                <Link href="/admin/products" className="text-yellow-700 hover:underline text-xs">
                  Add Products →
                </Link>
              </div>
            )}
            
            {activeBanners === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <span>🎯</span>
                  <span className="font-medium">No Active Banners</span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Create promotional banners to boost sales
                </div>
                <Link href="/admin/banners" className="text-blue-700 hover:underline text-xs">
                  Create Banner →
                </Link>
              </div>
            )}
            
            {featuredProducts === 0 && activeProducts > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-800">
                  <span>⭐</span>
                  <span className="font-medium">No Featured Products</span>
                </div>
                <div className="text-sm text-purple-600 mt-1">
                  Feature some products to highlight them
                </div>
                <Link href="/admin/products" className="text-purple-700 hover:underline text-xs">
                  Feature Products →
                </Link>
              </div>
            )}
            
            {lowStockProducts === 0 && activeProducts > 0 && activeBanners > 0 && featuredProducts > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <span>✅</span>
                  <span className="font-medium">Store Looking Good!</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  All systems operational. Your store is ready for customers.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <strong>Environment:</strong> Production
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </div>
          <div>
            <strong>Admin Session:</strong> Active
          </div>
        </div>
      </div>
    </div>
  )
}
