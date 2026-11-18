import React, { useMemo } from 'react'
import { Lock, SearchX } from 'lucide-react'

import { Shell } from '../shared/jala/Shell'
import { ProductCard } from '../shared/jala/ProductCard'
import { addToCart, set, useControls, useJala } from '../shared/jala/store'
import type { View } from '../shared/jala/store'
import type { Category } from '../shared/jala/data'
import { Hero } from './components/Hero'

export const args = {
  adatDay: false,
  signedIn: false,
}

export const argTypes = {
  adatDay: { control: 'boolean' },
  signedIn: { control: 'boolean' },
}

type Props = Partial<typeof args> & { onNavigate?: (view: View) => void }

const PILLS: { id: 'all' | Category; label: string; sub?: string }[] = [
  { id: 'all', label: 'Semua Produk' },
  { id: 'fresh', label: 'Ikan Segar' },
  { id: 'cold', label: 'Stok Penyimpanan Beku' },
  { id: 'keumamah', label: 'Keumamah Vakum', sub: 'Tanpa Limbah' },
]

export default function Marketplace(props: Props) {
  const { adatDay, signedIn, onNavigate } = { ...args, ...props }
  useControls({ adatDay, signedIn })
  const s = useJala()

  const category = s.adatDay && s.category === 'fresh' ? 'all' : s.category
  const matches = useMemo(() => {
    const q = s.search.trim().toLowerCase()
    return s.products.filter(
      (p) =>
        (!q || `${p.name} ${p.storeName} ${p.location} ${p.category}`.toLowerCase().includes(q)) &&
        (category === 'all' || p.category === category),
    )
  }, [s.products, s.search, category])

  const live = s.adatDay ? matches.filter((p) => p.category !== 'fresh') : matches
  const paused = s.adatDay ? matches.filter((p) => p.category === 'fresh') : []

  return (
    <Shell view="buyer" onNavigate={onNavigate}>
      {!s.search && <Hero onNavigate={onNavigate} />}

      <main id="katalog" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 pt-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ocean sm:text-3xl">
              {s.search
                ? `Hasil pencarian “${s.search}”`
                : s.adatDay
                  ? 'Hasil Laut Rantai Dingin, Siap Hari Ini'
                  : 'Tangkapan Segar Pagi Ini'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {s.adatDay
                ? 'Stok beku dan Keumamah vakum dari gudang pendingin lokal serta dapur UMKM.'
                : 'Didaratkan di TPI Lampulo, Ulee Lheue, dan Ujong Pancu — dikirim ke seluruh Aceh dengan rantai dingin.'}
            </p>
          </div>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{live.length}</span> produk
          </p>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
          {PILLS.map((pill) => {
            const locked = s.adatDay && pill.id === 'fresh'
            const active = category === pill.id
            return (
              <button
                key={pill.id}
                role="tab"
                aria-selected={active}
                disabled={locked}
                onClick={() => set({ category: pill.id })}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                  active
                    ? 'border-ocean bg-ocean text-white'
                    : locked
                      ? 'cursor-not-allowed border-adat/30 bg-adat-soft text-adat'
                      : 'border-line bg-white text-ink hover:border-teal hover:text-teal'
                }`}
              >
                {locked && <Lock className="h-3.5 w-3.5" />}
                {pill.label}
                {pill.sub && <span className={`font-medium ${active ? 'text-white/70' : 'text-muted'}`}>· {pill.sub}</span>}
              </button>
            )
          })}
        </div>

        {live.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <SearchX className="h-10 w-10 text-line" />
            <p className="mt-3 font-semibold text-ink">{s.search ? `Tidak ada hasil laut untuk “${s.search}”` : 'Belum ada produk di kategori ini'}</p>
            <button onClick={() => set({ search: '', category: 'all' })} className="mt-2 text-sm font-semibold text-teal hover:underline">
              Tampilkan semua produk
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {live.map((p) => (
              <ProductCard key={p.id} product={p} highlighted={s.adatDay} onAdd={() => addToCart(p.id)} />
            ))}
          </div>
        )}

        {paused.length > 0 && (
          <section className="mt-14 border-t border-line pt-8">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <Lock className="h-4 w-4 text-adat" /> Ikan segar kembali tersedia pada hari melaut berikutnya
            </h2>
            <p className="mt-1 text-sm text-muted">
              {paused.length} produk dijeda sesuai Hukom Adat Laot dan akan tampil kembali otomatis saat kalender Panglima Laot membuka laut.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {paused.map((p) => (
                <ProductCard key={p.id} product={p} paused />
              ))}
            </div>
          </section>
        )}
      </main>
    </Shell>
  )
}
