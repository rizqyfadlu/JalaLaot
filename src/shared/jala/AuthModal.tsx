import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { closeAuth, login, register, set, useJala } from "./store";
import type { View } from "./store";
import { AddressFields, TextField } from "./AddressFields";
import { Logo } from "./Logo";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  password: "",
  regency: "Banda Aceh",
  district: "",
  detail: "",
  openStore: false,
};

export function AuthModal({
  onNavigate,
}: {
  onNavigate?: (view: View) => void;
}) {
  const s = useJala();
  const mode = s.authMode;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!s.authOpen) {
      setForm(EMPTY);
      setError(null);
      setLoading(false);
    }
  }, [s.authOpen]);

  const put =
    <K extends keyof typeof EMPTY>(k: K) =>
    (v: (typeof EMPTY)[K]) =>
      setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Masukkan alamat email yang valid.");
    if (form.password.length < 6)
      return setError("Kata sandi minimal 6 karakter.");

    if (mode === "register") {
      if (!form.name.trim()) return setError("Nama lengkap wajib diisi.");
      if (form.phone.replace(/\D/g, "").length < 9)
        return setError("Nomor HP / WhatsApp belum lengkap.");
      if (!form.district.trim() || form.detail.trim().length < 8)
        return setError("Lengkapi kecamatan dan alamat lengkap Anda.");
    }

    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await login(email, form.password)
          : await register(
              {
                name: form.name.trim(),
                email,
                phone: form.phone.trim(),
                regency: form.regency,
                district: form.district.trim(),
                detail: form.detail.trim(),
                hasStore: form.openStore,
              },
              form.password,
            );

      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (result.after === "seller" || (mode === "register" && form.openStore))
        onNavigate?.("seller");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "login" | "register") => {
    setError(null);
    set({ authMode: m });
  };

  const subtitle =
    s.afterAuth === "seller"
      ? "Masuk untuk membuka Toko Saya dan mulai menjual hasil tangkapan."
      : mode === "login"
        ? "Belanja langsung dari nelayan di seluruh pesisir Aceh."
        : "Satu akun untuk berbelanja hasil laut sekaligus membuka lapak nelayan.";

  return (
    <AnimatePresence>
      {s.authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 bg-ocean-deep/60"
            onClick={closeAuth}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className={`relative max-h-full w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8 ${mode === "register" ? "max-w-lg" : "max-w-md"}`}
          >
            <button
              onClick={closeAuth}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-mist"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
            <Logo tone="dark" />
            <h2 className="mt-5 text-2xl font-bold text-ink">
              {mode === "login" ? "Masuk ke JalaLaot" : "Buat Akun Baru"}
            </h2>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>

            {s.authNotice && (
              <div
                role="status"
                className="mt-4 flex gap-2.5 rounded-lg border border-coral/30 bg-coral/5 p-3 text-sm text-ink"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-coral-dark" />
                {s.authNotice}
              </div>
            )}

            <div
              className="mt-5 grid grid-cols-2 rounded-lg bg-mist p-1 text-sm font-semibold"
              role="tablist"
            >
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`rounded-md py-2 transition-colors duration-150 ${mode === m ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {m === "login" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3.5" noValidate>
              {mode === "register" && (
                <TextField
                  label="Nama lengkap"
                  value={form.name}
                  onChange={put("name")}
                  placeholder="Cut Nyak Rahmah"
                  autoComplete="name"
                />
              )}
              <div
                className={
                  mode === "register"
                    ? "grid gap-3.5 sm:grid-cols-2"
                    : "space-y-3.5"
                }
              >
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={put("email")}
                  placeholder="nama@email.com"
                  autoComplete="email"
                />
                {mode === "register" && (
                  <TextField
                    label="Nomor HP / WhatsApp"
                    type="tel"
                    value={form.phone}
                    onChange={put("phone")}
                    placeholder="0812 xxxx xxxx"
                    autoComplete="tel"
                  />
                )}
              </div>

              {mode === "register" && (
                <fieldset className="space-y-2 border-t border-line pt-4">
                  <legend className="sr-only">Alamat</legend>
                  <p className="text-sm font-semibold text-ink">Alamat utama</p>
                  <AddressFields
                    value={{
                      regency: form.regency,
                      district: form.district,
                      detail: form.detail,
                    }}
                    onChange={(a) => setForm((f) => ({ ...f, ...a }))}
                  />
                </fieldset>
              )}

              <TextField
                label="Kata sandi"
                type="password"
                value={form.password}
                onChange={put("password")}
                placeholder="Minimal 6 karakter"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />

              {mode === "register" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-teal-soft p-3">
                  <input
                    type="checkbox"
                    checked={form.openStore}
                    onChange={(e) => put("openStore")(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-teal"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-ink">
                      Langsung buka Lapak Nelayan / UMKM
                    </span>
                    <span className="block text-xs text-muted">
                      Opsional — Toko Saya bisa dibuka kapan saja dari menu
                      profil.
                    </span>
                  </span>
                </label>
              )}

              {error && (
                <p role="alert" className="text-sm font-medium text-adat">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                className="w-full rounded-lg bg-coral py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-coral-dark disabled:opacity-60"
              >
                {loading
                  ? "Memproses..."
                  : mode === "login"
                    ? "Masuk"
                    : "Buat Akun"}
              </button>
              <p className="text-center text-xs text-muted">
                {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
                <button
                  type="button"
                  onClick={() =>
                    switchMode(mode === "login" ? "register" : "login")
                  }
                  className="font-semibold text-teal hover:underline"
                >
                  {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
                </button>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
