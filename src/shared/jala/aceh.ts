/** Kabupaten/Kota se-Aceh, jaraknya dari TPI Lampulo (Banda Aceh) dan cara rantai dingin menjangkaunya. */
export type Regency = {
  name: string;
  km: number;
  island?: boolean;
  districts: string[];
};

export const REGENCIES: Regency[] = [
  {
    name: "Banda Aceh",
    km: 0,
    districts: [
      "Baiturrahman",
      "Kuta Alam",
      "Meuraxa",
      "Syiah Kuala",
      "Lueng Bata",
      "Kuta Raja",
      "Banda Raya",
      "Jaya Baru",
      "Ulee Kareng",
    ],
  },
  {
    name: "Aceh Besar",
    km: 20,
    districts: [
      "Darussalam",
      "Ingin Jaya",
      "Peukan Bada",
      "Lhoknga",
      "Krueng Barona Jaya",
      "Baitussalam",
      "Mesjid Raya",
      "Darul Imarah",
    ],
  },
  {
    name: "Sabang",
    km: 35,
    island: true,
    districts: ["Sukakarya", "Sukajaya"],
  },
  {
    name: "Pidie",
    km: 110,
    districts: [
      "Kota Sigli",
      "Pidie",
      "Indra Jaya",
      "Kembang Tanjong",
      "Simpang Tiga",
    ],
  },
  {
    name: "Pidie Jaya",
    km: 150,
    districts: ["Meureudu", "Ulim", "Trienggadeng", "Bandar Baru"],
  },
  {
    name: "Bireuen",
    km: 215,
    districts: ["Kota Juang", "Jeumpa", "Peusangan", "Samalanga", "Jangka"],
  },
  {
    name: "Lhokseumawe",
    km: 275,
    districts: ["Banda Sakti", "Muara Dua", "Muara Satu", "Blang Mangat"],
  },
  {
    name: "Aceh Utara",
    km: 290,
    districts: [
      "Lhoksukon",
      "Dewantara",
      "Syamtalira Bayu",
      "Tanah Jambo Aye",
      "Seunuddon",
    ],
  },
  {
    name: "Aceh Timur",
    km: 360,
    districts: ["Idi Rayeuk", "Peureulak", "Julok", "Darul Aman"],
  },
  {
    name: "Langsa",
    km: 430,
    districts: ["Langsa Kota", "Langsa Barat", "Langsa Timur", "Langsa Baro"],
  },
  {
    name: "Aceh Tamiang",
    km: 460,
    districts: ["Karang Baru", "Kejuruan Muda", "Manyak Payed", "Seruway"],
  },
  {
    name: "Aceh Jaya",
    km: 150,
    districts: ["Calang", "Krueng Sabee", "Setia Bakti", "Jaya"],
  },
  {
    name: "Meulaboh / Aceh Barat",
    km: 245,
    districts: ["Johan Pahlawan", "Meureubo", "Samatiga", "Kaway XVI"],
  },
  {
    name: "Nagan Raya",
    km: 285,
    districts: ["Suka Makmue", "Kuala", "Darul Makmur", "Seunagan"],
  },
  {
    name: "Aceh Selatan",
    km: 420,
    districts: ["Tapaktuan", "Samadua", "Labuhan Haji", "Kluet Utara"],
  },
  {
    name: "Simeulue",
    km: 520,
    island: true,
    districts: ["Simeulue Timur", "Teupah Selatan", "Simeulue Barat", "Alafan"],
  },
  {
    name: "Singkil",
    km: 640,
    districts: ["Singkil", "Gunung Meriah", "Singkil Utara", "Kuala Baru"],
  },
  {
    name: "Subulussalam",
    km: 590,
    districts: ["Simpang Kiri", "Penanggalan", "Rundeng", "Sultan Daulat"],
  },
  {
    name: "Aceh Tengah",
    km: 320,
    districts: ["Lut Tawar", "Bebesen", "Kebayakan", "Pegasing"],
  },
  {
    name: "Bener Meriah",
    km: 290,
    districts: ["Bukit", "Wih Pesam", "Bandar", "Permata"],
  },
  {
    name: "Gayo Lues",
    km: 420,
    districts: ["Blangkejeren", "Kutapanjang", "Rikit Gaib", "Terangun"],
  },
  {
    name: "Aceh Tenggara",
    km: 520,
    districts: ["Babussalam", "Lawe Alas", "Bambel", "Badar"],
  },
];

export function regencyOf(name: string): Regency {
  return REGENCIES.find((r) => r.name === name) ?? REGENCIES[0];
}

export type ColdChain = { fee: number; method: string; eta: string };

/** Ongkos kirim rantai dingin per toko, naik mengikuti jarak dari TPI Lampulo. */
export function coldChainFor(regencyName: string): ColdChain {
  const r = regencyOf(regencyName);
  const base = Math.max(15000, Math.round((12000 + r.km * 230) / 1000) * 1000);
  if (r.island) {
    return {
      fee: base + 20000,
      method: "Kapal Ferry + Kotak Styrofoam Es Serpih",
      eta: r.km < 100 ? "Tiba hari ini, 4–6 jam" : "Tiba 1–2 hari",
    };
  }
  if (r.km <= 25)
    return {
      fee: base,
      method: "Motor Boks Pendingin 0–4°C",
      eta: "Tiba ≤ 2 jam",
    };
  if (r.km <= 160)
    return {
      fee: base,
      method: "Mobil Berpendingin (Reefer) 0–4°C",
      eta: "Tiba hari ini, 3–5 jam",
    };
  if (r.km <= 330)
    return { fee: base, method: "Truk Reefer 0–4°C", eta: "Tiba 6–10 jam" };
  return {
    fee: base,
    method: "Truk Reefer + Es Kering −18°C",
    eta: "Tiba 1–2 hari",
  };
}

/** Ambil langsung di TPI hanya masuk akal untuk pembeli di sekitar pelabuhan. */
export function pickupAllowed(regencyName: string) {
  return regencyOf(regencyName).km <= 25;
}

export type ZoneStatus = "aman" | "waspada" | "bahaya";

export type Zone = {
  id: string;
  name: string;
  area: string;
  lhok: string;
  fish: string[];
  wave: string;
  weather: string;
  wind: string;
  status: ZoneStatus;
  note: string;
  /** Posisi pada peta skematis (viewBox 0 0 400 440). */
  x: number;
  y: number;
};

export const ZONES: Zone[] = [
  {
    id: "lampulo",
    name: "Perairan Lampulo",
    area: "Banda Aceh",
    lhok: "Panglima Laot Lhok Lampulo",
    fish: ["Tongkol", "Tuna Sirip Kuning", "Cakalang"],
    wave: "0,5 – 1,0 m",
    weather: "Cerah berawan",
    wind: "8–12 knot, barat laut",
    status: "aman",
    note: "Laut tenang. Kapal wajib kembali sebelum magrib sesuai kesepakatan lhok.",
    x: 66,
    y: 44,
  },
  {
    id: "ulee-lheue",
    name: "Perairan Ulee Lheue",
    area: "Banda Aceh",
    lhok: "Panglima Laot Lhok Ulee Lheue",
    fish: ["Kakap Merah", "Kerapu", "Bawal Hitam"],
    wave: "0,5 – 1,25 m",
    weather: "Cerah",
    wind: "10–14 knot, barat",
    status: "aman",
    note: "Dilarang memakai pukat harimau dan bahan peledak di seluruh wilayah lhok.",
    x: 38,
    y: 56,
  },
  {
    id: "lhoknga",
    name: "Perairan Lhoknga",
    area: "Aceh Besar",
    lhok: "Panglima Laot Lhok Lhoknga",
    fish: ["Tuna", "Lemuru", "Layang"],
    wave: "1,25 – 2,0 m",
    weather: "Berawan, angin kencang",
    wind: "16–20 knot, barat daya",
    status: "waspada",
    note: "Gelombang sedang dari Samudra Hindia. Hanya kapal di atas 10 GT yang dianjurkan melaut.",
    x: 30,
    y: 82,
  },
  {
    id: "sabang",
    name: "Sabang / Pulau Weh",
    area: "Kota Sabang",
    lhok: "Panglima Laot Lhok Sabang",
    fish: ["Kerapu", "Cakalang", "Tuna"],
    wave: "1,0 – 1,5 m",
    weather: "Cerah",
    wind: "12–15 knot, utara",
    status: "waspada",
    note: "Zona inti Taman Wisata Perairan Pulau Weh tertutup untuk penangkapan. Melaut di luar zona inti.",
    x: 80,
    y: 18,
  },
  {
    id: "meulaboh",
    name: "Perairan Meulaboh",
    area: "Aceh Barat",
    lhok: "Panglima Laot Lhok Meulaboh",
    fish: ["Tongkol", "Udang Windu", "Cumi-cumi"],
    wave: "2,0 – 2,5 m",
    weather: "Hujan ringan",
    wind: "20–25 knot, barat daya",
    status: "bahaya",
    note: "Gelombang tinggi. Panglima Laot Lhok Meulaboh mengimbau seluruh nelayan tidak melaut hari ini.",
    x: 118,
    y: 222,
  },
  {
    id: "malaka",
    name: "Selat Malaka / Lhokseumawe",
    area: "Lhokseumawe & Aceh Utara",
    lhok: "Panglima Laot Lhok Lhokseumawe",
    fish: ["Udang", "Cumi-cumi", "Kembung", "Tenggiri"],
    wave: "0,5 – 1,0 m",
    weather: "Cerah berawan",
    wind: "6–10 knot, timur laut",
    status: "aman",
    note: "Jalur pelayaran kapal besar — nyalakan lampu navigasi dan jaga jarak dari alur kapal niaga.",
    x: 272,
    y: 84,
  },
];

export const ZONE_STATUS_LABEL: Record<ZoneStatus | "pantang", string> = {
  aman: "Aman melaut",
  waspada: "Waspada",
  bahaya: "Dilarang melaut",
  pantang: "Pantang melaut (Hukom Adat)",
};

// Koordinat GPS asli tiap perairan Aceh untuk penarikan data satelit Open-Meteo
export const ZONE_COORDS: Record<string, { lat: number; lon: number }> = {
  lampulo: { lat: 5.59, lon: 95.32 },
  "ulee-lheue": { lat: 5.56, lon: 95.28 },
  lhoknga: { lat: 5.46, lon: 95.22 },
  sabang: { lat: 5.9, lon: 95.32 },
  meulaboh: { lat: 4.12, lon: 96.11 },
  malaka: { lat: 5.2, lon: 97.15 },
};

function interpretWeather(code: number): string {
  if (code === 0) return "Cerah";
  if (code <= 3) return "Cerah berawan";
  if (code <= 48) return "Berkabut";
  if (code <= 67) return "Hujan ringan";
  if (code <= 82) return "Hujan deras";
  return "Badai petir";
}

/** Tarik data gelombang & angin real-time dari satelit Open-Meteo (Gratis, tanpa API Key) */
export async function syncLiveMarineWeather(): Promise<
  Record<string, ZoneStatus>
> {
  const autoStatuses: Record<string, ZoneStatus> = {};

  await Promise.all(
    ZONES.map(async (z) => {
      const c = ZONE_COORDS[z.id];
      if (!c) return;
      try {
        const [marineRes, weatherRes] = await Promise.all([
          fetch(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${c.lat}&longitude=${c.lon}&current=wave_height`,
          ),
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=weather_code,wind_speed_10m&wind_speed_unit=kn`,
          ),
        ]);
        const marine = await marineRes.json();
        const weather = await weatherRes.json();

        const waveM: number = marine?.current?.wave_height ?? 0.8;
        const windKn: number = Math.round(
          weather?.current?.wind_speed_10m ?? 10,
        );
        const wCode: number = weather?.current?.weather_code ?? 1;

        // Perbarui teks gelombang, angin, dan cuaca langsung dari satelit
        z.wave = `${Math.max(0.2, +(waveM - 0.15).toFixed(1))} – ${(waveM + 0.25).toFixed(1)} m`;
        z.wind = `${Math.max(2, windKn - 2)}–${windKn + 2} knot`;
        z.weather = interpretWeather(wCode);

        // Aturan otomatis keselamatan melaut
        if (waveM >= 2.0 || windKn >= 22 || wCode >= 95) {
          z.status = "bahaya";
          autoStatuses[z.id] = "bahaya";
        } else if (waveM >= 1.25 || windKn >= 15 || wCode >= 61) {
          z.status = "waspada";
          autoStatuses[z.id] = "waspada";
        } else {
          z.status = "aman";
          autoStatuses[z.id] = "aman";
        }
      } catch {
        // Jika offline, tetap gunakan data cadangan bawaan
      }
    }),
  );

  return autoStatuses;
}
