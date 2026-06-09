import type { Metadata } from 'next'
import { Geist, Geist_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Polaroma — Turning Ordinary into Timeless',
  description:
    'Transform any photo into a masterpiece in seconds. Apply cinematic film styles, artistic filters, and professional AI edits powered by advanced AI.',
  openGraph: {
    title: 'Polaroma — Turning Ordinary into Timeless',
    description:
      'AI-powered photo studio. Style transfer, background removal, upscaling & more.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect for faster Google Fonts loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Icons — required for icon font throughout the app */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}