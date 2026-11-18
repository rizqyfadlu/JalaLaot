import React, { useState } from "react";
import { Store } from "lucide-react";

import { Shell } from "../shared/jala/Shell";
import { openAuth, useControls, useJala } from "../shared/jala/store";
import type { View } from "../shared/jala/store";
import { MY_STORE_ID, MY_STORE_NAME } from "../shared/jala/data";
import { rupiah } from "../shared/jala/format";
import { OrdersTable } from "./components/OrdersTable";
import { ProductsPanel } from "./components/ProductsPanel";

export const args = {
  adatDay: false,
  signedIn: true,
  tab: "orders",
};

export const argTypes = {
  adatDay: { control: "boolean" },
  signedIn: { control: "boolean" },
  tab: { control: "radio", options: ["orders", "products"] },
};

type Props = Partial<typeof args> & { onNavigate?: (view: View) => void };

export default function SellerCenter(props: Props) {
  const {
    adatDay,
    signedIn,
    tab: initialTab,
    onNavigate,
  } = { ...args, ...props };
  useControls({ adatDay, signedIn });
  const s = useJala();
  const [tab, setTab] = useState(initialTab);
  const [prevArg, setPrevArg] = useState(initialTab);
  if (prevArg !== initialTab) {
    setPrevArg(initialTab);
    setTab(initialTab);
  }

  // Tentukan identitas toko dinamis berdasarkan akun yang login
  const isDemoOwner = s.user?.email === "imol@laotjaya.id";
  const currentStoreId = isDemoOwner
    ? MY_STORE_ID
    : (s.user?.email ?? MY_STORE_ID);
  const currentStoreName = isDemoOwner
    ? MY_STORE_NAME
    : `Lapak ${s.user?.name ?? "Nelayan"}`;
  const currentStoreLoc = isDemoOwner
    ? "TPI Lampulo, Banda Aceh"
    : `${s.user?.district ? s.user.district + ", " : ""}${s.user?.regency ?? "Aceh"}`;

  const myOrders = s.orders.filter((o) => o.storeId === currentStoreId);
  const myProducts = s.products.filter((p) => p.storeId === currentStoreId);
  const sales = myOrders.reduce(
    (t, o) => t + o.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0),
    0,
  );
  const pending = myOrders.filter((o) => o.status !== "shipped").length;
  const activeCount = myProducts.filter(
    (p) => !(s.adatDay && p.category === "fresh") && p.stockKg > 0,
  ).length;

  return (
    <Shell view="seller" onNavigate={onNavigate} className="bg-mist">
      {!s.user ? (
        <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-soft text-teal">
            <Store className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-ink">
            Jual Hasil Tangkapan Anda di JalaLaot
          </h1>
          <p className="mt-2 text-sm text-muted">
            Setiap akun JalaLaot bisa membeli sekaligus menjual. Masuk untuk
            membuka Toko Saya dan menjangkau restoran serta rumah tangga di
            seluruh Aceh.
          </p>
          <button
            onClick={() => openAuth("login", "seller")}
            className="mt-6 rounded-lg bg-coral px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark"
          >
            Masuk ke Toko Saya
          </button>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal">
                Pusat Penjual · Toko Saya
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-ocean sm:text-3xl">
                {currentStoreName}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {currentStoreLoc} · dikelola oleh {s.user.name}
              </p>
            </div>
          </div>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
            <div className="rounded-xl bg-ocean p-5 text-white sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-white/70">
                Total Penjualan · minggu ini
              </p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums sm:text-4xl">
                {rupiah(sales)}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {myOrders.length} pesanan dari restoran & rumah tangga
              </p>
            </div>
            <Stat
              label="Produk Aktif"
              value={`${activeCount}`}
              meta={`dari ${myProducts.length} produk${s.adatDay ? " · ikan segar dijeda" : ""}`}
            />
            <Stat
              label="Pesanan Kotak Pendingin Tertunda"
              value={`${pending}`}
              meta="perlu dikonfirmasi, dikemas, atau dikirim"
              accent={pending > 0}
            />
          </section>

          <div className="mt-8 flex gap-6 border-b border-line" role="tablist">
            {(
              [
                ["orders", "Pesanan Masuk", pending],
                ["products", "Produk Saya", myProducts.length],
              ] as const
            ).map(([id, label, n]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors duration-150 ${
                  tab === id
                    ? "border-coral text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${tab === id ? "bg-coral text-white" : "bg-line text-muted"}`}
                >
                  {n}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "orders" ? (
              <OrdersTable orders={myOrders} />
            ) : (
              <ProductsPanel products={myProducts} adatDay={s.adatDay} />
            )}
          </div>
        </main>
      )}
    </Shell>
  );
}

function Stat({
  label,
  value,
  meta,
  accent,
}: {
  label: string;
  value: string;
  meta: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`mt-2 text-3xl font-extrabold tabular-nums ${accent ? "text-coral-dark" : "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted">{meta}</p>
    </div>
  );
}
