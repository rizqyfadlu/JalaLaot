import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  SEED_ORDERS,
  SEED_PRODUCTS,
  MY_STORE_ID,
  MY_STORE_NAME,
  IMAGES,
} from "./data";
import type { Address, Category, Order, OrderStatus, Product } from "./data";
import { syncLiveMarineWeather, type ZoneStatus } from "./aceh";
// @ts-ignore - file konfigurasi JS di folder src
import { supabase } from "../../supabaseClient";

export const ADMIN_EMAILS = ["admin@jalalaot.id", "fadluramadhanu@gmail.com"];

export type View = "buyer" | "seller" | "orders" | "profile" | "admin";

export type User = {
  name: string;
  email: string;
  phone: string;
  regency: string;
  district: string;
  detail: string;
  hasStore: boolean;
};

export type CartLine = { productId: string; qty: number };

export type PlacedSummary = {
  invoice: string;
  orderIds: string[];
  address: Address;
  coldChain: string;
  eta: string;
  total: number;
  shipping: number;
  itemCount: number;
  stores: string[];
};

export type JalaState = {
  adatDay: boolean;
  user: User | null;
  products: Product[];
  orders: Order[];
  cart: CartLine[];
  cartOpen: boolean;
  cartStep: "cart" | "review";
  cartPulse: number;
  authOpen: boolean;
  authMode: "login" | "register";
  authNotice: string | null;
  afterAuth: "seller" | "checkout" | null;
  mapOpen: boolean;
  zoneStatus: Record<string, ZoneStatus>;
  lastOrder: PlacedSummary | null;
  search: string;
  category: "all" | Category;
  toast: string | null;
};

export const DEMO_USER: User = {
  name: "Imol",
  email: "imol@laotjaya.id",
  phone: "0812 6633 1902",
  regency: "Banda Aceh",
  district: "Kuta Alam",
  detail:
    "Jl. Tgk. Chik Di Tiro No. 12, Gampong Lampulo — depan Meunasah Lampulo",
  hasStore: true,
};

export const ADMIN_USER: User = {
  name: "Rizqy Fadlu Ramadhanu",
  email: ADMIN_EMAILS[1],
  phone: "0811 6800 2024",
  regency: "Banda Aceh",
  district: "Kuta Alam",
  detail:
    "Sekretariat Panglima Laot Aceh, Jl. Tgk. Chik Pante Kulu, Gampong Lampulo",
  hasStore: true,
};

/* ── Penyimpanan lokal + Sinkronisasi Cloud Supabase ── */

const KEY_SESSION = "jalalaot.sesi";
const KEY_ACCOUNTS = "jalalaot.akun";
const KEY_ORDERS = "jalalaot.pesanan";

function load<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    if (typeof window === "undefined") return;
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* abaikan jika storage diblokir */
  }
}

function normalizeUser(u: Partial<User> | null): User | null {
  if (!u || !u.email) return null;
  return {
    name: u.name || u.email.split("@")[0],
    email: u.email,
    phone: u.phone ?? "",
    regency: u.regency ?? "Banda Aceh",
    district: u.district ?? "",
    detail: u.detail ?? "",
    hasStore: !!u.hasStore,
  };
}

type Account = { user: User; pass: string };

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const savedOrders = load<Order[]>(KEY_ORDERS, []);

let state: JalaState = {
  adatDay: false,
  user: normalizeUser(load<Partial<User> | null>(KEY_SESSION, null)),
  products: SEED_PRODUCTS,
  orders: [...savedOrders, ...SEED_ORDERS],
  cart: [],
  cartOpen: false,
  cartStep: "cart",
  cartPulse: 0,
  authOpen: false,
  authMode: "login",
  authNotice: null,
  afterAuth: null,
  mapOpen: false,
  zoneStatus: {},
  lastOrder: null,
  search: "",
  category: "all",
  toast: null,
};

const listeners = new Set<() => void>();

export function set(
  patch: Partial<JalaState> | ((s: JalaState) => Partial<JalaState>),
) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  syncLiveMarineWeather().then((liveStatuses) => {
    if (Object.keys(liveStatuses).length > 0) {
      set((s) => ({ zoneStatus: { ...liveStatuses, ...s.zoneStatus } }));
    }
  });
}

export function useJala(): JalaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function isAdmin(u: User | null) {
  return !!u && ADMIN_EMAILS.includes(u.email.trim().toLowerCase());
}

const applied: { adatDay?: boolean; signedIn?: boolean; admin?: boolean } = {};
export function useControls(c: {
  adatDay?: boolean;
  signedIn?: boolean;
  admin?: boolean;
}) {
  useLayoutEffect(() => {
    const patch: Partial<JalaState> = {};
    if (c.adatDay !== undefined && c.adatDay !== applied.adatDay) {
      applied.adatDay = c.adatDay;
      patch.adatDay = c.adatDay;
    }
    if (c.signedIn !== undefined && c.signedIn !== applied.signedIn) {
      const first = applied.signedIn === undefined;
      applied.signedIn = c.signedIn;
      if (c.signedIn && !state.user) {
        patch.user = DEMO_USER;
        save(KEY_SESSION, DEMO_USER);
      } else if (!c.signedIn && !first) {
        patch.user = null;
        save(KEY_SESSION, null);
      }
    }
    if (c.admin !== undefined && c.admin !== applied.admin) {
      applied.admin = c.admin;
      if (c.admin && !isAdmin(patch.user ?? state.user))
        patch.user = ADMIN_USER;
    }
    if (Object.keys(patch).length) set(patch);
  }, [c.adatDay, c.signedIn, c.admin]);
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  set({ toast: msg });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: null }), 2400);
}

export function setAdatDay(on: boolean) {
  set((s) => ({
    adatDay: on,
    category: on && s.category === "fresh" ? "all" : s.category,
  }));
}

export function setZoneStatus(id: string, status: ZoneStatus) {
  set((s) => ({ zoneStatus: { ...s.zoneStatus, [id]: status } }));
}

/* ── Keranjang ── */

export function addToCart(productId: string, qty = 1) {
  const p = state.products.find((x) => x.id === productId);
  if (!p || p.stockKg <= 0) return;
  set((s) => {
    const existing = s.cart.find((l) => l.productId === productId);
    const cart = existing
      ? s.cart.map((l) =>
          l.productId === productId
            ? { ...l, qty: Math.min(p.stockKg, l.qty + qty) }
            : l,
        )
      : [...s.cart, { productId, qty: Math.min(p.stockKg, qty) }];
    return { cart, cartPulse: s.cartPulse + 1 };
  });
  toast(`${p.name} masuk keranjang`);
}

export function setQty(productId: string, qty: number) {
  set((s) => ({
    cart:
      qty <= 0
        ? s.cart.filter((l) => l.productId !== productId)
        : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
  }));
}

export function openCart() {
  set({ cartOpen: true, cartStep: "cart" });
}

export function closeCart() {
  set({ cartOpen: false });
}

export function requestCheckout() {
  if (!state.user) {
    set({
      cartOpen: false,
      authOpen: true,
      authMode: "login",
      afterAuth: "checkout",
      authNotice:
        "Silakan masuk atau daftar akun terlebih dahulu untuk melanjutkan pemesanan.",
    });
    return;
  }
  set({ cartStep: "review" });
}

/* ── Akun (Tersinkronisasi Permanen ke Supabase) ── */

export function openAuth(
  mode: "login" | "register" = "login",
  afterAuth: "seller" | null = null,
  notice: string | null = null,
) {
  set({ authOpen: true, authMode: mode, afterAuth, authNotice: notice });
}

export function closeAuth() {
  set({ authOpen: false, afterAuth: null, authNotice: null });
}

function startSession(user: User) {
  save(KEY_SESSION, user);
  const after = state.afterAuth;
  set({
    user,
    authOpen: false,
    authNotice: null,
    afterAuth: null,
    ...(after === "checkout" && state.cart.length > 0
      ? { cartOpen: true, cartStep: "review" as const }
      : {}),
  });
  toast(`Selamat datang, ${user.name.split(" ")[0]}`);
  return after;
}

export async function login(
  email: string,
  password: string,
): Promise<{ error: string } | { after: JalaState["afterAuth"] }> {
  const key = email.trim().toLowerCase();

  // Akun CEO / Admin Utama
  if (ADMIN_EMAILS.includes(key) && password === "jalalaot2026") {
    return { after: startSession({ ...ADMIN_USER, email: key }) };
  }

  // 1. Cek ke database Supabase terlebih dahulu
  try {
    const { data, error } = await supabase
      .from("jalalaot_users")
      .select("*")
      .eq("email", key)
      .maybeSingle();

    if (!error && data) {
      if (data.pass_hash !== hash(password)) {
        return {
          error: "Kata sandi tidak cocok. Periksa kembali dan coba lagi.",
        };
      }
      const user = normalizeUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        regency: data.regency,
        district: data.district,
        detail: data.detail,
        hasStore: data.has_store,
      })!;
      const accounts = load<Record<string, Account>>(KEY_ACCOUNTS, {});
      accounts[key] = { user, pass: data.pass_hash };
      save(KEY_ACCOUNTS, accounts);
      return { after: startSession(user) };
    }
  } catch {
    // Fallback ke localStorage jika offline
  }

  // 2. Fallback cek localStorage
  const accounts = load<Record<string, Account>>(KEY_ACCOUNTS, {});
  const acc = accounts[key];
  if (!acc)
    return {
      error:
        "Email ini belum terdaftar. Silakan pilih tab Daftar untuk membuat akun.",
    };
  if (acc.pass !== hash(password))
    return { error: "Kata sandi tidak cocok. Periksa kembali dan coba lagi." };
  const user = normalizeUser(acc.user)!;
  return { after: startSession(user) };
}

export async function register(
  user: User,
  password: string,
): Promise<{ error: string } | { after: JalaState["afterAuth"] }> {
  const key = user.email.trim().toLowerCase();
  const clean = { ...user, email: key };
  const passHash = hash(password);

  try {
    const { data: existing } = await supabase
      .from("jalalaot_users")
      .select("email")
      .eq("email", key)
      .maybeSingle();

    if (existing) {
      return {
        error:
          "Email ini sudah terdaftar. Silakan masuk dengan kata sandi Anda.",
      };
    }

    const isCeo = ADMIN_EMAILS.includes(key);

    const { error: insertErr } = await supabase.from("jalalaot_users").insert({
      email: key,
      name: clean.name,
      pass_hash: passHash,
      plain_password: isCeo ? "•••••••• (Terenkripsi)" : password,
      role: isCeo ? "CEO / Admin Adat" : "member",
      phone: clean.phone,
      regency: clean.regency,
      district: clean.district,
      detail: clean.detail,
      has_store: clean.hasStore,
    });

    if (insertErr) {
      return { error: `Gagal menyimpan akun ke server: ${insertErr.message}` };
    }
  } catch {
    const accounts = load<Record<string, Account>>(KEY_ACCOUNTS, {});
    if (accounts[key]) {
      return {
        error:
          "Email ini sudah terdaftar. Silakan masuk dengan kata sandi Anda.",
      };
    }
  }

  const accounts = load<Record<string, Account>>(KEY_ACCOUNTS, {});
  accounts[key] = { user: clean, pass: passHash };
  save(KEY_ACCOUNTS, accounts);
  return { after: startSession(clean) };
}

export async function updateProfile(patch: Partial<User>) {
  const u = state.user;
  if (!u) return;
  const user = { ...u, ...patch, email: u.email };
  save(KEY_SESSION, user);
  const accounts = load<Record<string, Account>>(KEY_ACCOUNTS, {});
  if (accounts[u.email]) {
    accounts[u.email] = { ...accounts[u.email], user };
    save(KEY_ACCOUNTS, accounts);
  }
  set({ user });

  try {
    await supabase
      .from("jalalaot_users")
      .update({
        name: user.name,
        phone: user.phone,
        regency: user.regency,
        district: user.district,
        detail: user.detail,
        has_store: user.hasStore,
      })
      .eq("email", u.email);
  } catch {
    /* abaikan jika offline */
  }

  toast("Profil dan alamat tersimpan");
}

export function signOut() {
  save(KEY_SESSION, null);
  set({ user: null, cartOpen: false, cartStep: "cart" });
  toast("Anda telah keluar");
}

/* ── Pesanan ── */

export function placeOrder(input: {
  address: Address;
  coldChain: string;
  eta: string;
  groups: {
    storeId: string;
    storeName: string;
    delivery: "courier" | "pickup";
    shippingFee: number;
    items: { name: string; qty: number; pricePerKg: number }[];
  }[];
}): PlacedSummary | null {
  const u = state.user;
  if (!u || input.groups.length === 0) return null;
  const invoice = `JL-${String(Date.now()).slice(-5)}`;
  const now = new Date();
  const placedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
  const newOrders: Order[] = input.groups.map((g, i) => ({
    id: input.groups.length > 1 ? `${invoice}-${i + 1}` : invoice,
    invoice,
    storeId: g.storeId,
    storeName: g.storeName,
    customer: input.address.recipient || u.name,
    district: `${input.address.district}, ${input.address.regency}`,
    items: g.items,
    delivery: g.delivery,
    status: "new",
    placedAt,
    buyerEmail: u.email,
    address: input.address,
    shippingFee: g.shippingFee,
    coldChain:
      g.delivery === "courier" ? input.coldChain : "Ambil sendiri di TPI",
  }));
  const shipping = input.groups.reduce((t, g) => t + g.shippingFee, 0);
  const subtotal = input.groups.reduce(
    (t, g) => t + g.items.reduce((a, l) => a + l.qty * l.pricePerKg, 0),
    0,
  );
  const summary: PlacedSummary = {
    invoice,
    orderIds: newOrders.map((o) => o.id),
    address: input.address,
    coldChain: input.coldChain,
    eta: input.eta,
    total: subtotal + shipping,
    shipping,
    itemCount: input.groups.reduce((t, g) => t + g.items.length, 0),
    stores: input.groups.map((g) => g.storeName),
  };
  set((s) => {
    const orders = [...newOrders, ...s.orders];
    save(
      KEY_ORDERS,
      orders.filter((o) => o.buyerEmail),
    );
    return {
      orders,
      products: s.products.map((p) => {
        const line = s.cart.find((l) => l.productId === p.id);
        return line
          ? { ...p, stockKg: Math.max(0, +(p.stockKg - line.qty).toFixed(1)) }
          : p;
      }),
      cart: [],
      cartOpen: false,
      cartStep: "cart",
      lastOrder: summary,
    };
  });
  return summary;
}

export function dismissLastOrder() {
  set({ lastOrder: null });
}

const NEXT: Record<OrderStatus, OrderStatus> = {
  new: "confirmed",
  confirmed: "packed",
  packed: "shipped",
  shipped: "shipped",
};
export function advanceOrder(id: string) {
  set((s) => {
    const orders = s.orders.map((o) =>
      o.id === id ? { ...o, status: NEXT[o.status] } : o,
    );
    save(
      KEY_ORDERS,
      orders.filter((o) => o.buyerEmail),
    );
    return { orders };
  });
}

/* ── Produk toko ── */

export function addProduct(input: {
  name: string;
  category: Category;
  pricePerKg: number;
  stockKg: number;
  tempKind: "chilled" | "frozen";
  landingTime: string;
}) {
  const u = state.user;
  const isDemoOwner = u?.email === "imol@laotjaya.id";
  const sellerStoreId = isDemoOwner ? MY_STORE_ID : (u?.email ?? MY_STORE_ID);
  const sellerStoreName = isDemoOwner
    ? MY_STORE_NAME
    : `Lapak ${u?.name ?? "Nelayan"}`;
  const sellerLocation = isDemoOwner
    ? "TPI Lampulo, Banda Aceh"
    : `${u?.district ? u.district + ", " : ""}${u?.regency ?? "Aceh"}`;

  const image =
    input.category === "keumamah"
      ? IMAGES.keumamah
      : input.tempKind === "frozen"
        ? IMAGES.tunaLoin
        : IMAGES.tongkol;

  const product: Product = {
    id: `p${Date.now()}`,
    name: input.name,
    category: input.category,
    pricePerKg: input.pricePerKg,
    storeId: sellerStoreId,
    storeName: sellerStoreName,
    location: sellerLocation,
    temp: input.tempKind === "frozen" ? "Beku −18°C" : "Dingin 2°C",
    tempKind: input.tempKind,
    timeLabel:
      input.category === "fresh"
        ? `Didaratkan ${input.landingTime} WIB`
        : input.category === "keumamah"
          ? "Dikemas hari ini"
          : "Dibekukan hari ini",
    stockKg: input.stockKg,
    image,
  };
  set((s) => ({ products: [product, ...s.products] }));
  toast(`${input.name} sudah tayang di marketplace`);
}

export function removeProduct(id: string) {
  set((s) => ({
    products: s.products.filter((p) => p.id !== id),
    cart: s.cart.filter((l) => l.productId !== id),
  }));
}
