import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import ClearLock from './clear-lock'

export const metadata: Metadata = {
  title: 'Lapor Aman',
  description: 'Sistem Pelaporan Keamanan Masyarakat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          {/* FIX: membersihkan overlay Radix UI setelah pindah halaman */}
          <ClearLock />

          {children}
        </Providers>
      </body>
    </html>
  )
}
