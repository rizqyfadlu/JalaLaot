import React, { useEffect, useState } from 'react'
import { Lock, Plus, Snowflake, Thermometer, Trash2 } from 'lucide-react'
import { addProduct, removeProduct } from '../../shared/jala/store'
import { CATEGORY_LABEL } from '../../shared/jala/data'
import type { Category, Product } from '../../shared/jala/data'
import { kg, rupiah } from '../../shared/jala/format'

const EMPTY = {
  name: '',
  category: 'fresh' as Category,
  price: '',
  stock: '',
  tempKind: 'chilled' as 'chilled' | 'frozen',
  landingTime: '05:30',
}

export function ProductsPanel({ products, adatDay }: { products: Product[]; adatDay: boolean }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (adatDay && form.category === 'fresh') setForm((f) => ({ ...f, category: 'keumamah' }))
  }, [adatDay, form.category])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)
    if (!form.name.trim() || !price || !stock) return setError('Isi nama produk, harga per kg, dan stok.')
    if (adatDay && form.category === 'fresh') return setError('Ikan Segar tidak dapat diunggah pada Hari Pantang Melaut.')
    addProduct({
      name: form.name.trim(),
      category: form.category,
      pricePerKg: price,
      stockKg: stock,
      tempKind: form.tempKind,
      landingTime: form.landingTime,
    })
    setError(null)
    setForm({ ...EMPTY, category: adatDay ? 'keumamah' : 'fresh' })
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-base font-bold text-ink">Tambah Produk Hasil Laut</h2>
        <p className="mt-0.5 text-sm text-muted">Langsung tayang di marketplace.</p>

        <div className="mt-5 space-y-4">
          <Label text="Nama produk">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="cth. Ikan Tongkol Segar"
              className={INPUT}
            />
          </Label>

          <fieldset>
            <legend className="text-xs font-semibold text-ink">Kategori</legend>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {(['fresh', 'cold', 'keumamah'] as Category[]).map((c) => {
                const disabled = adatDay && c === 'fresh'
                const active = form.category === c
                return (
                  <label
                    key={c}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
                      disabled
                        ? 'cursor-not-allowed border-adat/25 bg-adat-soft text-adat'
                        : active
                          ? 'cursor-pointer border-teal bg-teal-soft font-semibold text-ink'
                          : 'cursor-pointer border-line text-ink hover:border-teal/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={active}
                      disabled={disabled}
                      onChange={() => setForm({ ...form, category: c, tempKind: c === 'cold' ? 'frozen' : form.tempKind })}
                      className="accent-teal"
                    />
                    <span className="flex-1 whitespace-nowrap">{CATEGORY_LABEL[c]}</span>
                    {disabled && (
                      <span className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold">
                        <Lock className="h-3 w-3" /> Pantang
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <Label text="Harga / kg (Rp)">
              <input type="number" min={0} step={1000} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="42000" className={INPUT} />
            </Label>
            <Label text="Stok (kg)">
              <input type="number" min={0} step={0.5} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" className={INPUT} />
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Label text="Suhu penyimpanan">
              <select value={form.tempKind} onChange={(e) => setForm({ ...form, tempKind: e.target.value as 'chilled' | 'frozen' })} className={INPUT}>
                <option value="chilled">Dingin 0°C – 4°C</option>
                <option value="frozen">Beku −18°C</option>
              </select>
            </Label>
            <Label text="Waktu didaratkan (WIB)">
              <input
                type="time"
                value={form.landingTime}
                disabled={form.category !== 'fresh'}
                onChange={(e) => setForm({ ...form, landingTime: e.target.value })}
                className={`${INPUT} disabled:bg-mist disabled:text-muted`}
              />
            </Label>
          </div>

          {error && <p role="alert" className="text-sm font-medium text-adat">{error}</p>}

          <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-coral py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark">
            <Plus className="h-4 w-4" /> Terbitkan Produk
          </button>
        </div>
      </form>

      <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-white">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-line bg-mist/60 px-5 py-3 text-xs font-semibold text-muted sm:grid">
          <span>Produk</span>
          <span>Harga</span>
          <span>Stok</span>
          <span>Status</span>
          <span className="w-8" />
        </div>
        <ul className="divide-y divide-line">
          {products.map((p) => {
            const paused = adatDay && p.category === 'fresh'
            return (
              <li key={p.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                  <img src={p.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      {p.tempKind === 'frozen' ? <Snowflake className="h-3 w-3" /> : <Thermometer className="h-3 w-3" />}
                      {CATEGORY_LABEL[p.category]} · {p.temp}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold tabular-nums text-ink">{rupiah(p.pricePerKg)}</p>
                <p className="text-sm tabular-nums text-muted">{kg(p.stockKg)}</p>
                <span
                  className={`w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                    paused ? 'bg-adat-soft text-adat' : p.stockKg > 0 ? 'bg-go-soft text-go' : 'bg-line text-muted'
                  }`}
                >
                  {paused ? 'Dijeda · Adat' : p.stockKg > 0 ? 'Tayang' : 'Habis'}
                </span>
                <button
                  onClick={() => removeProduct(p.id)}
                  aria-label={`Hapus ${p.name}`}
                  className="justify-self-end rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-adat-soft hover:text-adat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

const INPUT =
  'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20'

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-semibold text-ink">{text}</span>
      {children}
    </label>
  )
}
