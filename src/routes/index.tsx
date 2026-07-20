import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/sigap-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Activity, Cloud, Sparkles, Store, Ticket, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sigap Wisata — Satu Platform, Semua Wisata Indonesia" },
      {
        name: "description",
        content:
          "Kepadatan realtime, harga transparan, cuaca BMKG, dan rekomendasi AI untuk wisata di seluruh Indonesia.",
      },
    ],
  }),
  component: Welcome,
});

const features = [
  {
    icon: Users,
    title: "Kepadatan Realtime",
    desc: "Sensor MobileNet-SSD di gerbang tiket menghitung pengunjung tiap menit.",
    tint: "bg-primary/10 text-primary",
  },
  {
    icon: Ticket,
    title: "Harga Transparan",
    desc: "Tiket, menu makanan & fasilitas ditampilkan resmi — anti pungli.",
    tint: "bg-brand/10 text-brand",
  },
  {
    icon: Cloud,
    title: "Peringatan Dini Cuaca",
    desc: "Terhubung API BMKG SIDARMA-NOWCAST & INA-WIS dengan AI deteksi bahaya.",
    tint: "bg-brand-accent/10 text-brand-accent",
  },
  {
    icon: Sparkles,
    title: "Rekomendasi AI",
    desc: "Hybrid recommender: konten + kondisi kepadatan & cuaca realtime.",
    tint: "bg-warn/15 text-warn",
  },
  {
    icon: Store,
    title: "Onboarding Pengelola",
    desc: "Daftarkan usaha wisata, verifikasi SNI/Kemenparekraf, langsung tampil.",
    tint: "bg-success/15 text-success",
  },
  {
    icon: Activity,
    title: "API Gateway Nasional",
    desc: "Menghubungkan sistem tiket eksisting — tanpa membangun ulang.",
    tint: "bg-primary/10 text-primary",
  },
];

function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-ocean-gradient opacity-95"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(1200px 500px at 20% 10%, rgba(255,255,255,0.35), transparent), radial-gradient(800px 400px at 80% 60%, rgba(255,180,80,0.35), transparent)",
          }}
          aria-hidden
        />
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-16 text-center md:py-24">
          <div className="flex items-center gap-3 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white ring-1 ring-white/25 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse" /> Platform Nasional Wisata Indonesia
          </div>
          <img
            src={logo.url}
            alt="Logo Sigap Wisata"
            className="h-32 w-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white/30 md:h-40 md:w-40"
          />
          <div className="max-w-3xl space-y-4 text-white">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm md:text-6xl">
              Satu ekosistem, <br className="hidden md:block" />
              seluruh wisata Nusantara.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-white/85 md:text-lg">
              Sigap Wisata menyatukan pemantauan kepadatan realtime, harga transparan, peringatan dini cuaca
              BMKG, dan rekomendasi berbasis AI — dalam satu aplikasi untuk wisatawan dan pengelola.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/auth">Mulai Sekarang</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <Link to="/destinations">Jelajahi Destinasi</Link>
            </Button>
          </div>
          <div className="grid w-full max-w-3xl grid-cols-3 gap-4 pt-6 text-white/90">
            {[
              ["6+", "Destinasi Aktif"],
              ["24/7", "Data Realtime"],
              ["BMKG", "Terintegrasi API"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/15">
                <div className="text-2xl font-bold md:text-3xl">{n}</div>
                <div className="text-xs uppercase tracking-widest text-white/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand">Ekosistem Terpadu</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Lima kebutuhan wisata, satu platform.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Arsitektur agregator (API gateway) menghubungkan sistem yang sudah berjalan di destinasi
            pemerintah maupun swasta — tanpa membangun ulang.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.tint}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-3xl bg-brand-gradient p-8 text-white shadow-xl md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold md:text-3xl">Kelola destinasi Anda di Sigap Wisata.</h3>
              <p className="mt-2 text-white/90">
                Daftarkan usaha wisata, atur harga menu & fasilitas realtime, dan raih wisatawan lewat
                rekomendasi AI nasional.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-brand hover:bg-white/90">
                <Link to="/register-business">Daftarkan Usaha</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/50 bg-transparent text-white hover:bg-white/10"
              >
                <Link to="/dashboard">Masuk Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
