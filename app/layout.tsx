import type { Metadata } from 'next'
import { Montserrat, Lora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const lora = Lora({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ritual Matero | Mates, Yerbas y Accesorios Artesanales',
    template: '%s | Ritual Matero',
  },
  description:
    'Mates artesanales, yerbas y accesorios. Envíos a todo el país.',
  keywords: [
    'mate artesanal',
    'yerba mate',
    'bombilla',
    'accesorios materos',
    'kit matero',
    'ritual matero',
    'tienda mate argentina',
    'mate calabaza',
    'mate madera',
  ],
  authors: [{ name: 'Ritual Matero' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Ritual Matero',
    title: 'Ritual Matero | Mates, Yerbas y Accesorios Artesanales',
    description: 'El ritual de cada día. Mates, yerbas y accesorios para quienes saben disfrutar el momento.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${lora.variable}`}
    >
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F2E6', color: '#1A1A1A' }}>
        <Providers>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#1C301D',
              color: '#F5F2E9',
              border: '1px solid #2A4B2C',
              fontFamily: 'var(--font-montserrat), sans-serif',
            },
            className: 'font-condensed uppercase tracking-wider text-xs',
          }} 
        />
        <Analytics />
      </body>
    </html>
  )
}
