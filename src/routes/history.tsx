import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SigapLayout } from "@/components/SigapLayout";
import { getBookings, rateBooking, type Booking } from "@/lib/session";
import { destinations, formatIDR } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, History as HistoryIcon, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Riwayat Wisata — Sigap Wisata" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [reviewFor, setReviewFor] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    const sync = () => setItems(getBookings());
    sync();
    window.addEventListener("sigap:bookings", sync);
    return () => window.removeEventListener("sigap:bookings", sync);
  }, []);

  const submitReview = () => {
    if (!reviewFor) return;
    rateBooking(reviewFor.id, rating, review);
    toast.success("Ulasan terkirim, terima kasih!");
    setReviewFor(null);
    setReview("");
    setRating(5);
  };

  return (
    <SigapLayout requireAuth>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <HistoryIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Riwayat Wisata Anda</h1>
            <p className="text-sm text-muted-foreground">Beri ulasan atau booking ulang destinasi favorit.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Belum ada riwayat. <Link to="/destinations" className="text-primary hover:underline">Mulai booking →</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((b) => {
              const d = destinations.find((x) => x.id === b.destinationId);
              return (
                <div key={b.id} className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 md:flex-row">
                  {d && (
                    <img src={d.image} alt={d.destinationName} className="h-32 w-full shrink-0 rounded-xl object-cover md:h-24 md:w-40" />
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{b.destinationName}</div>
                      <div className="text-xs text-muted-foreground">Kode: {b.id}</div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.date}</span>
                      <span>{b.visitors} pengunjung</span>
                      <span className="font-semibold text-brand">{formatIDR(b.total)}</span>
                    </div>
                    {b.rating && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-warn">
                        {Array.from({ length: b.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                        <span className="ml-2 text-muted-foreground">"{b.review}"</span>
                      </div>
                    )}
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      {!b.rating && (
                        <Button size="sm" variant="outline" onClick={() => { setReviewFor(b); setRating(5); setReview(""); }}>
                          Beri Rating & Ulasan
                        </Button>
                      )}
                      {d && (
                        <Button size="sm" asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
                          <Link to="/destinations/$id" params={{ id: d.id }}>Booking Lagi</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!reviewFor} onOpenChange={(o) => !o && setReviewFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ulasan untuk {reviewFor?.destinationName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Rating</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} aria-label={`${n} bintang`}>
                    <Star className={`h-7 w-7 ${n <= rating ? "fill-warn text-warn" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea rows={4} placeholder="Bagikan pengalaman Anda…" value={review} onChange={(e) => setReview(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewFor(null)}>Batal</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={submitReview}>Kirim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SigapLayout>
  );
}
