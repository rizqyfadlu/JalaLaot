import React from 'react'
import { Anchor, ShieldCheck } from 'lucide-react'

import { NoAccess, Shell, SignInPrompt } from '../shared/jala/Shell'
import { isAdmin, set, setAdatDay, setZoneStatus, useControls, useJala } from '../shared/jala/store'
import type { View } from '../shared/jala/store'
import { ZONES, ZONE_STATUS_LABEL } from '../shared/jala/aceh'
import type { ZoneStatus } from '../shared/jala/aceh'

export const args = {
  adatDay: false,
  admin: true,
}

export const argTypes = {
  adatDay: { control: 'boolean' },
  admin: { control: 'boolean' },
}

type Props = Partial<typeof args> & { onNavigate?: (view: View) => void }

const STATUSES: ZoneStatus[] = ['aman', 'waspada', 'bahaya']

export default function PanelAdminAdat(props: Props) {
  const { adatDay, admin, onNavigate } = { ...args, ...props }
  useControls({ adatDay, admin: props.onNavigate ? undefined : admin })
  const s = useJala()

  const freshLive = s.products.filter((p) => p.category === 'fresh' && p.stockKg > 0).length
  const statusOf = (id: string): ZoneStatus => s.zoneStatus[id] ?? ZONES.find((z) => z.id === id)!.status
  const closed = ZONES.filter((z) => statusOf(z.id) === 'bahaya').length

  return (
    <Shell view="admin" onNavigate={onNavigate} className="bg-mist">
      {!s.user ? (
        <SignInPrompt icon={<ShieldCheck className="h-7 w-7" />} title="Panel Admin Adat" body="Masuk dengan akun admin@jalalaot.id untuk mengelola kalender dan zona melaut." />
      ) : !isAdmin(s.user) ? (
        <NoAccess onBack={() => onNavigate?.('buyer')} />
      ) : (
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-teal">
            <ShieldCheck className="h-4 w-4" /> Panel Admin Adat · {s.user.name}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ocean sm:text-3xl">Kalender & Zona Melaut</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Ketetapan di sini langsung berlaku di marketplace: penjualan ikan segar dijeda saat Hari Pantang, dan status zona tampil di Peta Zona Tangkap.
          </p>

          <section
            className={`mt-6 flex flex-col gap-5 rounded-xl p-5 sm:flex-row sm:items-center sm:p-6 ${s.adatDay ? 'bg-adat text-white' : 'bg-ocean text-white'}`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Anchor className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">{s.adatDay ? 'Hari Pantang Melaut sedang berlaku' : 'Hari Melaut Aktif'}</h2>
              <p className="mt-1 text-sm text-white/80">
                {s.adatDay
                  ? `Seluruh zona ditutup. ${s.products.filter((p) => p.category === 'fresh').length} produk ikan segar dijeda dari marketplace.`
                  : `${freshLive} produk ikan segar tayang · ${closed} zona ditutup karena cuaca.`}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={s.adatDay}
              onClick={() => setAdatDay(!s.adatDay)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-5 py-3 text-sm font-bold transition-colors duration-150 ${
                s.adatDay ? 'bg-white text-adat hover:bg-white/90' : 'bg-coral text-white hover:bg-coral-dark'
              }`}
            >
              {s.adatDay ? 'Buka Kembali Laut' : 'Tetapkan Hari Pantang'}
            </button>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-base font-bold text-ink">Status zona per lhok</h2>
              <button onClick={() => set({ mapOpen: true })} className="text-sm font-semibold text-teal hover:underline">
                Lihat di Peta Zona Tangkap
              </button>
            </div>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl bg-white">
              {ZONES.map((z) => {
                const st = statusOf(z.id)
                return (
                  <li key={z.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{z.name}</p>
                      <p className="text-xs text-muted">
                        {z.lhok} · gelombang {z.wave} · {z.weather}
                      </p>
                    </div>
                    <div className={`grid grid-cols-3 rounded-lg bg-mist p-1 text-xs font-semibold ${s.adatDay ? 'opacity-50' : ''}`} role="radiogroup" aria-label={`Status ${z.name}`}>
                      {STATUSES.map((k) => (
                        <button
                          key={k}
                          role="radio"
                          aria-checked={st === k}
                          disabled={s.adatDay}
                          onClick={() => setZoneStatus(z.id, k)}
                          className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors duration-150 disabled:cursor-not-allowed ${
                            st === k
                              ? k === 'aman'
                                ? 'bg-go text-white'
                                : k === 'waspada'
                                  ? 'bg-[#B7791F] text-white'
                                  : 'bg-adat text-white'
                              : 'text-muted hover:text-ink'
                          }`}
                        >
                          {k === 'bahaya' ? 'Tutup' : ZONE_STATUS_LABEL[k].replace(' melaut', '')}
                        </button>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
            {s.adatDay && <p className="mt-2 text-xs text-muted">Status per zona tidak dapat diubah selama Hari Pantang berlaku.</p>}
          </section>
        </main>
      )}
    </Shell>
  )
}
