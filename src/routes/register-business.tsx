import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SigapLayout } from "@/components/SigapLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addBusiness } from "@/lib/session";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Store } from "lucide-react";

export const Route = createFileRoute("/register-business")({
  head: () => ({ meta: [{ title: "Daftarkan Usaha Wisata — Sigap Wisata" }] }),
  component: RegBiz,
});

function RegBiz() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    category: "wisata_alam",
    price: 0,
    facilities: "",
    responsibleName: "",
    responsibleNIK: "",
    certificate: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.location || !form.responsibleName || !form.responsibleNIK) {
      return toast.error("Lengkapi data usaha & penanggung jawab");
    }
    if (!form.certificate) return toast.error("Unggah/isi nomor sertifikat SNI/Kemenparekraf");
    addBusiness({
      id: "BIZ-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      ...form,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
    toast.success("Pengajuan terkirim, menunggu verifikasi Kemenparekraf");
  };

  const Steps = () => (
    <div className="mb-6 flex items-center gap-2 text-xs">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={`grid h-7 w-7 place-items-center rounded-full font-semibold ${
              step >= s ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </span>
          <span className={step >= s ? "font-medium" : "text-muted-foreground"}>
            {s === 1 ? "Detail Usaha" : s === 2 ? "Penanggung Jawab" : "Verifikasi"}
          </span>
          {s < 3 && <div className="mx-2 h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  );

  return (
    <SigapLayout requireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Daftarkan Usaha Wisata Anda</h1>
            <p className="text-sm text-muted-foreground">Terhubung ke ekosistem nasional Sigap Wisata.</p>
          </div>
        </div>

        {!submitted ? (
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm md:p-8">
            <Steps />

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Nama Usaha / Destinasi</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Mis. Pantai Pasir Putih" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Alamat / Lokasi</Label>
                  <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Jalan, Kecamatan, Kabupaten, Provinsi" />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    <option value="wisata_alam">Wisata Alam</option>
                    <option value="wisata_budaya">Wisata Budaya</option>
                    <option value="wisata_bahari">Wisata Bahari</option>
                    <option value="wisata_buatan">Wisata Buatan</option>
                    <option value="kuliner">Kuliner</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Tiket (IDR)</Label>
                  <Input type="number" value={form.price} onChange={(e) => set("price", +e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Menu Makanan & Rincian Fasilitas</Label>
                  <Textarea
                    rows={4}
                    placeholder="Contoh: Sewa payung Rp15.000/jam · Nasi campur Rp25.000 · Guide Rp150.000/rombongan"
                    value={form.facilities}
                    onChange={(e) => set("facilities", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Harga akan ditampilkan realtime untuk mencegah pungli.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={() => setStep(2)} className="bg-brand text-brand-foreground hover:bg-brand/90">
                    Lanjut
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Nama Penanggung Jawab</Label>
                  <Input value={form.responsibleName} onChange={(e) => set("responsibleName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>NIK</Label>
                  <Input value={form.responsibleNIK} onChange={(e) => set("responsibleNIK", e.target.value)} placeholder="16 digit NIK" />
                </div>
                <div className="md:col-span-2 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Kembali</Button>
                  <Button onClick={() => setStep(3)} className="bg-brand text-brand-foreground hover:bg-brand/90">
                    Lanjut
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nomor Sertifikat Standar Usaha Pariwisata / SNI</Label>
                  <Input value={form.certificate} onChange={(e) => set("certificate", e.target.value)} placeholder="Mis. SNI 8013:2014 / CHSE-2025-0000123" />
                </div>
                <div className="rounded-2xl bg-primary/5 p-4 text-sm ring-1 ring-primary/10">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <ShieldCheck className="h-4 w-4" /> Verifikasi Kemenparekraf
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Pengajuan akan diperiksa. Setelah disetujui, destinasi Anda tampil di menu Pilih Wisata dan
                    masuk ke mesin rekomendasi AI.
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Kembali</Button>
                  <Button onClick={submit} className="bg-brand text-brand-foreground hover:bg-brand/90">
                    Kirim Pengajuan
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Menunggu persetujuan Kemenparekraf</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kami akan mengabari Anda setelah verifikasi selesai. Jika tidak disetujui, Anda bisa mencoba lagi.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => { setSubmitted(false); setStep(1); }}>
                Ajukan Usaha Lain
              </Button>
              <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
                <a href="/dashboard">Kembali ke Beranda</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </SigapLayout>
  );
}
