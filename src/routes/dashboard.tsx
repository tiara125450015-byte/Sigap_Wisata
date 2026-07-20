import { createFileRoute, Link } from "@tanstack/react-router";
import { SigapLayout } from "@/components/SigapLayout";
import { destinations, formatIDR, crowdMeta } from "@/lib/mock-data";
import { Calendar, Compass, History, Sparkles, Store, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Beranda — Sigap Wisata" }] }),
  component: Dashboard,
});

function Dashboard() {
  const trending = [...destinations].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const menus = [
    { to: "/destinations", label: "Booking Wisata", desc: "Lihat destinasi & pesan tiket", icon: Calendar, tint: "bg-primary/10 text-primary" },
    { to: "/recommend", label: "Rekomendasi AI", desc: "Cari destinasi sesuai kondisimu", icon: Sparkles, tint: "bg-brand/10 text-brand" },
    { to: "/register-business", label: "Daftar Usaha Wisata", desc: "Onboarding pengelola", icon: Store, tint: "bg-brand-accent/10 text-brand-accent" },
    { to: "/history", label: "Riwayat Wisata", desc: "Kunjungan & ulasan Anda", icon: History, tint: "bg-success/15 text-success" },
  ];
  return (
    <SigapLayout requireAuth>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <section className="rounded-3xl bg-ocean-gradient p-6 text-white shadow-lg md:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/80">
            <Compass className="h-4 w-4" /> Menu Utama
          </div>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Mau kemana hari ini?</h1>
          <p className="mt-2 max-w-xl text-white/85">
            Pantau kepadatan destinasi, cek cuaca terkini, dan pesan tiket langsung dari satu tempat.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {menus.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group rounded-2xl border border-border/70 bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${m.tint}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold">{m.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{m.desc}</div>
            </Link>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
                <TrendingUp className="h-3.5 w-3.5" /> Trending Sekarang
              </div>
              <h2 className="mt-1 text-2xl font-bold">Destinasi paling diminati</h2>
            </div>
            <Link to="/destinations" className="text-sm font-medium text-primary hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {trending.map((d) => {
              const c = crowdMeta[d.crowd.level];
              return (
                <Link
                  key={d.id}
                  to="/destinations/$id"
                  params={{ id: d.id }}
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={d.image} alt={d.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur ${c.color} ${c.ring} ${c.text}`}>
                      ● {c.label}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground">{d.city}, {d.province}</div>
                    <div className="mt-0.5 font-semibold">{d.name}</div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-brand">{formatIDR(d.ticketPrice)}</span>
                      <span className="text-muted-foreground">★ {d.rating}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </SigapLayout>
  );
}
