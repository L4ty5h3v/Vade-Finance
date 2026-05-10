import type { Metadata } from 'next'
import { Syne, Space_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'ExportFlow TR — Invoice Financing for Turkish Exporters',
  description: 'Unlock working capital from buyer-confirmed export invoices. ExportFlow TR connects Turkish exporters with trusted verifiers and investors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
