import React, { useEffect, useState } from 'react'
import { MapPin, Snowflake, UserRound } from 'lucide-react'

import { Shell, SignInPrompt } from '../shared/jala/Shell'
import { AddressFields, TextField } from '../shared/jala/AddressFields'
import { initials } from '../shared/jala/Navbar'
import { updateProfile, useControls, useJala } from '../shared/jala/store'
import type { View } from '../shared/jala/store'
import { coldChainFor } from '../shared/jala/aceh'
import { rupiah } from '../shared/jala/format'

export const args = {
  adatDay: false,
  signedIn: true,
}

export const argTypes = {
  adatDay: { control: 'boolean' },
  signedIn: { control: 'boolean' },
}

type Props = Partial<typeof args> & { onNavigate?: (view: View) => void }

export default function ProfilAlamat(props: Props) {
  const { adatDay, signedIn, onNavigate } = { ...args, ...props }
  useControls({ adatDay, signedIn })
  const s = useJala()
  const u = s.user
  const [form, setForm] = useState({ name: '', phone: '', regency: 'Banda Aceh', district: '', detail: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (u) setForm({ name: u.name, phone: u.phone, regency: u.regency, district: u.district, detail: u.detail })
  }, [u])

  const dirty = !!u && (form.name !== u.name || form.phone !== u.phone || form.regency !== u.regency || form.district !== u.district || form.detail !== u.detail)
  const chain = coldChainFor(form.regency)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Nama lengkap wajib diisi.')
    if (form.phone.replace(/\D/g, '').length < 9) return setError('Nomor HP / WhatsApp belum lengkap.')
    if (!form.district.trim() || form.detail.trim().length < 8) return setError('Lengkapi kecamatan dan alamat lengkap.')
    setError(null)
    updateProfile({ name: form.name.trim(), phone: form.phone.trim(), regency: form.regency, district: form.district.trim(), detail: form.detail.trim() })
  }

  return (
    <Shell view="profile" onNavigate={onNavigate} className="bg-mist">
      {!u ? (
        <SignInPrompt icon={<UserRound className="h-7 w-7" />} title="Profil & Alamat" body="Masuk untuk mengatur alamat pengiriman utama Anda di seluruh Aceh." />
      ) : (
        <main className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_20rem]">
          <form onSubmit={save} className="min-w-0 rounded-xl bg-white p-5 sm:p-7" noValidate>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ocean text-lg font-bold text-white">{initials(form.name || u.name)}</span>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-ocean">Profil & Alamat Saya</h1>
                <p className="truncate text-sm text-muted">{u.email}</p>
              </div>
            </div>

            <h2 className="mt-8 text-sm font-bold text-ink">Data diri</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TextField label="Nama lengkap" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} autoComplete="name" />
              <TextField label="Nomor HP / WhatsApp" type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} autoComplete="tel" />
            </div>

            <h2 className="mt-8 text-sm font-bold text-ink">Alamat pengiriman utama</h2>
            <p className="text-xs text-muted">Dipakai otomatis saat checkout. Anda tetap bisa mengirim ke alamat lain per pesanan.</p>
            <div className="mt-3">
              <AddressFields value={form} onChange={(a) => setForm((f) => ({ ...f, ...a }))} />
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-adat">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
              {dirty && <span className="text-xs text-muted">Ada perubahan yang belum disimpan</span>}
              <button
                disabled={!dirty}
                className="rounded-lg bg-coral px-6 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-xl bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <MapPin className="h-4 w-4 text-coral" /> Pratinjau label kiriman
              </p>
              <div className="mt-3 rounded-lg border border-dashed border-line p-3 text-sm">
                <p className="font-semibold text-ink">
                  {form.name || '—'} · {form.phone || '—'}
                </p>
                <p className="mt-1 text-muted">{form.detail || 'Alamat lengkap belum diisi'}</p>
                <p className="text-muted">
                  Kec. {form.district || '—'}, {form.regency}, Aceh
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <Snowflake className="h-4 w-4 text-frost" /> Estimasi rantai dingin
              </p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ocean">{rupiah(chain.fee)}</p>
              <p className="text-xs text-muted">per toko, ke {form.regency}</p>
              <p className="mt-3 text-sm text-ink">{chain.method}</p>
              <p className="text-xs text-muted">{chain.eta}</p>
            </div>
          </aside>
        </main>
      )}
    </Shell>
  )
}
