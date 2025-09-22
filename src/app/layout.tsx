import React from 'react'
import './css/style.css'
import './css/euclid-circular-a-font.css'

export const metadata = { title: 'Studo' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
