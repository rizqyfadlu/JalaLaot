import React, { useId } from 'react'
import { REGENCIES, regencyOf } from './aceh'

export type AddressValue = { regency: string; district: string; detail: string }

/** Kabupaten/Kota se-Aceh, Kecamatan (dengan saran), dan Alamat Lengkap. */
export function AddressFields({ value, onChange }: { value: AddressValue; onChange: (v: AddressValue) => void }) {
  const listId = useId()
  const suggestions = regencyOf(value.regency).districts
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="text-xs font-semibold text-ink">Kabupaten/Kota</span>
        <select
          value={value.regency}
          onChange={(e) => onChange({ ...value, regency: e.target.value, district: '' })}
          className={inputCls}
        >
          {REGENCIES.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-ink">Kecamatan</span>
        <input
          list={listId}
          value={value.district}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
          placeholder={suggestions[0] ?? 'Nama kecamatan'}
          className={inputCls}
        />
        <datalist id={listId}>
          {suggestions.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs font-semibold text-ink">Alamat Lengkap</span>
        <textarea
          rows={2}
          value={value.detail}
          onChange={(e) => onChange({ ...value, detail: e.target.value })}
          placeholder="Gampong, nama jalan, nomor rumah, patokan (mis. depan meunasah)"
          className={`${inputCls} resize-none`}
        />
      </label>
    </div>
  )
}

export function TextField(props: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{props.label}</span>
      <input
        type={props.type ?? 'text'}
        value={props.value}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className={inputCls}
      />
    </label>
  )
}

export const inputCls =
  'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20'
