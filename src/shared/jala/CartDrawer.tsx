import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, MapPin, Minus, Pencil, Plus, ShoppingCart, Snowflake, Store, Trash2, Truck, Warehouse, X } from 'lucide-react'
import { closeCart, placeOrder, requestCheckout, set, setQty, toast, useJala } from './store'
import type { Product } from './data'
import { coldChainFor, pickupAllowed } from './aceh'
import { AddressFields, TextField } from './AddressFields'
import { kg, rupiah } from './format'

type Delivery = 'courier' | 'pickup'

export function CartDrawer() {
  const s = useJala()
  const step = s.cartStep
  const [delivery, setDelivery] = useState<Record<string, Delivery>>({})
  const [addrMode, setAddrMode] = useState<'saved' | 'custom'>('saved')
  const [addr, setAddr] = useState({ recipient: '', phone: '', regency: 'Banda Aceh', district: '', detail: '' })
  const [error, setError] = useState<string | null>(null)

  const savedComplete = !!s.user && !!s.user.district && s.user.detail.length >= 8 && !!s.user.phone

  // Isi ulang alamat dari profil setiap kali tinjauan dibuka.
  useEffect(() => {
    if (step !== 'review' || !s.user) return
    const u = s.user
    setAddr({ recipient: u.name, phone: u.phone, regency: u.regency, district: u.district, detail: u.detail })
    setAddrMode(savedComplete ? 'saved' : 'custom')
    setError(null)
  }, [step, s.user]) // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const map = new Map<string, { storeId: string; storeName: string; location: string; lines: { p: Product; qty: number }[] }>()
    for (const line of s.cart) {
      const p = s.products.find((x) => x.id === line.productId)
      if (!p) continue
      if (!map.has(p.storeId)) map.set(p.storeId, { storeId: p.storeId, storeName: p.storeName, location: p.location, lines: [] })
      map.get(p.storeId)!.lines.push({ p, qty: line.qty })
    }
    return [...map.values()]
  }, [s.cart, s.products])

  const chain = coldChainFor(addr.regency)
  const canPickup = pickupAllowed(addr.regency)
  const deliveryOf = (id: string): Delivery => (canPickup ? (delivery[id] ?? 'courier') : 'courier')
  const subtotal = groups.reduce((t, g) => t + g.lines.reduce((a, l) => a + l.p.pricePerKg * l.qty, 0), 0)
  const shipping = step === 'review' ? groups.reduce((t, g) => t + (deliveryOf(g.storeId) === 'courier' ? chain.fee : 0), 0) : 0
  const total = subtotal + shipping
  const hasFrozen = groups.some((g) => g.lines.some((l) => l.p.tempKind === 'frozen'))

  const pay = () => {
    if (!addr.recipient.trim()) return setError('Nama penerima wajib diisi.')
    if (addr.phone.replace(/\D/g, '').length < 9) return setError('Nomor HP penerima belum lengkap.')
    if (!addr.district.trim() || addr.detail.trim().length < 8) return setError('Lengkapi kecamatan dan alamat lengkap pengiriman.')
    setError(null)
    const summary = placeOrder({
      address: { ...addr, recipient: addr.recipient.trim(), district: addr.district.trim(), detail: addr.detail.trim() },
      coldChain: hasFrozen && chain.method.includes('0–4°C') ? `${chain.method} + Kompartemen Beku −18°C` : chain.method,
      eta: chain.eta,
      groups: groups.map((g) => ({
        storeId: g.storeId,
        storeName: g.storeName,
        delivery: deliveryOf(g.storeId),
        shippingFee: deliveryOf(g.storeId) === 'courier' ? chain.fee : 0,
        items: g.lines.map((l) => ({ name: l.p.name, qty: l.qty, pricePerKg: l.p.pricePerKg })),
      })),
    })
    if (!summary) toast('Pesanan gagal dibuat. Silakan coba lagi.')
  }

  return (
    <AnimatePresence>
      {s.cartOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-ocean-deep/50"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
            aria-label="Keranjang belanja"
          >
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              {step === 'review' && (
                <button onClick={() => set({ cartStep: 'cart' })} className="-ml-1.5 rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-mist" aria-label="Kembali ke keranjang">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="flex-1 text-lg font-bold text-ink">{step === 'review' ? 'Tinjau Pesanan' : 'Keranjang Belanja'}</h2>
              <button onClick={closeCart} className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-mist" aria-label="Tutup keranjang">
                <X className="h-5 w-5" />
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingCart className="h-10 w-10 text-line" />
                <p className="mt-3 font-semibold text-ink">Keranjang Anda masih kosong</p>
                <p className="mt-1 text-sm text-muted">Tangkapan segar dari pesisir Aceh sudah menunggu.</p>
                <button onClick={closeCart} className="mt-5 rounded-lg bg-ocean px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-ocean-deep">
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                  {step === 'review' && s.user && (
                    <section aria-labelledby="alamat-kirim">
                      <h3 id="alamat-kirim" className="flex items-center gap-2 text-sm font-bold text-ink">
                        <MapPin className="h-4 w-4 text-coral" /> Alamat Pengiriman
                      </h3>
                      <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup">
                        <Choice active={addrMode === 'saved'} disabled={!savedComplete} onClick={() => {
                          const u = s.user!
                          setAddr({ recipient: u.name, phone: u.phone, regency: u.regency, district: u.district, detail: u.detail })
                          setAddrMode('saved')
                        }} title="Alamat utama" meta={savedComplete ? 'Dari profil Anda' : 'Belum lengkap'} />
                        <Choice active={addrMode === 'custom'} onClick={() => setAddrMode('custom')} title="Alamat lain" meta="Isi detail pengiriman" />
                      </div>

                      {addrMode === 'saved' ? (
                        <div className="mt-3 rounded-lg border border-line p-3.5 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-ink">
                              {addr.recipient} <span className="font-normal text-muted">· {addr.phone}</span>
                            </p>
                            <button onClick={() => setAddrMode('custom')} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-teal hover:underline">
                              <Pencil className="h-3 w-3" /> Ubah
                            </button>
                          </div>
                          <p className="mt-1 text-muted">{addr.detail}</p>
                          <p className="text-muted">
                            Kec. {addr.district}, {addr.regency}, Aceh
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-3 rounded-lg border border-line p-3.5">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <TextField label="Nama penerima" value={addr.recipient} onChange={(v) => setAddr((a) => ({ ...a, recipient: v }))} />
                            <TextField label="Nomor HP penerima" type="tel" value={addr.phone} onChange={(v) => setAddr((a) => ({ ...a, phone: v }))} placeholder="0812 xxxx xxxx" />
                          </div>
                          <AddressFields value={addr} onChange={(v) => setAddr((a) => ({ ...a, ...v }))} />
                        </div>
                      )}

                      <div className="mt-3 flex gap-3 rounded-lg bg-frost-soft p-3 text-sm">
                        <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-frost" />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{chain.method}</p>
                          <p className="text-xs text-muted">
                            {chain.eta} ke {addr.regency} · {rupiah(chain.fee)} per toko
                            {hasFrozen && ' · produk beku dijaga −18°C'}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {groups.map((g) => {
                    const d = deliveryOf(g.storeId)
                    return (
                      <section key={g.storeId}>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 shrink-0 text-teal" />
                          <h3 className="truncate text-sm font-bold text-ink">{g.storeName}</h3>
                          <span className="truncate text-xs text-muted">· {g.location}</span>
                        </div>

                        <ul className="mt-3 divide-y divide-line">
                          {g.lines.map(({ p, qty }) => (
                            <li key={p.id} className="flex gap-3 py-3">
                              <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                                <p className="text-xs text-muted">
                                  {rupiah(p.pricePerKg)} /kg · {p.temp}
                                </p>
                                {step === 'cart' ? (
                                  <div className="mt-2 flex items-center gap-2">
                                    <QtyButton label="Kurangi" onClick={() => setQty(p.id, +(qty - 0.5).toFixed(1))}>
                                      {qty <= 0.5 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                                    </QtyButton>
                                    <span className="w-14 text-center text-sm font-semibold tabular-nums">{kg(qty)}</span>
                                    <QtyButton label="Tambah" disabled={qty >= p.stockKg} onClick={() => setQty(p.id, Math.min(p.stockKg, +(qty + 0.5).toFixed(1)))}>
                                      <Plus className="h-3.5 w-3.5" />
                                    </QtyButton>
                                  </div>
                                ) : (
                                  <p className="mt-1 text-xs font-semibold text-ink">{kg(qty)}</p>
                                )}
                              </div>
                              <p className="shrink-0 text-sm font-bold tabular-nums text-ink">{rupiah(p.pricePerKg * qty)}</p>
                            </li>
                          ))}
                        </ul>

                        {step === 'review' && (
                          <div className="mt-1 grid grid-cols-2 gap-2" role="radiogroup" aria-label={`Pengiriman dari ${g.storeName}`}>
                            <DeliveryOption
                              active={d === 'courier'}
                              onClick={() => setDelivery((m) => ({ ...m, [g.storeId]: 'courier' }))}
                              icon={<Truck className="h-4 w-4" />}
                              title="Kurir Rantai Dingin"
                              meta={rupiah(chain.fee)}
                            />
                            <DeliveryOption
                              active={d === 'pickup'}
                              disabled={!canPickup}
                              onClick={() => setDelivery((m) => ({ ...m, [g.storeId]: 'pickup' }))}
                              icon={<Warehouse className="h-4 w-4" />}
                              title="Ambil di TPI"
                              meta={canPickup ? 'Gratis' : 'Khusus Banda Aceh & sekitar'}
                            />
                          </div>
                        )}
                      </section>
                    )
                  })}
                </div>

                <div className="border-t border-line px-5 py-4">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted">
                      <dt>Subtotal ({s.cart.length} produk)</dt>
                      <dd className="tabular-nums">{rupiah(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-muted">
                      <dt>Ongkos kirim rantai dingin</dt>
                      <dd className="tabular-nums">{step === 'cart' ? 'Dihitung saat checkout' : shipping ? rupiah(shipping) : 'Gratis'}</dd>
                    </div>
                    <div className="flex justify-between pt-1 text-base font-bold text-ink">
                      <dt>Total</dt>
                      <dd className="tabular-nums text-ocean">{rupiah(total)}</dd>
                    </div>
                  </dl>
                  {error && (
                    <p role="alert" className="mt-3 text-sm font-medium text-adat">
                      {error}
                    </p>
                  )}
                  {step === 'cart' ? (
                    <button
                      onClick={requestCheckout}
                      className="mt-4 w-full rounded-lg bg-coral py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
                    >
                      Buat Pesanan
                    </button>
                  ) : (
                    <button
                      onClick={pay}
                      className="mt-4 w-full rounded-lg bg-coral py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
                    >
                      Bayar {rupiah(total)}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

function QtyButton({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink transition-colors duration-150 hover:bg-mist disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Choice(props: { active: boolean; disabled?: boolean; onClick: () => void; title: string; meta: string }) {
  return (
    <button
      role="radio"
      aria-checked={props.active}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`rounded-lg border p-2.5 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        props.active ? 'border-teal bg-teal-soft' : 'border-line hover:border-teal/50'
      }`}
    >
      <span className="block text-xs font-semibold text-ink">{props.title}</span>
      <span className="block text-xs text-muted">{props.meta}</span>
    </button>
  )
}

function DeliveryOption(props: { active: boolean; disabled?: boolean; onClick: () => void; icon: React.ReactNode; title: string; meta: string }) {
  return (
    <button
      role="radio"
      aria-checked={props.active}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        props.active ? 'border-teal bg-teal-soft text-ink' : 'border-line text-muted hover:border-teal/50'
      }`}
    >
      <span className={props.active ? 'text-teal' : ''}>{props.icon}</span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-xs font-semibold">{props.title}</span>
        <span className="block text-xs">{props.meta}</span>
      </span>
    </button>
  )
}
