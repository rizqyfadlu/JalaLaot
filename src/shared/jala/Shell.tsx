import React from 'react'
import { Lock } from 'lucide-react'
import { Navbar } from './Navbar'
import { AdatBanner } from './AdatBanner'
import { CartDrawer } from './CartDrawer'
import { AuthModal } from './AuthModal'
import { ZoneMapModal } from './ZoneMapModal'
import { OrderSuccess } from './OrderSuccess'
import { Toast } from './Toast'
import { openAuth, useJala } from './store'
import type { View } from './store'

/** Bingkai setiap layar JalaLaot: navbar, banner adat, konten, footer, dan semua lapisan modal. */
export function Shell({
  view,
  onNavigate,
  className = 'bg-white',
  children,
}: {
  view: View
  onNavigate?: (view: View) => void
  className?: string
  children: React.ReactNode
}) {
  const s = useJala()
  return (
    <div className={`flex min-h-screen flex-col ${className}`}>
      <Navbar view={view} onNavigate={onNavigate} />
      <AdatBanner on={s.adatDay} variant={view === 'seller' ? 'seller' : 'buyer'} />

      <div className="flex-1">{children}</div>

      <footer className="mt-auto border-t border-white/10 bg-ocean-deep text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-xs text-white/70 sm:text-sm">
            © 2026 <strong className="font-bold text-white">JalaLaot Aceh</strong>. Merawat Hasil Laut &amp; Hukom Adat Panglima Laot.
          </p>
          <p className="text-xs text-white/50">
            Rantai Dingin TPI · Banda Aceh &amp; 23 Kabupaten/Kota
          </p>
        </div>
      </footer>

      <CartDrawer />
      <AuthModal onNavigate={onNavigate} />
      <ZoneMapModal />
      <OrderSuccess onNavigate={onNavigate} />
      <Toast />
    </div>
  )
}

/** Ditampilkan pada halaman akun ketika pengguna belum masuk. */
export function SignInPrompt({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-soft text-teal">{icon}</span>
      <h1 className="mt-5 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => openAuth('login')}
          className="rounded-lg bg-coral px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
        >
          Masuk
        </button>
        <button
          onClick={() => openAuth('register')}
          className="rounded-lg border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-mist"
        >
          Daftar
        </button>
      </div>
    </main>
  )
}

export function NoAccess({ onBack }: { onBack?: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-adat-soft text-adat">
        <Lock className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink">Akses khusus Admin Adat</h1>
      <p className="mt-2 text-sm text-muted">Panel ini hanya dapat dibuka oleh akun admin yang ditunjuk Founder/CEO.</p>
      <button onClick={onBack} className="mt-6 rounded-lg bg-ocean px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-ocean-deep">
        Kembali ke Beranda
      </button>
    </main>
  )
}
