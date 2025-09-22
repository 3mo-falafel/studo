import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function addCategory(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  await prisma.category.create({ data: { name, slug } })
  revalidatePath('/admin/categories')
}

async function deleteCategory(id: number) {
  'use server'
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Categories</h2>
      <form action={addCategory} className="flex gap-2">
        <input name="name" placeholder="New category name" className="border px-3 py-2 rounded w-full" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <ul className="divide-y bg-white rounded shadow">
        {cats.map(c => (
          <li key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">/{c.slug}</div>
            </div>
            <form action={async () => deleteCategory(c.id)}>
              <button className="text-red-600 hover:underline">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
