import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Check, Clock, MapPin, Plus, Snowflake, Thermometer, Lock } from 'lucide-react'
import type { Product } from './data'
import { CATEGORY_LABEL } from './data'
import { kg, rupiah } from './format'

type Props = {
  product: Product
  paused?: boolean
  highlighted?: boolean
  onAdd?: () => void
}

export function ProductCard({ product: p, paused, highlighted, onAdd }: Props) {
  const soldOut = p.stockKg <= 0
  const reduce = useReducedMotion()
  const [added, setAdded] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const bounce = useAnimationControls()
  useEffect(() => () => clearTimeout(timer.current), [])

  const add = () => {
    onAdd?.()
    setAdded((n) => n + 1)
    if (!reduce) {
      bounce.set({ scale: 0.88 })
      bounce.start({ scale: 1, transition: { type: 'spring', stiffness: 560, damping: 13 } })
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(0), 1400)
  }

  return (
    <motion.article
      whileHover={paused || reduce ? undefined : { y: -4, boxShadow: '0 14px 28px -12px rgba(11,57,84,0.28)' }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`flex h-full flex-col overflow-hidden rounded-xl border bg-white ${
        highlighted ? 'border-teal ring-1 ring-teal' : 'border-line'
      } ${paused ? 'opacity-70' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <img src={p.image} alt={p.name} className={`h-full w-full object-cover ${paused ? 'grayscale' : ''}`} />
        <span
          className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ${
            p.tempKind === 'frozen' ? 'bg-frost text-white' : 'bg-white text-teal'
          }`}
        >
          {p.tempKind === 'frozen' ? <Snowflake className="h-3 w-3" /> : <Thermometer className="h-3 w-3" />}
          {p.temp}
        </span>
        {paused && (
          <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-adat px-3 py-1.5 text-xs font-semibold text-white">
            <Lock className="h-3 w-3" /> Dijeda — Hukom Adat Laot
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] font-semibold text-teal">{CATEGORY_LABEL[p.category]}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-ink sm:text-[15px]">{p.name}</h3>
        <p className="mt-2 text-lg font-extrabold text-ocean">
          {rupiah(p.pricePerKg)}
          <span className="text-xs font-medium text-muted"> /kg</span>
        </p>

        <div className="mt-2 space-y-1 text-xs text-muted">
          <p className="truncate font-medium text-ink/80">{p.storeName}</p>
          <p className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" /> {p.location}
          </p>
          <p className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" /> {p.timeLabel}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <span className={`text-xs font-semibold ${p.stockKg < 20 ? 'text-coral-dark' : 'text-muted'}`}>{soldOut ? 'Habis' : `Sisa ${kg(p.stockKg)}`}</span>
          <motion.button
            onClick={add}
            disabled={paused || soldOut}
            animate={bounce}
            className={`relative inline-flex h-9 w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-lg px-2 text-xs font-bold text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ${
              added ? 'bg-go' : 'bg-coral hover:bg-coral-dark'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'added' : 'idle'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="inline-flex items-center gap-1"
              >
                {added ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5" />}
                {added ? 'Masuk Keranjang' : 'Keranjang'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
