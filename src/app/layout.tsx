import React from 'react'
import './css/style.css'

export const metadata = { title: 'Studo' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
