import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const data = await request.formData()
  const file = data.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`
  const filePath = path.join(uploadDir, fileName)
  await writeFile(filePath, buffer)
  const url = `/uploads/${fileName}`
  return NextResponse.json({ url })
}
