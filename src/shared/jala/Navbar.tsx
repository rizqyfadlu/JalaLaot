import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Map, MapPin, Package, Search, ShieldCheck, ShoppingCart, Store } from 'lucide-react'
import { isAdmin, openAuth, openCart, set, signOut, useJala } from './store'
import type { View } from './store'
import { Logo } from './Logo'

type Props = {
  view: View
  onNavigate?: (view: View) => void
}

export function Navbar({ view, onNavigate }: Props) {
  const s = useJala()
  const count = s.cart.length

  return (
    <header className="sticky top-0 z-30 bg-ocean text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:gap-x-4 sm:px-6">
        <button onClick={() => onNavigate?.('buyer')} className="shrink-0" aria-label="Beranda JalaLaot">
          <Logo />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (view !== 'buyer') onNavigate?.('buyer')
          }}
          className="order-last flex w-full min-w-0 items-center overflow-hidden rounded-lg bg-white md:order-none md:flex-1"
        >
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted" />
          <input
            value={s.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Cari tongkol, tuna, kakap, Keumamah vakum…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-muted/80 focus:outline-none"
          />
          <button className="m-1 shrink-0 rounded-md bg-coral px-4 py-1.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-coral-dark">
            Cari
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => set({ mapOpen: true })}
            className="flex items-center gap-2 whitespace-nowrap rounded-lg p-2 text-sm font-semibold transition-colors duration-150 hover:bg-white/10 lg:px-2.5"
            title={s.adatDay ? 'Hari Pantang Melaut — lihat peta zona' : 'Hari Melaut Aktif — lihat peta zona'}
          >
            <span className="relative">
              <Map className="h-5 w-5" />
              <span
                className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ring-2 ring-ocean ${s.adatDay ? 'bg-coral' : 'bg-[#4ADE80]'}`}
                aria-hidden
              />
            </span>
            <span className="hidden lg:inline">Peta Zona Tangkap</span>
          </button>

          <button
            onClick={openCart}
            className="relative rounded-lg p-2 transition-colors duration-150 hover:bg-white/10"
            aria-label={`Keranjang, ${count} produk`}
          >
            <motion.span
              key={s.cartPulse}
              initial={s.cartPulse ? { scale: 1 } : false}
              animate={{ scale: [1, 1.28, 0.94, 1] }}
              transition={{ duration: 0.42, times: [0, 0.35, 0.7, 1], ease: 'easeOut' }}
              className="block"
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.span>
            {count > 0 && (
              <motion.span
                key={`b-${s.cartPulse}`}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold"
              >
                {count}
              </motion.span>
            )}
          </button>

          <span className="mx-1 hidden h-6 w-px bg-white/20 sm:block" aria-hidden />

          {s.user ? (
            <ProfileMenu view={view} onNavigate={onNavigate} />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => openAuth('login')}
                className="whitespace-nowrap rounded-lg border border-white/40 px-2.5 py-2 sm:px-3 text-sm font-semibold transition-colors duration-150 hover:bg-white/10"
              >
                Masuk
              </button>
              <button
                onClick={() => openAuth('register')}
                className="whitespace-nowrap rounded-lg bg-white px-2.5 py-2 text-sm sm:px-3 font-semibold text-ocean transition-colors duration-150 hover:bg-white/90"
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function ProfileMenu({ view, onNavigate }: Props) {
  const s = useJala()
  const user = s.user!
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const go = (v: View) => {
    setOpen(false)
    onNavigate?.(v)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((m) => !m)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-white/10"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-ocean">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:block">{user.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-12 w-72 origin-top-right rounded-xl border border-line bg-white p-2 text-ink shadow-xl"
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            <MenuItem active={view === 'profile'} icon={<MapPin className="h-4 w-4" />} label="Profil & Alamat Saya" onClick={() => go('profile')} />
            <MenuItem active={view === 'orders'} icon={<Package className="h-4 w-4" />} label="Pesanan Saya" onClick={() => go('orders')} />
            <MenuItem active={view === 'seller'} icon={<Store className="h-4 w-4" />} label="Toko Saya (Pusat Penjual)" onClick={() => go('seller')} />
            {isAdmin(user) && (
              <MenuItem active={view === 'admin'} icon={<ShieldCheck className="h-4 w-4" />} label="Panel Admin Adat" onClick={() => go('admin')} />
            )}
            <div className="my-1 h-px bg-line" />
            <MenuItem
              icon={<LogOut className="h-4 w-4" />}
              label="Keluar"
              onClick={() => {
                setOpen(false)
                signOut()
                onNavigate?.('buyer')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-mist ${
        active ? 'bg-mist font-semibold' : ''
      }`}
    >
      <span className={active ? 'text-teal' : 'text-muted'}>{icon}</span>
      {label}
    </button>
  )
}

export function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'
  )
}
