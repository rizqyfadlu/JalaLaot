import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, MapPin, Snowflake, Store } from 'lucide-react'
import { dismissLastOrder, useJala } from './store'
import type { View } from './store'
import { rupiah } from './format'

/** Layar konfirmasi setelah Bayar. Membaca ringkasan yang dibekukan saat pesanan dibuat, bukan keranjang. */
export function OrderSuccess({ onNavigate }: { onNavigate?: (view: View) => void }) {
  const { lastOrder: o } = useJala()

  const go = (v: View) => {
    dismissLastOrder()
    onNavigate?.(v)
  }

  return (
    <AnimatePresence>
      {o && (
        <motion.div
          key={o.invoice}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[55] overflow-y-auto bg-mist"
          role="dialog"
          aria-modal
          aria-labelledby="sukses-judul"
        >
          <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="bg-ocean px-6 pb-7 pt-8 text-center text-white sm:px-10">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.08 }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4ADE80] text-ocean"
                >
                  <Check className="h-7 w-7" strokeWidth={3} />
                </motion.span>
                <h2 id="sukses-judul" className="mt-4 text-2xl font-extrabold">
                  Pesanan Berhasil Dibuat
                </h2>
                <p className="mt-1 text-sm text-white/75">Penjual sudah menerima notifikasi dan akan mengemas pesanan Anda dalam kotak pendingin.</p>
                <div className="mt-5 inline-flex flex-col items-center rounded-xl bg-white/10 px-5 py-3">
                  <span className="text-xs text-white/70">Nomor Invoice / Resi</span>
                  <span className="font-mono text-xl font-bold tracking-wide">{o.invoice}</span>
                </div>
              </div>

              <dl className="divide-y divide-line px-6 sm:px-10">
                <Row icon={<MapPin className="h-4 w-4 text-coral" />} label="Dikirim ke">
                  <p className="font-semibold text-ink">
                    {o.address.recipient} · {o.address.phone}
                  </p>
                  <p className="text-muted">{o.address.detail}</p>
                  <p className="text-muted">
                    Kec. {o.address.district}, {o.address.regency}, Aceh
                  </p>
                </Row>
                <Row icon={<Snowflake className="h-4 w-4 text-frost" />} label="Metode rantai dingin">
                  <p className="font-semibold text-ink">{o.coldChain}</p>
                  <p className="text-muted">{o.eta}</p>
                </Row>
                <Row icon={<Store className="h-4 w-4 text-teal" />} label={`${o.stores.length} toko · ${o.itemCount} produk`}>
                  <p className="text-ink">{o.stores.join(', ')}</p>
                  {o.orderIds.length > 1 && <p className="font-mono text-xs text-muted">{o.orderIds.join(' · ')}</p>}
                </Row>
                <div className="flex items-baseline justify-between py-4">
                  <dt className="text-sm text-muted">Total dibayar{o.shipping ? ` (termasuk ongkir ${rupiah(o.shipping)})` : ''}</dt>
                  <dd className="text-xl font-extrabold tabular-nums text-ocean">{rupiah(o.total)}</dd>
                </div>
              </dl>

              <div className="grid gap-2 border-t border-line bg-mist/50 p-5 sm:grid-cols-2 sm:px-10">
                <button
                  onClick={() => go('buyer')}
                  className="rounded-lg border border-line bg-white py-3 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-mist"
                >
                  Kembali Belanja
                </button>
                <button
                  onClick={() => go('orders')}
                  className="rounded-lg bg-coral py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
                >
                  Lihat Pesanan Saya
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-4 text-sm">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-muted">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  )
}
