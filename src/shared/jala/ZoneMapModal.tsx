import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Anchor, CloudSun, Fish, Waves, Wind, X } from 'lucide-react'
import { set, useJala } from './store'
import { ZONES, ZONE_STATUS_LABEL } from './aceh'
import type { ZoneStatus } from './aceh'

type Effective = ZoneStatus | 'pantang'

const TONE: Record<Effective, { dot: string; badge: string }> = {
  aman: { dot: '#1A7F46', badge: 'bg-go-soft text-go' },
  waspada: { dot: '#B7791F', badge: 'bg-[#FDF3E1] text-[#8A5A12]' },
  bahaya: { dot: '#B42323', badge: 'bg-adat-soft text-adat' },
  pantang: { dot: '#B42323', badge: 'bg-adat-soft text-adat' },
}

export function useZoneStatus() {
  const s = useJala()
  return (id: string): Effective => {
    if (s.adatDay) return 'pantang'
    return s.zoneStatus[id] ?? ZONES.find((z) => z.id === id)?.status ?? 'aman'
  }
}

export function ZoneMapModal() {
  const s = useJala()
  const statusOf = useZoneStatus()
  const [selected, setSelected] = useState(ZONES[0].id)
  const reduce = useReducedMotion()
  const zone = ZONES.find((z) => z.id === selected) ?? ZONES[0]
  const st = statusOf(zone.id)
  const close = () => set({ mapOpen: false })

  return (
    <AnimatePresence>
      {s.mapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-ocean-deep/60"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="peta-judul"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 id="peta-judul" className="text-lg font-bold text-ink sm:text-xl">
                  Peta Zona Tangkap Perairan Aceh
                </h2>
                <p className="text-sm text-muted">
                  {s.adatDay
                    ? 'Hari ini Hari Pantang Melaut — seluruh zona ditutup sesuai Hukom Adat Laot.'
                    : 'Prakiraan pagi ini untuk enam wilayah lhok. Pilih titik untuk melihat detail.'}
                </p>
              </div>
              <button onClick={close} className="shrink-0 rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-mist" aria-label="Tutup peta">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1.15fr_1fr]">
              <div className="relative bg-[#DCEBF2] p-3 sm:p-5">
                <svg viewBox="0 0 400 440" className="mx-auto h-auto w-full max-w-[460px]" role="img" aria-label="Peta skematis pesisir Aceh dengan titik zona tangkap">
                  {/* Daratan Aceh (skematis) */}
                  <polygon
                    points="48,62 60,54 80,58 110,66 140,72 175,80 210,88 245,96 262,102 290,118 320,140 348,170 370,195 380,215 360,240 345,275 335,310 348,345 340,385 325,420 300,412 270,385 240,350 210,315 180,275 155,235 130,195 102,155 78,118 58,92 46,74"
                    fill="#F3EEE2"
                    stroke="#C9BFA8"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="56" cy="26" rx="11" ry="7" fill="#F3EEE2" stroke="#C9BFA8" strokeWidth="1.5" />
                  <ellipse cx="122" cy="368" rx="40" ry="10" transform="rotate(-38 122 368)" fill="#F3EEE2" stroke="#C9BFA8" strokeWidth="1.5" />
                  <text x="200" y="230" textAnchor="middle" className="fill-[#A8997A] text-[13px] font-semibold tracking-[0.3em]">
                    ACEH
                  </text>
                  {[
                    ['Banda Aceh', 66, 70],
                    ['Meulaboh', 160, 226],
                    ['Lhokseumawe', 262, 120],
                    ['Langsa', 340, 186],
                    ['Simeulue', 92, 396],
                    ['Selat Malaka', 300, 52],
                    ['Samudra Hindia', 40, 300],
                  ].map(([t, x, y]) => (
                    <text key={t as string} x={x as number} y={y as number} className="fill-[#5B6B78] text-[9px]">
                      {t}
                    </text>
                  ))}

                  {ZONES.map((z) => {
                    const tone = TONE[statusOf(z.id)]
                    const active = z.id === selected
                    return (
                      <g key={z.id} onClick={() => setSelected(z.id)} className="cursor-pointer" role="button" aria-label={z.name}>
                        {!reduce && (
                          <motion.circle
                            cx={z.x}
                            cy={z.y}
                            r={7}
                            fill={tone.dot}
                            initial={{ opacity: 0.45, scale: 1 }}
                            animate={{ opacity: 0, scale: 2.6 }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: `${z.x}px ${z.y}px` }}
                          />
                        )}
                        <circle cx={z.x} cy={z.y} r={active ? 9 : 7} fill={tone.dot} stroke="#fff" strokeWidth={active ? 3 : 2} />
                        <circle cx={z.x} cy={z.y} r={16} fill="transparent" />
                      </g>
                    )
                  })}
                </svg>
                <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
                  {(['aman', 'waspada', 'bahaya'] as const).map((k) => (
                    <span key={k} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: TONE[k].dot }} />
                      {ZONE_STATUS_LABEL[k]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col border-t border-line md:border-l md:border-t-0">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-ink">{zone.name}</h3>
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[st].badge}`}>{ZONE_STATUS_LABEL[st]}</span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    <Anchor className="h-3.5 w-3.5" /> {zone.area} · {zone.lhok}
                  </p>

                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <Metric icon={<Waves className="h-4 w-4" />} label="Tinggi gelombang" value={zone.wave} strong />
                    <Metric icon={<CloudSun className="h-4 w-4" />} label="Cuaca laut" value={zone.weather} />
                    <Metric icon={<Wind className="h-4 w-4" />} label="Angin" value={zone.wind} />
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <Fish className="h-4 w-4" /> Jenis ikan
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-1">
                        {zone.fish.map((f) => (
                          <span key={f} className="rounded bg-teal-soft px-1.5 py-0.5 text-xs font-medium text-teal">
                            {f}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>

                  <p className={`mt-5 rounded-lg p-3 text-sm ${st === 'pantang' || st === 'bahaya' ? 'bg-adat-soft text-ink' : 'bg-mist text-ink'}`}>
                    {st === 'pantang'
                      ? 'Hari Pantang Melaut (Jumat / Kenduri Laot). Seluruh nelayan dilarang turun ke laut; pelanggar dikenai sanksi adat oleh Panglima Laot.'
                      : zone.note}
                  </p>
                </div>

                <ul className="mt-auto divide-y divide-line border-t border-line">
                  {ZONES.map((z) => {
                    const zst = statusOf(z.id)
                    return (
                      <li key={z.id}>
                        <button
                          onClick={() => setSelected(z.id)}
                          className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-mist sm:px-6 ${
                            z.id === selected ? 'bg-mist font-semibold' : ''
                          }`}
                        >
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TONE[zst].dot }} />
                          <span className="min-w-0 flex-1 truncate text-ink">{z.name}</span>
                          <span className="shrink-0 text-xs text-muted">{z.wave}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
            <p className="border-t border-line px-5 py-2.5 text-xs text-muted sm:px-6">
              Peta skematis. Prakiraan gelombang mengacu pada buletin maritim pagi; status zona ditetapkan Panglima Laot tiap lhok.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Metric({ icon, label, value, strong }: { icon: React.ReactNode; label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {icon} {label}
      </dt>
      <dd className={`mt-1 ${strong ? 'text-lg font-bold text-ocean' : 'font-medium text-ink'}`}>{value}</dd>
    </div>
  )
}
