import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Anchor, Snowflake, Package } from 'lucide-react'

export function AdatBanner({ on, variant = 'buyer' }: { on: boolean; variant?: 'buyer' | 'seller' }) {
  return (
    <AnimatePresence initial={false}>
      {on && (
        <motion.section
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden border-b border-adat/20 bg-adat-soft"
          role="status"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-start md:gap-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-adat text-white">
              <Anchor className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-adat sm:text-lg">
                Hukom Adat Laot — Hari Pantang Melaut (Jumat / Kenduri Laot)
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink/80">
                Sesuai ketetapan <strong>Panglima Laot</strong>, lembaga adat laut Aceh, nelayan tidak turun ke laut hari
                ini. {variant === 'seller'
                  ? 'Unggahan Ikan Segar dihentikan sementara untuk semua toko hingga hari melaut berikutnya. Anda tetap dapat menjual produk Penyimpanan Beku dan Keumamah Vakum.'
                  : 'Penjualan ikan segar dihentikan sementara hingga hari melaut berikutnya — marketplace kini menampilkan stok Penyimpanan Beku dan Keumamah Vakum Tanpa Limbah.'}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-frost">
                <Snowflake className="h-3.5 w-3.5" /> Stok beku tersedia
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal">
                <Package className="h-3.5 w-3.5" /> Keumamah vakum tersedia
              </span>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
