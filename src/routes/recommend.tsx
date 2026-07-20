import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SigapLayout } from "@/components/SigapLayout";
import { crowdMeta, destinations, formatIDR } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, MapPin } from "lucide-react";

export const Route = createFileRoute("/recommend")({
  head: () => ({ meta: [{ title: "Rekomendasi AI — Sigap Wisata" }] }),
  component: Recommend,
});

const preferences = [
  { key: "budaya", label: "Budaya" },
  { key: "pantai", label: "Pantai / Laut" },
  { key: "gunung", label: "Gunung" },
  { key: "alam", label: "Alam" },
  { key: "keluarga", label: "Keluarga" },
  { key: "petualangan", label: "Petualangan" },
  { key: "sunset", label: "Sunset" },
  { key: "sunrise", label: "Sunrise" },
];

function Recommend() {
  const [selected, setSelected] = useState<string[]>(["budaya"]);
  const [avoidCrowd, setAvoidCrowd] = useState(true);
  const [avoidBadWeather, setAvoidBadWeather] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (k: string) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const results = useMemo(() => {
    return destinations
      .map((d) => {
        let score = 0;
        for (const t of d.tags) if (selected.includes(t)) score += 3;
        if (avoidCrowd) {
          score += d.crowd.level === "sepi" ? 3 : d.crowd.level === "sedang" ? 1.5 : d.crowd.level === "padat" ? -1 : -3;
        }
        if (avoidBadWeather && d.weather.warning) {
          score += d.weather.warning.level === "danger" ? -4 : d.weather.warning.level === "watch" ? -2 : -0.5;
        }
        score += (d.rating - 4.5) * 2;
        return { d, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [selected, avoidCrowd, avoidBadWeather]);

  const run = () => {
    setRunning(true);
    setDone(false);
    setTimeout(() => {
      setRunning(false);
      setDone(true);
    }, 900);
  };

  return (
    <SigapLayout requireAuth>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-brand-gradient p-6 text-white shadow-lg md:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/80">
            <Sparkles className="h-4 w-4" /> Hybrid Recommender AI
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Temukan destinasi paling cocok</h1>
          <p className="mt-2 max-w-xl text-white/85">
            Content-based filtering digabung filter realtime: tingkat kepadatan sensor & status cuaca BMKG.
            AI akan menghindarkan Anda dari destinasi padat atau bercuaca buruk.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="font-semibold">Preferensi</h2>
            <p className="text-xs text-muted-foreground">Pilih minat wisata Anda.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {preferences.map((p) => (
                <button
                  key={p.key}
                  onClick={() => toggle(p.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected.includes(p.key)
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                <span>
                  <div className="font-medium">Hindari destinasi padat</div>
                  <div className="text-xs text-muted-foreground">Data sensor MobileNet-SSD</div>
                </span>
                <input type="checkbox" checked={avoidCrowd} onChange={(e) => setAvoidCrowd(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                <span>
                  <div className="font-medium">Hindari cuaca buruk</div>
                  <div className="text-xs text-muted-foreground">BMKG SIDARMA & INA-WIS</div>
                </span>
                <input type="checkbox" checked={avoidBadWeather} onChange={(e) => setAvoidBadWeather(e.target.checked)} />
              </label>
            </div>

            <Button onClick={run} className="mt-5 w-full bg-brand text-brand-foreground hover:bg-brand/90">
              {running ? "Menganalisis…" : "Cari Rekomendasi"}
            </Button>
          </div>

          <div>
            {!done && !running && (
              <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                Klik <b className="mx-1">Cari Rekomendasi</b> untuk melihat destinasi yang paling sesuai.
              </div>
            )}
            {running && (
              <div className="flex h-72 items-center justify-center rounded-2xl border border-border/70 bg-card">
                <div className="animate-pulse text-sm text-muted-foreground">AI menghitung skor destinasi…</div>
              </div>
            )}
            {done && (
              <div className="space-y-3">
                {results.slice(0, 4).map(({ d, score }, i) => {
                  const c = crowdMeta[d.crowd.level];
                  return (
                    <Link
                      key={d.id}
                      to="/destinations/$id"
                      params={{ id: d.id }}
                      className="group flex gap-4 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <img src={d.image} alt={d.name} className="h-28 w-40 shrink-0 rounded-xl object-cover" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                            #{i + 1} · Skor {score.toFixed(1)}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color} ${c.text}`}>
                            {c.label}
                          </span>
                        </div>
                        <div className="mt-1 font-semibold">{d.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {d.city}, {d.province}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                          <span className="text-muted-foreground">
                            {d.weather.condition} · {d.weather.temp}°C
                          </span>
                          <span className="font-semibold text-brand">{formatIDR(d.ticketPrice)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SigapLayout>
  );
}
