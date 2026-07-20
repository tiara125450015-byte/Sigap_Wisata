import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SigapLayout } from "@/components/SigapLayout";
import { crowdMeta, destinations, formatIDR } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Cloud, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/destinations/")({
  head: () => ({ meta: [{ title: "Booking Wisata — Sigap Wisata" }] }),
  component: DestList,
});

function DestList() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("semua");
  const list = useMemo(() => {
    return destinations.filter((d) => {
      const okQ = q === "" || (d.name + d.city + d.province + d.tags.join(" ")).toLowerCase().includes(q.toLowerCase());
      const okF = filter === "semua" || d.crowd.level === filter;
      return okQ && okF;
    });
  }, [q, filter]);

  const filters: { key: string; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "sepi", label: "Sepi" },
    { key: "sedang", label: "Sedang" },
    { key: "padat", label: "Padat" },
    { key: "sangat_padat", label: "Sangat Padat" },
  ];

  return (
    <SigapLayout requireAuth>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">Booking Wisata</div>
            <h1 className="mt-1 text-3xl font-bold">Pilih destinasi Anda</h1>
            <p className="text-sm text-muted-foreground">Kepadatan & cuaca diperbarui realtime.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari destinasi, kota, atau tag…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => {
            const c = crowdMeta[d.crowd.level];
            const pct = Math.round((d.crowd.occupancy / d.crowd.capacity) * 100);
            return (
              <Link
                key={d.id}
                to="/destinations/$id"
                params={{ id: d.id }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={d.image} alt={d.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <div className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur ${c.color} ${c.ring} ${c.text}`}>
                    ● {c.label} · {pct}%
                  </div>
                  {d.weather.warning && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-destructive/90 px-2.5 py-1 text-[11px] font-semibold text-destructive-foreground">
                      <AlertTriangle className="h-3 w-3" /> Waspada
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {d.city}, {d.province}
                  </div>
                  <div className="mt-0.5 font-semibold">{d.name}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Cloud className="h-3 w-3" /> {d.weather.condition} · {d.weather.temp}°C</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-semibold text-brand">{formatIDR(d.ticketPrice)}</span>
                    <span className="text-xs text-muted-foreground">★ {d.rating}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Tidak ada destinasi cocok dengan filter Anda.
            </div>
          )}
        </div>
      </div>
    </SigapLayout>
  );
}
