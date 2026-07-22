import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/sigap-logo.jpg.asset.json";
import { clearSession, getSession, type SessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Compass, History, LogOut, Sparkles, Store } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Beranda", icon: Compass },
  { to: "/destinations", label: "Booking Wisata", icon: Calendar },
  { to: "/recommend", label: "Rekomendasi AI", icon: Sparkles },
  { to: "/register-business", label: "Daftar Usaha", icon: Store },
  { to: "/operator", label: "Pengelola", icon: Building2 },
  { to: "/history", label: "Riwayat", icon: History },
];

export function SigapHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const path = router.state.location.pathname;
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo.url} alt="Sigap Wisata" className="h-9 w-9 rounded-lg object-cover ring-1 ring-border" />
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">SIGAP WISATA</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Navigasi · Tiket · Harga
            </div>
          </div>
        </Link>
        <nav className="ml-4 hidden gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="text-xs text-muted-foreground">Halo,</div>
                <div className="text-sm font-medium">{user.name}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  clearSession();
                  router.navigate({ to: "/" });
                }}
                aria-label="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-2 pb-2 md:hidden">
        {nav.map((n) => {
          const active = path === n.to || path.startsWith(n.to + "/");
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

export function SigapLayout({ children, requireAuth }: { children: ReactNode; requireAuth?: boolean }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sync = () => setUser(getSession());
    sync();
    setReady(true);
    window.addEventListener("sigap:session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sigap:session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (ready && requireAuth && !user) {
      router.navigate({ to: "/auth" });
    }
  }, [ready, requireAuth, user, router]);

  return (
    <div className="min-h-screen bg-background">
      <SigapHeader user={user} />
      <main>{children}</main>
      <footer className="mt-16 border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="" className="h-6 w-6 rounded object-cover" />
            <span>© {new Date().getFullYear()} Sigap Wisata — Platform Nasional Wisata Indonesia</span>
          </div>
          <div>Data: BMKG SIDARMA-NOWCAST · INA-WIS · MobileNet-SSD Sensor Gateway</div>
        </div>
      </footer>
    </div>
  );
}
