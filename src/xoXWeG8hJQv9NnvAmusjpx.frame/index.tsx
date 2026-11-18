import React, { useMemo, useState } from 'react'
import { MapPin, Package, Snowflake, Store } from 'lucide-react'

import { Shell, SignInPrompt } from '../shared/jala/Shell'
import { useControls, useJala } from '../shared/jala/store'
import type { View } from '../shared/jala/store'
import type { Order, OrderStatus } from '../shared/jala/data'
import { kg, rupiah } from '../shared/jala/format'

export const args = {
  adatDay: false,
  signedIn: true,
  filter: 'all',
}

export const argTypes = {
  adatDay: { control: 'boolean' },
  signedIn: { control: 'boolean' },
  filter: { control: 'radio', options: ['all', 'active', 'shipped'] },
}

type Props = Partial<typeof args> & { onNavigate?: (view: View) => void }

const STEPS: { id: OrderStatus; label: string }[] = [
  { id: 'new', label: 'Dipesan' },
  { id: 'confirmed', label: 'Dikonfirmasi' },
  { id: 'packed', label: 'Dikemas' },
  { id: 'shipped', label: 'Dikirim' },
]

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'active', label: 'Diproses' },
  { id: 'shipped', label: 'Dikirim' },
] as const

export default function PesananSaya(props: Props) {
  const { adatDay, signedIn, filter: initialFilter, onNavigate } = { ...args, ...props }
  useControls({ adatDay, signedIn })
  const s = useJala()
  const [filter, setFilter] = useState(initialFilter)
  const [prevArg, setPrevArg] = useState(initialFilter)
  if (prevArg !== initialFilter) {
    setPrevArg(initialFilter)
    setFilter(initialFilter)
  }

  const invoices = useMemo(() => {
    if (!s.user) return []
    const mine = s.orders.filter((o) => o.buyerEmail === s.user!.email)
    const map = new Map<string, Order[]>()
    for (const o of mine) {
      const k = o.invoice ?? o.id
      map.set(k, [...(map.get(k) ?? []), o])
    }
    return [...map.entries()].map(([invoice, orders]) => ({ invoice, orders }))
  }, [s.orders, s.user])

  const shown = invoices.filter(({ orders }) =>
    filter === 'all' ? true : filter === 'shipped' ? orders.every((o) => o.status === 'shipped') : orders.some((o) => o.status !== 'shipped'),
  )

  return (
    <Shell view="orders" onNavigate={onNavigate} className="bg-mist">
      {!s.user ? (
        <SignInPrompt icon={<Package className="h-7 w-7" />} title="Lihat Pesanan Anda" body="Masuk untuk melacak pesanan hasil laut dan status pengiriman rantai dingin Anda." />
      ) : (
        <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-ocean sm:text-3xl">Pesanan Saya</h1>
          <p className="mt-1 text-sm text-muted">Lacak setiap pesanan dari pelabuhan hingga tiba di depan pintu Anda.</p>

          <div className="mt-6 flex gap-6 border-b border-line" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors duration-150 ${
                  filter === f.id ? 'border-coral text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-xl bg-white px-6 py-16 text-center">
              <Package className="h-10 w-10 text-line" />
              <p className="mt-3 font-semibold text-ink">{invoices.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan di tab ini'}</p>
              <p className="mt-1 text-sm text-muted">Pesanan yang Anda bayar akan muncul di sini beserta status pengirimannya.</p>
              <button
                onClick={() => onNavigate?.('buyer')}
                className="mt-5 rounded-lg bg-coral px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {shown.map(({ invoice, orders }) => {
                const first = orders[0]
                const total = orders.reduce((t, o) => t + (o.shippingFee ?? 0) + o.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0), 0)
                return (
                  <li key={invoice} className="overflow-hidden rounded-xl bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
                      <p className="font-mono text-sm font-bold text-ocean">{invoice}</p>
                      <p className="text-xs text-muted">Dibuat {first.placedAt}</p>
                    </div>

                    {orders.map((o) => {
                      const idx = STEPS.findIndex((x) => x.id === o.status)
                      return (
                        <div key={o.id} className="border-b border-line px-5 py-4 last:border-b-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                              <Store className="h-4 w-4 text-teal" /> {o.storeName ?? 'Toko nelayan'}
                            </p>
                            <span className="whitespace-nowrap rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal">{STEPS[idx]?.label}</span>
                          </div>
                          <ul className="mt-2 space-y-0.5 text-sm text-ink">
                            {o.items.map((i) => (
                              <li key={i.name} className="flex justify-between gap-3">
                                <span className="min-w-0 truncate">
                                  <span className="font-semibold tabular-nums">{kg(i.qty)}</span> {i.name}
                                </span>
                                <span className="shrink-0 tabular-nums text-muted">{rupiah(i.qty * i.pricePerKg)}</span>
                              </li>
                            ))}
                          </ul>
                          <ol className="mt-4 grid grid-cols-4 gap-1" aria-label="Status pengiriman">
                            {STEPS.map((st, i) => (
                              <li key={st.id} className="min-w-0">
                                <span className={`block h-1.5 rounded-full ${i <= idx ? 'bg-teal' : 'bg-line'}`} />
                                <span className={`mt-1.5 block truncate text-[11px] ${i <= idx ? 'font-semibold text-ink' : 'text-muted'}`}>{st.label}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )
                    })}

                    <div className="grid gap-3 bg-mist/60 px-5 py-4 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                      {first.address && (
                        <p className="flex min-w-0 gap-2 text-muted">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                          <span className="min-w-0">
                            <span className="block font-semibold text-ink">{first.address.recipient}</span>
                            Kec. {first.address.district}, {first.address.regency}
                          </span>
                        </p>
                      )}
                      <p className="flex min-w-0 gap-2 text-muted">
                        <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-frost" />
                        <span className="min-w-0">{first.coldChain ?? 'Kurir rantai dingin'}</span>
                      </p>
                      <p className="text-right">
                        <span className="block text-xs text-muted">Total</span>
                        <span className="text-base font-extrabold tabular-nums text-ocean">{rupiah(total)}</span>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </main>
      )}
    </Shell>
  )
}
