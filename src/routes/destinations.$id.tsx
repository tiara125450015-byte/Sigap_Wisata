import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SigapLayout } from "@/components/SigapLayout";
import { crowdMeta, destinations, formatIDR } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { addBooking } from "@/lib/session";
import { toast } from "sonner";
import { AlertTriangle, Cloud, MapPin, ShieldCheck, Ticket, Users, Utensils, Wrench } from "lucide-react";

export const Route = createFileRoute("/destinations/$id")({
  head: ({ params }) => {
    const d = destinations.find((x) => x.id === params.id);
    return {
      meta: [
        { title: d ? `${d.name} — Sigap Wisata` : "Destinasi" },
        { name: "description", content: d?.description ?? "" },
        ...(d ? [{ property: "og:image", content: d.image }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const d = destinations.find((x) => x.id === params.id);
    if (!d) throw notFound();
    return d;
  },
  notFoundComponent: () => (
    <SigapLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Destinasi tidak ditemukan</h1>
        <Link to="/destinations" className="mt-4 inline-block text-primary hover:underline">← Kembali</Link>
      </div>
    </SigapLayout>
  ),
  component: DestDetail,
});

function DestDetail() {
  const d = Route.useLoaderData();
  const router = useRouter();
  const c = crowdMeta[d.crowd.level];
  const pct = Math.round((d.crowd.occupancy / d.crowd.capacity) * 100);
  const [open, setOpen] = useState(false);
  const [visitors, setVisitors] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ticket, setTicket] = useState<{ id: string; total: number } | null>(null);

  const total = d.ticketPrice * visitors;

  const doBook = () => {
    const id = "TKT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    addBooking({
      id,
      destinationId: d.id,
      destinationName: d.name,
      date,
      visitors,
      total,
      createdAt: new Date().toISOString(),
    });
    setTicket({ id, total });
    toast.success("Tiket berhasil dipesan");
  };

  return (
    <SigapLayout requireAuth>
      <div className="relative">
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          <img src={d.image} alt={d.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="mx-auto -mt-24 max-w-7xl px-4">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-lg md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {d.city}, {d.province}
                  {d.certified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                      <ShieldCheck className="h-3 w-3" /> SNI Pariwisata
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-3xl font-bold md:text-4xl">{d.name}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{d.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.tags.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <div className="text-xs text-muted-foreground">Harga Tiket Resmi</div>
                <div className="text-3xl font-extrabold text-brand">{formatIDR(d.ticketPrice)}</div>
                <div className="text-xs text-muted-foreground">Operator: {d.operator}</div>
              </div>
            </div>

            {/* Live stats */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl p-4 ring-1 ${c.color} ${c.ring}`}>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Kepadatan Realtime
                </div>
                <div className={`mt-1 text-2xl font-bold ${c.text}`}>{c.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {d.crowd.occupancy.toLocaleString("id-ID")} / {d.crowd.capacity.toLocaleString("id-ID")} pengunjung · {pct}%
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-background/60">
                  <div className={`h-full rounded-full ${c.text.replace("text-", "bg-")}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Sumber: MobileNet-SSD gerbang tiket · {d.crowd.updatedAt}
                </div>
              </div>
              <div className="rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Cloud className="h-3.5 w-3.5" /> Cuaca Terkini
                </div>
                <div className="mt-1 text-2xl font-bold">{d.weather.condition}</div>
                <div className="text-xs text-muted-foreground">{d.weather.temp}°C · {d.weather.source}</div>
                {d.weather.warning && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-lg p-2 text-xs ${
                      d.weather.warning.level === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : d.weather.warning.level === "watch"
                        ? "bg-warn/15 text-warn"
                        : "bg-brand-accent/10 text-brand-accent"
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{d.weather.warning.message}</span>
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-brand/5 p-4 ring-1 ring-brand/10">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5" /> Booking Tiket
                </div>
                <div className="mt-1 text-2xl font-bold">{formatIDR(d.ticketPrice)}</div>
                <div className="text-xs text-muted-foreground">/ orang · harga resmi</div>
                <Button
                  className="mt-3 w-full bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={() => {
                    setTicket(null);
                    setOpen(true);
                  }}
                >
                  Pesan Sekarang
                </Button>
              </div>
            </div>

            {/* Price transparency */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Wrench className="h-4 w-4 text-brand-accent" /> Harga Fasilitas
                </h3>
                <div className="rounded-2xl border border-border/70 bg-card">
                  {d.facilities.map((f, i) => (
                    <div
                      key={f.name}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        i !== d.facilities.length - 1 ? "border-b border-border/60" : ""
                      }`}
                    >
                      <span>{f.name}</span>
                      <span className="font-semibold">
                        {formatIDR(f.price)}
                        <span className="text-xs text-muted-foreground"> {f.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Diinput langsung oleh pengelola & disinkron realtime — anti pungli.
                </p>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Utensils className="h-4 w-4 text-brand" /> Menu Makanan & Minuman
                </h3>
                <div className="rounded-2xl border border-border/70 bg-card">
                  {d.menu.map((m, i) => (
                    <div
                      key={m.name}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        i !== d.menu.length - 1 ? "border-b border-border/60" : ""
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="font-semibold">{formatIDR(m.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {!ticket ? (
            <>
              <DialogHeader>
                <DialogTitle>Booking Tiket — {d.name}</DialogTitle>
                <DialogDescription>Isi tanggal dan jumlah pengunjung.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Tanggal Kunjungan</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v">Jumlah Pengunjung</Label>
                  <Input id="v" type="number" min={1} max={20} value={visitors} onChange={(e) => setVisitors(Math.max(1, +e.target.value || 1))} />
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between"><span>Tiket ({visitors} × {formatIDR(d.ticketPrice)})</span><span>{formatIDR(total)}</span></div>
                  <div className="mt-1 flex justify-between font-semibold"><span>Total</span><span className="text-brand">{formatIDR(total)}</span></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={doBook}>Bayar & Cetak Tiket</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Tiket Anda</DialogTitle>
                <DialogDescription>Simpan atau tunjukkan QR ini di gerbang.</DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl bg-ocean-gradient p-5 text-white">
                <div className="text-xs uppercase tracking-widest text-white/80">Sigap Wisata</div>
                <div className="mt-1 text-xl font-bold">{d.name}</div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div><div className="text-[10px] uppercase text-white/70">Kode</div><div className="font-semibold">{ticket.id}</div></div>
                  <div><div className="text-[10px] uppercase text-white/70">Tanggal</div><div className="font-semibold">{date}</div></div>
                  <div><div className="text-[10px] uppercase text-white/70">Pax</div><div className="font-semibold">{visitors}</div></div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-white/70">Total</div>
                    <div className="text-2xl font-bold">{formatIDR(ticket.total)}</div>
                  </div>
                  <div
                    className="grid h-16 w-16 grid-cols-6 grid-rows-6 gap-[2px] rounded-md bg-white p-1"
                    aria-label="QR simulasi"
                  >
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`${(i * 7 + ticket.id.charCodeAt(i % ticket.id.length)) % 3 === 0 ? "bg-black" : "bg-white"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setOpen(false); router.navigate({ to: "/history" }); }}>Ke Riwayat</Button>
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => window.print()}>Cetak</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SigapLayout>
  );
}
