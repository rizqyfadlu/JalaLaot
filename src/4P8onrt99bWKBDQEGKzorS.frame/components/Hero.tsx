import React from 'react'
import { ArrowRight, Store } from 'lucide-react'
import { openAuth, set, useJala } from '../../shared/jala/store'
import type { View } from '../../shared/jala/store'
import { IMAGES } from '../../shared/jala/data'

export function Hero({ onNavigate }: { onNavigate?: (view: View) => void }) {
  const s = useJala()

  const explore = () => {
    if (!s.adatDay) set({ category: 'fresh' })
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openStall = () => {
    if (s.user) onNavigate?.('seller')
    else openAuth('register', 'seller')
  }

  return (
    <section className="bg-ocean-deep text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-14">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#7FD3DC]">Pasar hasil laut nelayan Aceh</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]">
            Dari perahu nelayan Aceh, langsung ke dapur Anda.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
            Tongkol, tuna, kakap, dan Keumamah dibeli langsung dari nelayan di pelabuhan se-Aceh — dikemas dalam kotak pendingin dan dikirim
            dengan rantai dingin hingga Gayo Lues dan Simeulue.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={explore}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-coral px-5 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
            >
              Jelajahi Tangkapan Segar <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={openStall}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/10"
            >
              <Store className="h-4 w-4" /> Buka Lapak Nelayan
            </button>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-5 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-6">
            <div>
              <dt className="text-sm text-white/65">Pelabuhan TPI se-Aceh</dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums">23 TPI</dd>
            </div>
            <div>
              <dt className="text-sm text-white/65">Rantai dingin terjaga</dt>
              <dd className="mt-1 whitespace-nowrap text-2xl font-extrabold tabular-nums">0°C s/d −18°C</dd>
            </div>
            <div>
              <dt className="text-sm text-white/65">Patuh Hukom Adat</dt>
              <dd className="mt-1 text-2xl font-extrabold">Panglima Laot</dd>
            </div>
          </dl>
        </div>

        <div className="relative min-w-0">
          <img
            src={IMAGES.hero}
            alt="Nelayan membongkar tuna ke kotak pendingin di TPI Lampulo saat matahari terbit"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <button
            onClick={() => set({ mapOpen: true })}
            className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl bg-white/95 p-3 text-left text-ink shadow-lg transition-colors duration-150 hover:bg-white sm:right-auto sm:max-w-xs"
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.adatDay ? 'bg-adat' : 'bg-go'}`} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{s.adatDay ? 'Hari Pantang Melaut' : 'Laut dibuka hari ini'}</span>
              <span className="block truncate text-xs text-muted">Lihat Peta Zona Tangkap & cuaca laut</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted" />
          </button>
        </div>
      </div>
    </section>
  )
}
