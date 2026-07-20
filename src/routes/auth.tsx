import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/sigap-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Masuk / Daftar — Sigap Wisata" }] }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Isi email & password");
    setSession({ name: email.split("@")[0], email });
    toast.success("Selamat datang kembali!");
    router.navigate({ to: "/dashboard" });
  };
  const doSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error("Lengkapi semua data");
    setSession({ name, email });
    toast.success("Akun berhasil dibuat");
    router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen bg-ocean-gradient">
      <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_10%,rgba(255,255,255,0.25),transparent)]" />
      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-black/5">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src={logo.url} alt="Sigap Wisata" className="h-16 w-16 rounded-2xl object-cover shadow" />
            <h1 className="mt-3 text-xl font-bold">Selamat Datang di Sigap Wisata</h1>
            <p className="text-xs text-muted-foreground">Wisata Indonesia lebih aman & transparan</p>
          </div>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={doLogin} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lemail">Email</Label>
                  <Input id="lemail" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lpass">Kata Sandi</Label>
                  <Input id="lpass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                  Masuk
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={doSignup} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sname">Nama Lengkap</Label>
                  <Input id="sname" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="semail">Email</Label>
                  <Input id="semail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="spass">Kata Sandi</Label>
                  <Input id="spass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                  Buat Akun
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
