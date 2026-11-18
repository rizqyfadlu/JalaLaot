import React from 'react'
import { Check, Package, Truck, Warehouse } from 'lucide-react'
import { advanceOrder } from '../../shared/jala/store'
import type { Order, OrderStatus } from '../../shared/jala/data'
import { kg, rupiah } from '../../shared/jala/format'

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  new: { label: 'Pesanan baru', cls: 'bg-coral/10 text-coral-dark' },
  confirmed: { label: 'Dikonfirmasi', cls: 'bg-teal-soft text-teal' },
  packed: { label: 'Sudah Dikemas', cls: 'bg-frost-soft text-frost' },
  shipped: { label: 'Dikirim', cls: 'bg-go-soft text-go' },
}

const ACTION: Partial<Record<OrderStatus, { label: string; icon: React.ReactNode }>> = {
  new: { label: 'Konfirmasi', icon: <Check className="h-3.5 w-3.5" /> },
  confirmed: { label: 'Kemas di Kotak Pendingin', icon: <Package className="h-3.5 w-3.5" /> },
  packed: { label: 'Tandai Dikirim', icon: <Truck className="h-3.5 w-3.5" /> },
}

const STEPS: OrderStatus[] = ['new', 'confirmed', 'packed', 'shipped']

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="rounded-xl bg-white p-10 text-center text-sm text-muted">Belum ada pesanan.</p>
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="hidden grid-cols-[1.1fr_1.6fr_0.9fr_0.9fr_1.3fr] gap-4 border-b border-line bg-mist/60 px-5 py-3 text-xs font-semibold text-muted md:grid">
        <span>Pesanan</span>
        <span>Produk</span>
        <span>Total</span>
        <span>Pengiriman</span>
        <span className="text-right">Status</span>
      </div>
      <ul className="divide-y divide-line">
        {orders.map((o) => {
          const total = o.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0)
          const action = ACTION[o.status]
          const stepIndex = STEPS.indexOf(o.status)
          return (
            <li key={o.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.1fr_1.6fr_0.9fr_0.9fr_1.3fr] md:items-center md:gap-4">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-ocean">{o.id}</p>
                <p className="truncate text-sm font-medium text-ink">{o.customer}</p>
                <p className="text-xs text-muted">
                  {o.district} · {o.placedAt}
                </p>
              </div>
              <ul className="min-w-0 space-y-0.5 text-sm text-ink">
                {o.items.map((i) => (
                  <li key={i.name} className="truncate">
                    <span className="font-semibold tabular-nums">{kg(i.qty)}</span> {i.name}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-bold tabular-nums text-ink">{rupiah(total)}</p>
              <p className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted">
                {o.delivery === 'courier' ? <Truck className="h-4 w-4" /> : <Warehouse className="h-4 w-4" />}
                {o.delivery === 'courier' ? 'Kurir Pendingin' : 'Ambil di TPI'}
              </p>
              <div className="flex flex-col gap-2 md:items-end">
                <div className="flex items-center gap-2">
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[o.status].cls}`}>
                    {STATUS[o.status].label}
                  </span>
                  <span className="flex gap-0.5" aria-hidden>
                    {STEPS.map((st, i) => (
                      <span key={st} className={`h-1.5 w-3 rounded-full ${i <= stepIndex ? 'bg-teal' : 'bg-line'}`} />
                    ))}
                  </span>
                </div>
                {action && (
                  <button
                    onClick={() => advanceOrder(o.id)}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-ocean px-3 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:bg-ocean-deep"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
