import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { WalletProvider } from '@/components/WalletProvider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Talent Directory — Decentralized Talent Directory',
  description: 'Discover and verify humans & AI agents on GenLayer',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Header />
          <main className="px-6 py-8">
            {children}
          </main>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}
