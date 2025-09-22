import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}
