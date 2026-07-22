import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SigapLayout } from "@/components/SigapLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { destinations, formatIDR, crowdMeta, type CrowdLevel } from "@/lib/mock-data";
import { toast } from "sonner";
import {
  Activity,
  Building2,
  CloudSun,
  Plus,
  Save,
  Ticket,
  Trash2,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Dashboard Pengelola — Sigap Wisata" },
      { name: "description", content: "Input & sinkronisasi harga tiket, fasilitas, dan menu ke ekosistem Sigap Wisata." },
    ],
  }),
  component: OperatorDashboard,
});

type FacilityRow = { name: string; price: number; unit: string };
type MenuRow = { name: string; price: number };
type OperatorData = {
  destinationId: string;
  ticketPrice: number;
  capacity: number;
  occupancy: number;
  crowd: CrowdLevel;
  weatherNote: string;
  facilities: FacilityRow[];
  menu: MenuRow[];
  updatedAt: string;
  synced: boolean;
};

const KEY = "sigap.operator.v1";

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

function OperatorDashboard() {
  const [all, setAll] = useState<Record<string, OperatorData>>({});
  const [selectedId, setSelectedId] = useState<string>(destinations[0].id);

  useEffect(() => {
    setAll(loadAll());
  }, []);

  const dest = useMemo(
    () => destinations.find((d) => d.id === selectedId)!,
    [selectedId],
  );

  const data: OperatorData = useMemo(() => {
    const existing = all[selectedId];
    if (existing) return existing;
    return {
      destinationId: dest.id,
      ticketPrice: dest.ticketPrice,
      capacity: dest.crowd.capacity,
      occupancy: dest.crowd.occupancy,
      crowd: dest.crowd.level,
      weatherNote: dest.weather.warning?.message ?? "",
      facilities: dest.facilities.map((f) => ({ ...f })),
      menu: dest.menu.map((m) => ({ ...m })),
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
    toast.success("Data tersinkron ke ekosistem Sigap Wisata");
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

  const c = crowdMeta[data.crowd];
  const occRate = data.capacity ? Math.min(100, Math.round((data.occupancy / data.capacity) * 100)) : 0;

  return (
    <SigapLayout requireAuth>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard Pengelola</h1>
              <p className="text-sm text-muted-foreground">
                Input harga tiket, fasilitas, dan menu. Data langsung tersinkron ke Sigap Wisata.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                data.synced
                  ? "bg-success/10 text-success ring-success/20"
                  : "bg-amber-500/10 text-amber-600 ring-amber-500/20"
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              {data.synced ? "Tersinkron" : "Perubahan belum disimpan"}
            </div>
            <Button onClick={persist} className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Save className="mr-2 h-4 w-4" /> Sinkronkan
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-border/70 bg-card p-3">
            <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Destinasi Anda
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
                        active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted"
                      }`}
                    >
                      <img src={d.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{d.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {d.city} · {local && !local.synced ? "draft" : "aktif"}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5" /> Harga Tiket
                </div>
                <div className="mt-2 text-2xl font-bold text-brand">{formatIDR(data.ticketPrice)}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Ditampilkan realtime ke wisatawan.
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" /> Kepadatan
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${c.color} ${c.ring} ${c.text}`}>
                  ● {c.label}
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${occRate}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {data.occupancy.toLocaleString("id-ID")} / {data.capacity.toLocaleString("id-ID")} pengunjung ({occRate}%)
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <CloudSun className="h-3.5 w-3.5" /> Catatan Cuaca
                </div>
                <div className="mt-2 text-sm">
                  {data.weatherNote || <span className="text-muted-foreground">Tidak ada peringatan</span>}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">Terupdate: {data.updatedAt}</div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Data Utama
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Harga Tiket Resmi (IDR)</Label>
                  <Input
                    type="number"
                    value={data.ticketPrice}
                    onChange={(e) => update({ ticketPrice: +e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kapasitas Harian</Label>
                  <Input
                    type="number"
                    value={data.capacity}
                    onChange={(e) => update({ capacity: +e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pengunjung Saat Ini (sensor / manual)</Label>
                  <Input
                    type="number"
                    value={data.occupancy}
                    onChange={(e) => update({ occupancy: +e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Catatan / Peringatan Cuaca</Label>
                  <Input
                    value={data.weatherNote}
                    onChange={(e) => update({ weatherNote: e.target.value })}
                    placeholder="Mis. Hujan lokal sore hari"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Rincian Fasilitas
                </h2>
                <Button variant="outline" size="sm" onClick={addFacility}>
                  <Plus className="mr-1 h-4 w-4" /> Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {data.facilities.length === 0 && (
                  <div className="rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                    Belum ada fasilitas. Tambahkan agar transparan bagi wisatawan.
                  </div>
                )}
                {data.facilities.map((f, i) => (
                  <div key={i} className="grid gap-2 md:grid-cols-[1fr_140px_120px_40px]">
                    <Input
                      placeholder="Nama fasilitas"
                      value={f.name}
                      onChange={(e) => setFacility(i, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={f.price}
                      onChange={(e) => setFacility(i, { price: +e.target.value })}
                    />
                    <Input
                      placeholder="/jam, /orang"
                      value={f.unit}
                      onChange={(e) => setFacility(i, { unit: e.target.value })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFacility(i)} aria-label="Hapus">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  <UtensilsCrossed className="h-3.5 w-3.5" /> Menu Makanan & Minuman
                </h2>
                <Button variant="outline" size="sm" onClick={addMenu}>
                  <Plus className="mr-1 h-4 w-4" /> Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {data.menu.length === 0 && (
                  <div className="rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                    Belum ada menu.
                  </div>
                )}
                {data.menu.map((m, i) => (
                  <div key={i} className="grid gap-2 md:grid-cols-[1fr_160px_40px]">
                    <Input
                      placeholder="Nama menu"
                      value={m.name}
                      onChange={(e) => setMenu(i, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={m.price}
                      onChange={(e) => setMenu(i, { price: +e.target.value })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeMenu(i)} aria-label="Hapus">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-2xl bg-primary/5 p-4 text-sm ring-1 ring-primary/10">
              <div className="font-semibold text-primary">Terhubung ke Sigap Wisata</div>
              <p className="mt-1 text-muted-foreground">
                Setelah disinkronkan, harga tiket dan menu akan otomatis muncul di halaman destinasi,
                mesin rekomendasi AI, dan indikator kepadatan realtime untuk wisatawan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SigapLayout>
  );
}
