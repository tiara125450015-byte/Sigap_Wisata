import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { destinations, formatIDR, crowdMeta, type CrowdLevel } from "@/lib/mock-data";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  CloudSun,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Ticket,
  Trash2,
  UtensilsCrossed,
  Wallet,
  Wifi,
} from "lucide-react";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "MitraPoin — Konsol Pengelola Destinasi" },
      {
        name: "description",
        content:
          "MitraPoin: konsol operasional pengelola destinasi wisata. Kelola tiket, kapasitas, pendapatan, dan booking realtime — tersinkron ke jaringan Sigap Wisata.",
      },
      { property: "og:title", content: "MitraPoin — Konsol Pengelola Destinasi" },
      {
        property: "og:description",
        content:
          "Kelola harga, fasilitas, kepadatan, pendapatan, dan booking wisatawan dalam satu konsol operator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MitraPoinConsole,
});

type FacilityRow = { name: string; price: number; unit: string };
type MenuRow = { name: string; price: number };
type BookingRow = {
  code: string;
  guest: string;
  pax: number;
  channel: "Aplikasi" | "Loket" | "Mitra OTA";
  slot: string;
  amount: number;
  status: "paid" | "pending" | "refund";
  paidAt: string;
};
type OperatorData = {
  destinationId: string;
  ticketPrice: number;
  capacity: number;
  occupancy: number;
  crowd: CrowdLevel;
  weatherNote: string;
  facilities: FacilityRow[];
  menu: MenuRow[];
  bookings: BookingRow[];
  updatedAt: string;
  synced: boolean;
};

const KEY = "mitrapoin.v1";

function loadAll(): Record<string, OperatorData> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function saveAll(data: Record<string, OperatorData>) {
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

function deriveCrowd(occ: number, cap: number): CrowdLevel {
  const r = cap ? occ / cap : 0;
  if (r >= 0.9) return "sangat_padat";
  if (r >= 0.7) return "padat";
  if (r >= 0.35) return "sedang";
  return "sepi";
}

function seedBookings(destId: string, ticket: number, occ: number): BookingRow[] {
  const names = [
    "Rani Pratiwi",
    "Bagas Wicaksono",
    "Kadek Ayu",
    "M. Fajar",
    "Siti Aminah",
    "Yohanes Tumbelaka",
    "Nabila Rahma",
    "Reza Alfarisi",
  ];
  const channels: BookingRow["channel"][] = ["Aplikasi", "Loket", "Mitra OTA"];
  const rng = (s: string) => {
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return () => {
      h = (h * 1664525 + 1013904223) >>> 0;
      return h / 0xffffffff;
    };
  };
  const r = rng(destId);
  const count = 8;
  const list: BookingRow[] = [];
  for (let i = 0; i < count; i++) {
    const pax = 1 + Math.floor(r() * 5);
    const s = r();
    const status: BookingRow["status"] = s < 0.72 ? "paid" : s < 0.94 ? "pending" : "refund";
    const hour = 6 + Math.floor(r() * 12);
    list.push({
      code: `MP-${destId.slice(0, 3).toUpperCase()}-${(1000 + Math.floor(r() * 8999))}`,
      guest: names[Math.floor(r() * names.length)],
      pax,
      channel: channels[Math.floor(r() * channels.length)],
      slot: `${String(hour).padStart(2, "0")}:00`,
      amount: pax * ticket,
      status,
      paidAt: status === "paid" ? `${Math.floor(r() * 55) + 5} mnt lalu` : status === "pending" ? "menunggu" : "dikembalikan",
    });
  }
  // scale volume roughly with occupancy
  const factor = Math.max(1, Math.round(occ / 40));
  return list.slice(0, Math.min(count, Math.max(4, factor)));
}

function MitraPoinConsole() {
  const router = useRouter();
  const [all, setAll] = useState<Record<string, OperatorData>>({});
  const [selectedId, setSelectedId] = useState<string>(destinations[0].id);
  const [tab, setTab] = useState<"ringkasan" | "booking" | "harga" | "fasilitas">("ringkasan");

  useEffect(() => {
    setAll(loadAll());
  }, []);

  const dest = useMemo(
    () => destinations.find((d) => d.id === selectedId)!,
    [selectedId],
  );

  const data: OperatorData = useMemo(() => {
    const existing = all[selectedId];
    if (existing) return { ...existing, bookings: existing.bookings ?? seedBookings(dest.id, existing.ticketPrice, existing.occupancy) };
    return {
      destinationId: dest.id,
      ticketPrice: dest.ticketPrice,
      capacity: dest.crowd.capacity,
      occupancy: dest.crowd.occupancy,
      crowd: dest.crowd.level,
      weatherNote: dest.weather.warning?.message ?? "",
      facilities: dest.facilities.map((f) => ({ ...f })),
      menu: dest.menu.map((m) => ({ ...m })),
      bookings: seedBookings(dest.id, dest.ticketPrice, dest.crowd.occupancy),
      updatedAt: dest.crowd.updatedAt,
      synced: true,
    };
  }, [all, selectedId, dest]);

  const update = (patch: Partial<OperatorData>) => {
    const next: OperatorData = { ...data, ...patch, synced: false };
    if (patch.occupancy !== undefined || patch.capacity !== undefined) {
      next.crowd = deriveCrowd(next.occupancy, next.capacity);
    }
    setAll((prev) => ({ ...prev, [selectedId]: next }));
  };

  const persist = () => {
    const next = { ...all, [selectedId]: { ...data, updatedAt: "baru saja", synced: true } };
    setAll(next);
    saveAll(next);
    toast.success("Data tersinkron ke jaringan Sigap Wisata");
  };

  const addFacility = () =>
    update({ facilities: [...data.facilities, { name: "", price: 0, unit: "/orang" }] });
  const removeFacility = (i: number) =>
    update({ facilities: data.facilities.filter((_, idx) => idx !== i) });
  const setFacility = (i: number, patch: Partial<FacilityRow>) =>
    update({ facilities: data.facilities.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });

  const addMenu = () => update({ menu: [...data.menu, { name: "", price: 0 }] });
  const removeMenu = (i: number) => update({ menu: data.menu.filter((_, idx) => idx !== i) });
  const setMenu = (i: number, patch: Partial<MenuRow>) =>
    update({ menu: data.menu.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) });

  const markPaid = (code: string) =>
    update({
      bookings: data.bookings.map((b) =>
        b.code === code ? { ...b, status: "paid", paidAt: "baru saja" } : b,
      ),
    });

  const c = crowdMeta[data.crowd];
  const occRate = data.capacity
    ? Math.min(100, Math.round((data.occupancy / data.capacity) * 100))
    : 0;

  const paid = data.bookings.filter((b) => b.status === "paid");
  const pending = data.bookings.filter((b) => b.status === "pending");
  const revenue = paid.reduce((s, b) => s + b.amount, 0);
  const pendingRevenue = pending.reduce((s, b) => s + b.amount, 0);
  const paxToday = data.bookings.reduce((s, b) => s + b.pax, 0);
  const commission = Math.round(revenue * 0.03);
  const netto = revenue - commission;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">MitraPoin</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Konsol Pengelola Destinasi
              </div>
            </div>
          </div>
          <div className="ml-3 hidden items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-white/10 md:inline-flex">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Terhubung ke jaringan Sigap Wisata
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => toast.info("Data realtime disegarkan")}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={persist}
              size="sm"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              <Save className="mr-1.5 h-4 w-4" /> Sinkronkan
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => router.navigate({ to: "/" })}
              aria-label="Kembali ke Sigap Wisata"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Destinasi Kelolaan
            </div>
            <ul className="space-y-1">
              {destinations.map((d) => {
                const active = d.id === selectedId;
                const local = all[d.id];
                return (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelectedId(d.id)}
                      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                        active
                          ? "bg-emerald-500/15 ring-1 ring-emerald-400/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <img
                        src={d.image}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{d.name}</div>
                        <div className="truncate text-[11px] text-slate-400">
                          {d.city} · {local && !local.synced ? "draft" : "live"}
                        </div>
                      </div>
                      {active && <ArrowUpRight className="h-4 w-4 text-emerald-400" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <Link
            to="/"
            className="block rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 text-xs text-slate-300 ring-1 ring-emerald-400/20 transition hover:ring-emerald-400/40"
          >
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-300">
              <BadgeCheck className="h-3.5 w-3.5" /> Data Live di Sigap Wisata
            </div>
            <p className="text-slate-400">
              Perubahan harga, kapasitas & menu langsung tampil di halaman destinasi wisatawan.
            </p>
          </Link>
        </aside>

        {/* Main */}
        <div className="min-w-0 space-y-6">
          {/* Header block */}
          <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03] p-5 ring-1 ring-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={dest.image}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{dest.name}</h1>
                    {dest.certified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                        <BadgeCheck className="h-3 w-3" /> SNI · Kemenparekraf
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {dest.city}, {dest.province} · Operator: {dest.operator}
                  </div>
                </div>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                  data.synced
                    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
                    : "bg-amber-500/10 text-amber-300 ring-amber-400/30"
                }`}
              >
                <Wifi className="h-3.5 w-3.5" />
                {data.synced ? "Tersinkron" : "Perubahan belum disimpan"}
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<Wallet className="h-4 w-4" />}
              label="Pendapatan Hari Ini"
              value={formatIDR(revenue)}
              tone="emerald"
              sub={`${paid.length} transaksi lunas`}
            />
            <KpiCard
              icon={<Clock className="h-4 w-4" />}
              label="Menunggu Pembayaran"
              value={formatIDR(pendingRevenue)}
              tone="amber"
              sub={`${pending.length} booking pending`}
            />
            <KpiCard
              icon={<Ticket className="h-4 w-4" />}
              label="Booking Hari Ini"
              value={String(data.bookings.length)}
              tone="sky"
              sub={`${paxToday} pengunjung terdaftar`}
            />
            <KpiCard
              icon={<Banknote className="h-4 w-4" />}
              label="Netto (setelah 3% fee)"
              value={formatIDR(netto)}
              tone="violet"
              sub={`Komisi platform: ${formatIDR(commission)}`}
            />
          </section>

          {/* Operational strip */}
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <Ticket className="h-3.5 w-3.5" /> Harga Tiket Live
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-300">{formatIDR(data.ticketPrice)}</div>
              <div className="mt-1 text-[11px] text-slate-500">Ditampilkan realtime ke wisatawan.</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <Activity className="h-3.5 w-3.5" /> Kepadatan
              </div>
              <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${c.color} ${c.ring} ${c.text}`}>
                ● {c.label}
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-emerald-400" style={{ width: `${occRate}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {data.occupancy.toLocaleString("id-ID")} / {data.capacity.toLocaleString("id-ID")} ({occRate}%)
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <CloudSun className="h-3.5 w-3.5" /> Catatan Cuaca
              </div>
              <div className="mt-2 text-sm">
                {data.weatherNote || <span className="text-slate-500">Tidak ada peringatan</span>}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">Terupdate: {data.updatedAt}</div>
            </div>
          </section>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
            {(
              [
                { id: "ringkasan", label: "Ringkasan Booking", icon: BarChart3 },
                { id: "booking", label: "Daftar Booking", icon: CalendarClock },
                { id: "harga", label: "Harga & Kapasitas", icon: Settings2 },
                { id: "fasilitas", label: "Fasilitas & Menu", icon: UtensilsCrossed },
              ] as const
            ).map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === "ringkasan" && (
            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Distribusi Kanal Booking</h2>
                  <span className="text-[11px] text-slate-400">{data.bookings.length} booking hari ini</span>
                </div>
                <ChannelBars bookings={data.bookings} />
              </div>
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <h2 className="mb-3 text-sm font-semibold">Status Pembayaran</h2>
                <StatusList bookings={data.bookings} />
              </div>
            </section>
          )}

          {tab === "booking" && (
            <section className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <h2 className="text-sm font-semibold">Booking Terbaru</h2>
                <span className="text-[11px] text-slate-400">
                  {paid.length} lunas · {pending.length} pending
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-white/[0.03] text-[11px] uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Kode</th>
                      <th className="px-4 py-3 text-left">Tamu</th>
                      <th className="px-4 py-3 text-left">Kanal</th>
                      <th className="px-4 py-3 text-left">Slot</th>
                      <th className="px-4 py-3 text-right">Pax</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings.map((b) => (
                      <tr key={b.code} className="border-t border-white/5">
                        <td className="px-4 py-3 font-mono text-xs text-slate-300">{b.code}</td>
                        <td className="px-4 py-3">{b.guest}</td>
                        <td className="px-4 py-3 text-slate-300">{b.channel}</td>
                        <td className="px-4 py-3 text-slate-300">{b.slot}</td>
                        <td className="px-4 py-3 text-right">{b.pax}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatIDR(b.amount)}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={b.status} sub={b.paidAt} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {b.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                              onClick={() => markPaid(b.code)}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Tandai lunas
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "harga" && (
            <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <h2 className="mb-4 text-sm font-semibold">Harga Tiket & Kapasitas</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Harga Tiket Resmi (IDR)">
                  <Input
                    type="number"
                    value={data.ticketPrice}
                    onChange={(e) => update({ ticketPrice: +e.target.value })}
                    className="border-white/10 bg-slate-900/60 text-slate-100 placeholder:text-slate-500"
                  />
                </Field>
                <Field label="Kapasitas Harian">
                  <Input
                    type="number"
                    value={data.capacity}
                    onChange={(e) => update({ capacity: +e.target.value })}
                    className="border-white/10 bg-slate-900/60 text-slate-100"
                  />
                </Field>
                <Field label="Pengunjung Saat Ini (sensor / manual)">
                  <Input
                    type="number"
                    value={data.occupancy}
                    onChange={(e) => update({ occupancy: +e.target.value })}
                    className="border-white/10 bg-slate-900/60 text-slate-100"
                  />
                </Field>
                <Field label="Catatan / Peringatan Cuaca">
                  <Input
                    value={data.weatherNote}
                    onChange={(e) => update({ weatherNote: e.target.value })}
                    placeholder="Mis. Hujan lokal sore hari"
                    className="border-white/10 bg-slate-900/60 text-slate-100 placeholder:text-slate-500"
                  />
                </Field>
              </div>
            </section>
          )}

          {tab === "fasilitas" && (
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4" /> Fasilitas
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addFacility}
                    className="text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Tambah
                  </Button>
                </div>
                <div className="space-y-2">
                  {data.facilities.length === 0 && (
                    <div className="rounded-xl bg-white/[0.03] p-4 text-center text-sm text-slate-400">
                      Belum ada fasilitas.
                    </div>
                  )}
                  {data.facilities.map((f, i) => (
                    <div key={i} className="grid gap-2 md:grid-cols-[1fr_110px_100px_36px]">
                      <Input
                        placeholder="Nama fasilitas"
                        value={f.name}
                        onChange={(e) => setFacility(i, { name: e.target.value })}
                        className="border-white/10 bg-slate-900/60 text-slate-100"
                      />
                      <Input
                        type="number"
                        placeholder="Harga"
                        value={f.price}
                        onChange={(e) => setFacility(i, { price: +e.target.value })}
                        className="border-white/10 bg-slate-900/60 text-slate-100"
                      />
                      <Input
                        placeholder="/jam"
                        value={f.unit}
                        onChange={(e) => setFacility(i, { unit: e.target.value })}
                        className="border-white/10 bg-slate-900/60 text-slate-100"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFacility(i)}
                        className="text-rose-300 hover:bg-rose-500/10"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <UtensilsCrossed className="h-4 w-4" /> Menu F&B
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addMenu}
                    className="text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Tambah
                  </Button>
                </div>
                <div className="space-y-2">
                  {data.menu.length === 0 && (
                    <div className="rounded-xl bg-white/[0.03] p-4 text-center text-sm text-slate-400">
                      Belum ada menu.
                    </div>
                  )}
                  {data.menu.map((m, i) => (
                    <div key={i} className="grid gap-2 md:grid-cols-[1fr_140px_36px]">
                      <Input
                        placeholder="Nama menu"
                        value={m.name}
                        onChange={(e) => setMenu(i, { name: e.target.value })}
                        className="border-white/10 bg-slate-900/60 text-slate-100"
                      />
                      <Input
                        type="number"
                        placeholder="Harga"
                        value={m.price}
                        onChange={(e) => setMenu(i, { price: +e.target.value })}
                        className="border-white/10 bg-slate-900/60 text-slate-100"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMenu(i)}
                        className="text-rose-300 hover:bg-rose-500/10"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <div className="rounded-2xl bg-emerald-500/5 p-4 text-xs text-slate-300 ring-1 ring-emerald-400/20">
            <div className="font-semibold text-emerald-300">API Gateway aktif</div>
            <p className="mt-1 text-slate-400">
              MitraPoin mengirim harga, kapasitas, cuaca, dan status booking ke Sigap Wisata melalui
              endpoint <span className="font-mono text-slate-200">/v1/destinations/{dest.id}</span>.
              Wisatawan melihat data terbaru begitu Anda menekan <span className="font-semibold text-emerald-300">Sinkronkan</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-300">{label}</Label>
      {children}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "emerald" | "amber" | "sky" | "violet";
}) {
  const tones = {
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300 ring-emerald-400/20",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-300 ring-amber-400/20",
    sky: "from-sky-500/20 to-sky-500/0 text-sky-300 ring-sky-400/20",
    violet: "from-violet-500/20 to-violet-500/0 text-violet-300 ring-violet-400/20",
  }[tone];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tones} bg-white/5 p-4 ring-1`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function StatusPill({ status, sub }: { status: BookingRow["status"]; sub: string }) {
  const map = {
    paid: { label: "Lunas", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" },
    pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-300 ring-amber-400/30" },
    refund: { label: "Refund", cls: "bg-rose-500/15 text-rose-300 ring-rose-400/30" },
  }[status];
  return (
    <div className="flex flex-col">
      <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${map.cls}`}>
        ● {map.label}
      </span>
      <span className="mt-0.5 text-[10px] text-slate-500">{sub}</span>
    </div>
  );
}

function ChannelBars({ bookings }: { bookings: BookingRow[] }) {
  const channels: BookingRow["channel"][] = ["Aplikasi", "Loket", "Mitra OTA"];
  const totals = channels.map((ch) => {
    const items = bookings.filter((b) => b.channel === ch);
    const amount = items.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
    return { ch, count: items.length, amount };
  });
  const max = Math.max(1, ...totals.map((t) => t.amount));
  const palette: Record<BookingRow["channel"], string> = {
    Aplikasi: "bg-emerald-400",
    Loket: "bg-sky-400",
    "Mitra OTA": "bg-violet-400",
  };
  return (
    <div className="space-y-3">
      {totals.map((t) => (
        <div key={t.ch}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {t.ch} <span className="text-slate-500">· {t.count} booking</span>
            </span>
            <span className="font-semibold text-white">{formatIDR(t.amount)}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full ${palette[t.ch]}`}
              style={{ width: `${(t.amount / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusList({ bookings }: { bookings: BookingRow[] }) {
  const groups = [
    { key: "paid" as const, label: "Sudah bayar", cls: "text-emerald-300" },
    { key: "pending" as const, label: "Menunggu pembayaran", cls: "text-amber-300" },
    { key: "refund" as const, label: "Dikembalikan", cls: "text-rose-300" },
  ];
  const total = Math.max(1, bookings.length);
  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const items = bookings.filter((b) => b.status === g.key);
        const pct = Math.round((items.length / total) * 100);
        return (
          <div key={g.key}>
            <div className="flex items-center justify-between text-xs">
              <span className={g.cls}>{g.label}</span>
              <span className="text-slate-400">
                {items.length} · {pct}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full ${
                  g.key === "paid" ? "bg-emerald-400" : g.key === "pending" ? "bg-amber-400" : "bg-rose-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
