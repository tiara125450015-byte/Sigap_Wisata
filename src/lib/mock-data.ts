import rajaAmpatAsset from "@/assets/raja-ampat.jpg.asset.json";
import kawahPutihAsset from "@/assets/kawah-putih.jpg.asset.json";

export type CrowdLevel = "sepi" | "sedang" | "padat" | "sangat_padat";

export type Destination = {
  id: string;
  name: string;
  city: string;
  province: string;
  image: string;
  description: string;
  ticketPrice: number;
  rating: number;
  crowd: { level: CrowdLevel; occupancy: number; capacity: number; updatedAt: string };
  weather: {
    condition: string;
    temp: number;
    warning?: { level: "info" | "watch" | "danger"; message: string };
    source: string;
  };
  facilities: { name: string; price: number; unit: string }[];
  menu: { name: string; price: number }[];
  tags: string[];
  operator: string;
  certified: boolean;
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1200&q=70`;

export const destinations: Destination[] = [
  {
    id: "borobudur",
    name: "Candi Borobudur",
    city: "Magelang",
    province: "Jawa Tengah",
    image: img("photo-1596402184320-417e7178b2cd"),
    description:
      "Candi Buddha terbesar di dunia, warisan budaya UNESCO dengan pemandangan matahari terbit yang legendaris.",
    ticketPrice: 50000,
    rating: 4.8,
    crowd: { level: "padat", occupancy: 3420, capacity: 4500, updatedAt: "2 menit lalu" },
    weather: {
      condition: "Berawan",
      temp: 27,
      warning: { level: "watch", message: "Potensi hujan lokal sore hari (BMKG SIDARMA)" },
      source: "BMKG SIDARMA-NOWCAST",
    },
    facilities: [
      { name: "Sewa Payung", price: 15000, unit: "/jam" },
      { name: "Sewa Sarung", price: 10000, unit: "/orang" },
      { name: "Locker", price: 20000, unit: "/hari" },
      { name: "Guide Resmi", price: 150000, unit: "/rombongan" },
    ],
    menu: [
      { name: "Nasi Gudeg", price: 25000 },
      { name: "Es Dawet", price: 10000 },
      { name: "Kopi Muntilan", price: 18000 },
    ],
    tags: ["budaya", "keluarga", "sunrise"],
    operator: "PT Taman Wisata Candi (BUMN)",
    certified: true,
  },
  {
    id: "labuan-bajo",
    name: "Pulau Padar - Labuan Bajo",
    city: "Manggarai Barat",
    province: "NTT",
    image: img("photo-1512100356356-de1b84283e18"),
    description:
      "Panorama tiga teluk berpasir putih, pink dan hitam. Salah satu Destinasi Super Prioritas.",
    ticketPrice: 150000,
    rating: 4.9,
    crowd: { level: "sedang", occupancy: 180, capacity: 400, updatedAt: "5 menit lalu" },
    weather: {
      condition: "Cerah Berawan",
      temp: 31,
      source: "BMKG INA-WIS",
    },
    facilities: [
      { name: "Speedboat Sharing", price: 350000, unit: "/orang" },
      { name: "Snorkeling Set", price: 75000, unit: "/set" },
      { name: "Life Jacket", price: 25000, unit: "/orang" },
    ],
    menu: [
      { name: "Ikan Bakar Kuah Asam", price: 65000 },
      { name: "Nasi Kolo Bambu", price: 35000 },
    ],
    tags: ["pantai", "island-hopping", "petualangan"],
    operator: "BOP Labuan Bajo Flores",
    certified: true,
  },
  {
    id: "bromo",
    name: "Gunung Bromo",
    city: "Probolinggo",
    province: "Jawa Timur",
    image: img("photo-1589308078059-be1415eab4c3"),
    description: "Kawah aktif dengan lautan pasir dan sunrise ikonik dari Penanjakan.",
    ticketPrice: 34000,
    rating: 4.7,
    crowd: { level: "sangat_padat", occupancy: 2850, capacity: 3000, updatedAt: "1 menit lalu" },
    weather: {
      condition: "Kabut Tebal",
      temp: 9,
      warning: { level: "danger", message: "Peringatan dini: jarak pandang <50m, jalur ditutup 04:00-06:00" },
      source: "BMKG SIDARMA-NOWCAST",
    },
    facilities: [
      { name: "Jeep 4x4", price: 850000, unit: "/jeep" },
      { name: "Sewa Kuda", price: 150000, unit: "/orang" },
      { name: "Masker + Jaket", price: 30000, unit: "/set" },
    ],
    menu: [
      { name: "Pop Mie Panas", price: 15000 },
      { name: "Kopi Tumpang", price: 12000 },
    ],
    tags: ["gunung", "sunrise", "petualangan"],
    operator: "Balai Besar TNBTS",
    certified: true,
  },
  {
    id: "tanah-lot",
    name: "Pura Tanah Lot",
    city: "Tabanan",
    province: "Bali",
    image: img("photo-1537996194471-e657df975ab4"),
    description: "Pura di atas bongkahan karang laut dengan siluet sunset paling difoto di Bali.",
    ticketPrice: 75000,
    rating: 4.6,
    crowd: { level: "padat", occupancy: 2100, capacity: 3500, updatedAt: "3 menit lalu" },
    weather: { condition: "Cerah", temp: 29, source: "BMKG INA-WIS" },
    facilities: [
      { name: "Parkir Mobil", price: 10000, unit: "/mobil" },
      { name: "Guide Lokal", price: 100000, unit: "/rombongan" },
    ],
    menu: [
      { name: "Nasi Campur Bali", price: 45000 },
      { name: "Es Kelapa Muda", price: 20000 },
    ],
    tags: ["budaya", "sunset", "pantai"],
    operator: "Desa Adat Beraban",
    certified: true,
  },
  {
    id: "raja-ampat",
    name: "Piaynemo - Raja Ampat",
    city: "Raja Ampat",
    province: "Papua Barat Daya",
    image: img("photo-1516091380769-6b0a03d24186"),
    description: "Gugusan karst hijau di atas laut biru — surga tersembunyi di ujung timur Nusantara.",
    ticketPrice: 500000,
    rating: 4.95,
    crowd: { level: "sepi", occupancy: 42, capacity: 200, updatedAt: "8 menit lalu" },
    weather: { condition: "Cerah", temp: 30, source: "BMKG INA-WIS" },
    facilities: [
      { name: "Boat Charter", price: 3500000, unit: "/hari" },
      { name: "Snorkeling Guide", price: 200000, unit: "/trip" },
    ],
    menu: [
      { name: "Ikan Kuah Kuning", price: 70000 },
      { name: "Papeda", price: 30000 },
    ],
    tags: ["laut", "premium", "petualangan"],
    operator: "Dinas Pariwisata Raja Ampat",
    certified: true,
  },
  {
    id: "kawah-putih",
    name: "Kawah Putih Ciwidey",
    city: "Bandung",
    province: "Jawa Barat",
    image: img("photo-1601370552761-3f47ee2f8c67"),
    description: "Danau kawah belerang berwarna toska di kaki Gunung Patuha.",
    ticketPrice: 28000,
    rating: 4.4,
    crowd: { level: "sedang", occupancy: 640, capacity: 1500, updatedAt: "4 menit lalu" },
    weather: {
      condition: "Kabut Ringan",
      temp: 16,
      warning: { level: "info", message: "Gunakan masker: kadar belerang moderat" },
      source: "BMKG SIDARMA-NOWCAST",
    },
    facilities: [
      { name: "Ontang-Anting Shuttle", price: 20000, unit: "/orang" },
      { name: "Sewa Masker", price: 5000, unit: "/orang" },
    ],
    menu: [
      { name: "Sate Kelinci", price: 30000 },
      { name: "Bandrek Panas", price: 12000 },
    ],
    tags: ["alam", "keluarga", "instagramable"],
    operator: "Perum Perhutani",
    certified: true,
  },
];

export const crowdMeta: Record<
  CrowdLevel,
  { label: string; color: string; ring: string; text: string }
> = {
  sepi: { label: "Sepi", color: "bg-success/15", ring: "ring-success/30", text: "text-success" },
  sedang: { label: "Sedang", color: "bg-brand-accent/15", ring: "ring-brand-accent/30", text: "text-brand-accent" },
  padat: { label: "Padat", color: "bg-warn/20", ring: "ring-warn/40", text: "text-warn" },
  sangat_padat: {
    label: "Sangat Padat",
    color: "bg-destructive/15",
    ring: "ring-destructive/40",
    text: "text-destructive",
  },
};

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
