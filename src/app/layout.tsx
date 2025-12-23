import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Your Year in Claude Code 2025',
  description: 'Discover your coding journey with Claude Code - Annual usage statistics',
  openGraph: {
    title: 'Your Year in Claude Code 2025',
    description: 'Discover your coding journey with Claude Code',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* AdSense 소유권 확인 - 크롤러가 감지할 수 있도록 head에 직접 배치 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2942250321314936"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[--bg-primary] text-[--text-primary] antialiased transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
