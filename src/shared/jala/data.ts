export type Category = 'fresh' | 'cold' | 'keumamah'

export type Product = {
  id: string
  name: string
  category: Category
  pricePerKg: number
  storeId: string
  storeName: string
  location: string
  temp: string
  tempKind: 'chilled' | 'frozen'
  timeLabel: string
  stockKg: number
  image: string
}

export type OrderStatus = 'new' | 'confirmed' | 'packed' | 'shipped'

export type Address = {
  recipient: string
  phone: string
  regency: string
  district: string
  detail: string
}

export type Order = {
  id: string
  storeId: string
  customer: string
  district: string
  items: { name: string; qty: number; pricePerKg: number }[]
  delivery: 'courier' | 'pickup'
  status: OrderStatus
  placedAt: string
  /** Hanya pada pesanan yang dibuat pembeli di aplikasi. */
  invoice?: string
  buyerEmail?: string
  storeName?: string
  address?: Address
  shippingFee?: number
  coldChain?: string
}

export const MY_STORE_ID = 'laot-jaya'
export const MY_STORE_NAME = 'KM Laot Jaya'

export const IMAGES = {
  tongkol: 'https://cdn.magicpatterns.com/patterns/generated-images/315060ba-3251-4f97-aa8b-096c12f92d83.jpg',
  tuna: 'https://cdn.magicpatterns.com/patterns/generated-images/07e14f4a-8a73-4a7a-b591-9ad1a56c9227.jpg',
  kakap: 'https://cdn.magicpatterns.com/patterns/generated-images/045664d2-1e69-4650-8fbe-fe0ce2a60bc7.jpg',
  keumamah: 'https://cdn.magicpatterns.com/patterns/generated-images/8664aba3-7688-4e9c-9632-befae6ccd6ab.jpg',
  udang: 'https://cdn.magicpatterns.com/patterns/generated-images/4ded83a2-2a44-4645-99ba-b042dd595498.jpg',
  cumi: 'https://cdn.magicpatterns.com/patterns/generated-images/9d6e1e97-8b05-481b-826f-277dadc48ee8.jpg',
  tunaLoin: 'https://cdn.magicpatterns.com/patterns/generated-images/a93b6f94-ab14-4190-b8c7-c5475970e533.jpg',
  bawal: 'https://cdn.magicpatterns.com/patterns/generated-images/0907894c-fdce-4339-a083-4a7e0bd3e7f5.jpg',
  hero: 'https://cdn.magicpatterns.com/patterns/generated-images/9da1f2ad-5fd9-412c-a710-be3ecfae3ea6.jpg',
}

export const CATEGORY_LABEL: Record<Category, string> = {
  fresh: 'Ikan Segar',
  cold: 'Stok Penyimpanan Beku',
  keumamah: 'Keumamah Vakum',
}

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Ikan Tongkol Segar',
    category: 'fresh',
    pricePerKg: 42000,
    storeId: MY_STORE_ID,
    storeName: MY_STORE_NAME,
    location: 'TPI Lampulo, Banda Aceh',
    temp: 'Dingin 2°C',
    tempKind: 'chilled',
    timeLabel: 'Didaratkan 05:30 WIB',
    stockKg: 85,
    image: IMAGES.tongkol,
  },
  {
    id: 'p2',
    name: 'Tuna Sirip Kuning',
    category: 'fresh',
    pricePerKg: 95000,
    storeId: 'bintang-samudera',
    storeName: 'KM Bintang Samudera',
    location: 'TPI Lampulo, Banda Aceh',
    temp: 'Dingin 1°C',
    tempKind: 'chilled',
    timeLabel: 'Didaratkan 04:45 WIB',
    stockKg: 120,
    image: IMAGES.tuna,
  },
  {
    id: 'p3',
    name: 'Kakap Merah',
    category: 'fresh',
    pricePerKg: 110000,
    storeId: 'ujong-pancu',
    storeName: 'Nelayan Ujong Pancu',
    location: 'Peukan Bada, Aceh Besar',
    temp: 'Dingin 2°C',
    tempKind: 'chilled',
    timeLabel: 'Didaratkan 06:10 WIB',
    stockKg: 34,
    image: IMAGES.kakap,
  },
  {
    id: 'p4',
    name: 'Ikan Kayu Keumamah Vakum',
    category: 'keumamah',
    pricePerKg: 180000,
    storeId: 'mak-cut',
    storeName: 'UMKM Keumamah Mak Cut',
    location: 'Lhoknga, Aceh Besar',
    temp: 'Dingin 4°C',
    tempKind: 'chilled',
    timeLabel: 'Dikemas 12 Mei',
    stockKg: 18,
    image: IMAGES.keumamah,
  },
  {
    id: 'p5',
    name: 'Udang Windu Beku',
    category: 'cold',
    pricePerKg: 145000,
    storeId: 'cs-lampulo',
    storeName: 'Cold Storage Lampulo',
    location: 'PPS Lampulo, Banda Aceh',
    temp: 'Beku −18°C',
    tempKind: 'frozen',
    timeLabel: 'Dibekukan 13 Mei',
    stockKg: 60,
    image: IMAGES.udang,
  },
  {
    id: 'p6',
    name: 'Ikan Bawal Hitam',
    category: 'fresh',
    pricePerKg: 68000,
    storeId: MY_STORE_ID,
    storeName: MY_STORE_NAME,
    location: 'TPI Lampulo, Banda Aceh',
    temp: 'Dingin 2°C',
    tempKind: 'chilled',
    timeLabel: 'Didaratkan 05:50 WIB',
    stockKg: 42,
    image: IMAGES.bawal,
  },
  {
    id: 'p7',
    name: 'Cumi-Cumi Beku',
    category: 'cold',
    pricePerKg: 78000,
    storeId: 'cs-lampulo',
    storeName: 'Cold Storage Lampulo',
    location: 'PPS Lampulo, Banda Aceh',
    temp: 'Beku −18°C',
    tempKind: 'frozen',
    timeLabel: 'Dibekukan 11 Mei',
    stockKg: 75,
    image: IMAGES.cumi,
  },
  {
    id: 'p8',
    name: 'Tuna Loin Beku Vakum',
    category: 'cold',
    pricePerKg: 125000,
    storeId: MY_STORE_ID,
    storeName: MY_STORE_NAME,
    location: 'TPI Lampulo, Banda Aceh',
    temp: 'Beku −18°C',
    tempKind: 'frozen',
    timeLabel: 'Dibekukan 10 Mei',
    stockKg: 26,
    image: IMAGES.tunaLoin,
  },
  {
    id: 'p9',
    name: 'Keumamah Masak Siap Saji',
    category: 'keumamah',
    pricePerKg: 210000,
    storeId: MY_STORE_ID,
    storeName: MY_STORE_NAME,
    location: 'TPI Lampulo, Banda Aceh',
    temp: 'Dingin 4°C',
    tempKind: 'chilled',
    timeLabel: 'Dikemas 13 Mei',
    stockKg: 12,
    image: IMAGES.keumamah,
  },
]

export const SEED_ORDERS: Order[] = [
  {
    id: 'JL-24051',
    storeId: MY_STORE_ID,
    customer: 'Rumah Makan Aceh Rayeuk',
    district: 'Baiturrahman, Banda Aceh',
    items: [
      { name: 'Ikan Tongkol Segar', qty: 12, pricePerKg: 42000 },
      { name: 'Ikan Bawal Hitam', qty: 5, pricePerKg: 68000 },
    ],
    delivery: 'courier',
    status: 'new',
    placedAt: '07:12 WIB',
  },
  {
    id: 'JL-24047',
    storeId: MY_STORE_ID,
    customer: 'Cut Nyak Rahmah',
    district: 'Darussalam, Aceh Besar',
    items: [{ name: 'Keumamah Masak Siap Saji', qty: 1.5, pricePerKg: 210000 }],
    delivery: 'pickup',
    status: 'confirmed',
    placedAt: '06:40 WIB',
  },
  {
    id: 'JL-24039',
    storeId: MY_STORE_ID,
    customer: 'Kafe Pantai Ulee Lheue',
    district: 'Kota Sigli, Pidie',
    items: [{ name: 'Tuna Loin Beku Vakum', qty: 8, pricePerKg: 125000 }],
    delivery: 'courier',
    status: 'packed',
    placedAt: '05:58 WIB',
  },
  {
    id: 'JL-24022',
    storeId: MY_STORE_ID,
    customer: 'Hotel Hermes Palace',
    district: 'Banda Sakti, Lhokseumawe',
    items: [{ name: 'Ikan Tongkol Segar', qty: 20, pricePerKg: 42000 }],
    delivery: 'courier',
    status: 'shipped',
    placedAt: 'Kemarin',
  },
]

