import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { AdminDesktopNav, AdminMobileNav } from '@/components/admin/AdminNav'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // TypeScript guard — después del redirect user nunca es null
  const userEmail = user!.email ?? ''

  return (
    <div className="min-h-screen bg-hueso">
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-borde-suave flex items-center justify-between px-4 h-14">
        <Link href="/" aria-label="Ir al sitio público">
          <span className="font-display text-lg text-verde-profundo tracking-wider">RITUAL MATERO</span>
          <span className="font-condensed text-[9px] text-bronce tracking-[0.3em] uppercase ml-2">Admin</span>
        </Link>
        <span className="font-condensed text-[10px] text-texto-suave uppercase tracking-wider truncate max-w-[140px]">
          {userEmail}
        </span>
      </header>

      <div className="flex">
        {/* ── DESKTOP: Sidebar ── */}
        <aside className="hidden lg:flex w-64 bg-white/80 backdrop-blur-xl border-r border-borde-suave flex-shrink-0 flex-col min-h-screen shadow-card relative z-10">
          {/* Subtle gradient glow in sidebar */}
          <div className="absolute inset-0 bg-gradient-to-b from-hueso to-transparent pointer-events-none" />
          
          {/* Logo */}
          <div className="p-6 border-b border-borde-suave relative">
            <Link href="/" className="block" aria-label="Ir al sitio público">
              <span className="font-display text-xl text-verde-profundo tracking-wider block">RITUAL MATERO</span>
              <span className="font-condensed text-[10px] text-bronce tracking-[0.3em] uppercase">
                Admin
              </span>
            </Link>
          </div>

          {/* Nav */}
          <AdminDesktopNav />

          {/* User / logout */}
          <div className="p-4 border-t border-borde-suave relative bg-hueso/50">
            <div className="mb-3 px-4">
              <p className="font-condensed text-[10px] text-texto-suave uppercase tracking-[0.2em] mb-1">
                Conectado como
              </p>
              <p className="font-condensed text-xs text-verde-profundo truncate">
                {userEmail}
              </p>
            </div>
            <LogoutButton />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-h-screen p-4 pt-18 pb-24 lg:p-10 lg:pt-8 bg-hueso">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE: Bottom navigation bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-borde-suave shadow-[0_-4px_20px_rgba(28,48,29,0.05)]"
        aria-label="Navegación admin mobile"
      >
        <div className="flex items-stretch">
          <AdminMobileNav />
          {/* Logout en la bottom bar */}
          <div className="w-16 flex flex-col items-center justify-center border-l border-borde-suave bg-hueso/50">
            <LogoutButton compact />
          </div>
        </div>
      </nav>
    </div>
  )
}

