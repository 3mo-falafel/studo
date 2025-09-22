import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

// Force dynamic rendering so middleware runs
export const dynamic = 'force-dynamic'

async function updateOrderStatus(orderId: number, status: string) {
  'use server'
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  })
  revalidatePath('/admin/orders')
}

async function deleteOrder(orderId: number) {
  'use server'
  // Delete order items first
  await prisma.orderItem.deleteMany({
    where: { orderId }
  })
  
  // Then delete the order
  await prisma.order.delete({
    where: { id: orderId }
  })
  revalidatePath('/admin/orders')
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; search?: string }> }) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  const searchQuery = params.search || ''
  
  // Build dynamic where conditions
  const whereConditions: any = {}
  
  if (statusFilter !== 'all') {
    whereConditions.status = statusFilter
  }
  
  if (searchQuery) {
    whereConditions.OR = [
      { fullName: { contains: searchQuery, mode: 'insensitive' } },
      { whatsapp: { contains: searchQuery, mode: 'insensitive' } },
      { id: { equals: isNaN(Number(searchQuery)) ? -1 : Number(searchQuery) } }
    ]
  }

  const [orders, stats] = await Promise.all([
    prisma.order.findMany({ 
      where: whereConditions,
      include: { 
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }, 
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    })
  ])

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count.id
    return acc
  }, {} as Record<string, number>)

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Orders Management</h2>
        <div className="text-sm text-gray-600">
          {totalOrders} orders • ${totalRevenue.toFixed(2)} total revenue
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.pending || 0}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.processing || 0}</div>
          <div className="text-sm text-gray-500">Processing</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{statusCounts.delivered || 0}</div>
          <div className="text-sm text-gray-500">Delivered</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled || 0}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{totalOrders}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            name="search" 
            placeholder="Search by name, WhatsApp, or order ID..."
            defaultValue={searchQuery}
            className="border px-3 py-2 rounded-md"
          />
          <select name="status" defaultValue={statusFilter} className="border px-3 py-2 rounded-md">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Filter
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Items</th>
                <th className="p-3">Delivery</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-mono text-sm">#{order.id}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{order.customerName}</div>
                  </td>
                  <td className="p-3">
                    <a 
                      href={`https://wa.me/${order.whatsappNumber.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {order.whatsappNumber}
                    </a>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-xs">
                          {item.quantity}x {item.product.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs">
                      <div className="font-medium">
                        {order.deliveryOption === 'HOME_DELIVERY' ? 'Home Delivery' : 'Free Pickup'}
                      </div>
                      {Number(order.deliveryFee) > 0 && (
                        <div className="text-gray-500">+${Number(order.deliveryFee).toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">${Number(order.totalPrice).toFixed(2)}</div>
                  </td>
                  <td className="p-3">
                    <form action={async (formData) => {
                      'use server'
                      const newStatus = formData.get('status') as string
                      await updateOrderStatus(order.id, newStatus)
                    }}>
                      <select 
                        name="status" 
                        defaultValue={order.status}
                        onChange={(e) => e.target.form?.requestSubmit()}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <form action={async () => { 'use server'; await deleteOrder(order.id) }} className="inline">
                        <button 
                          type="submit" 
                          className="text-red-600 hover:underline text-sm"
                          onClick={(e) => !confirm('Delete this order?') && e.preventDefault()}
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
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  )
}
