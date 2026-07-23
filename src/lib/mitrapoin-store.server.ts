// In-memory store for the MitraPoin ↔ Sigap Wisata API gateway.
// Ephemeral (per worker instance) — good enough for demo/preview.

export type FacilityRow = { name: string; price: number; unit: string };
export type MenuRow = { name: string; price: number };

export type DestinationOverride = {
  ticketPrice?: number;
  capacity?: number;
  occupancy?: number;
  weatherNote?: string;
  facilities?: FacilityRow[];
  menu?: MenuRow[];
  bookingsSummary?: {
    total: number;
    paid: number;
    pending: number;
    revenue: number;
  };
  updatedAt: string;
};

const globalKey = "__mitrapoin_store__";
type G = typeof globalThis & { [globalKey]?: Map<string, DestinationOverride> };

function store(): Map<string, DestinationOverride> {
  const g = globalThis as G;
  if (!g[globalKey]) g[globalKey] = new Map();
  return g[globalKey]!;
}

export const mitrapoinStore = {
  get(id: string) {
    return store().get(id) ?? null;
  },
  set(id: string, data: DestinationOverride) {
    store().set(id, data);
  },
  all() {
    return Object.fromEntries(store().entries());
  },
};

export const MITRAPOIN_API_KEY =
  process.env.MITRAPOIN_API_KEY || "mp_demo_sigap_2026";
