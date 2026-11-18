import React, { useEffect, useState } from 'react'

import Marketplace from '../4P8onrt99bWKBDQEGKzorS.frame'
import PesananSaya from '../xoXWeG8hJQv9NnvAmusjpx.frame'
import ProfilAlamat from '../iMyZEjZT9eNFcbNu3JfEFw.frame'
import SellerCenter from '../7L483XaUtZDwQV2Rs6Ct2y.frame'
import PanelAdminAdat from '../ecMrc2FGCZdxhpoGnHLyam.frame'
import type { View } from '../shared/jala/store'

const MARKETPLACE = '4P8onrt99bWKBDQEGKzorS'
const ORDERS = 'xoXWeG8hJQv9NnvAmusjpx'
const PROFILE = 'iMyZEjZT9eNFcbNu3JfEFw'
const SELLER_CENTER = '7L483XaUtZDwQV2Rs6Ct2y'
const ADMIN = 'ecMrc2FGCZdxhpoGnHLyam'

const FRAME_OF: Record<View, string> = {
  buyer: MARKETPLACE,
  orders: ORDERS,
  profile: PROFILE,
  seller: SELLER_CENTER,
  admin: ADMIN,
}

/** The size every frame draws at, unless one exports its own. */
export const viewport = 'web'

export const args = {
  adatDay: false,
  signedIn: false,
}

export const argTypes = {
  adatDay: { control: 'boolean' },
  signedIn: { control: 'boolean' },
}

export const folders = [
  { id: 'belanja', name: 'Belanja', frames: [MARKETPLACE, ORDERS, PROFILE] },
  { id: 'kelola', name: 'Kelola', frames: [SELLER_CENTER, ADMIN] },
]

type Props = Partial<typeof args> & { start?: string }

export default function JalaLaot(props: Props) {
  const { adatDay, signedIn, start } = { ...args, ...props }
  const [step, setStep] = useState(() => start ?? MARKETPLACE)
  const onNavigate = (view: View) => setStep(FRAME_OF[view] ?? MARKETPLACE)

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }, [step])

  const shared = { adatDay, signedIn, onNavigate }
  if (step === ORDERS) return <PesananSaya {...shared} />
  if (step === PROFILE) return <ProfilAlamat {...shared} />
  if (step === SELLER_CENTER) return <SellerCenter {...shared} />
  if (step === ADMIN) return <PanelAdminAdat adatDay={adatDay} onNavigate={onNavigate} />
  return <Marketplace {...shared} />
}
