import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type,x-mitrapoin-key",
};

export const Route = createFileRoute("/api/public/destinations/$id")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params }) => {
        const { mitrapoinStore } = await import("@/lib/mitrapoin-store.server");
        const data = mitrapoinStore.get(params.id);
        return Response.json(
          { id: params.id, override: data },
          { headers: CORS },
        );
      },
      POST: async ({ request, params }) => {
        const { mitrapoinStore, MITRAPOIN_API_KEY } = await import(
          "@/lib/mitrapoin-store.server"
        );
        const key = request.headers.get("x-mitrapoin-key");
        if (key !== MITRAPOIN_API_KEY) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json", ...CORS },
          });
        }
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ error: "invalid_json" }), {
            status: 400,
            headers: { "content-type": "application/json", ...CORS },
          });
        }
        const payload = {
          ticketPrice: numOrUndef(body.ticketPrice),
          capacity: numOrUndef(body.capacity),
          occupancy: numOrUndef(body.occupancy),
          weatherNote:
            typeof body.weatherNote === "string" ? body.weatherNote : undefined,
          facilities: Array.isArray(body.facilities)
            ? (body.facilities as unknown[])
                .map((f) => {
                  const r = f as Record<string, unknown>;
                  return {
                    name: String(r.name ?? ""),
                    price: Number(r.price ?? 0),
                    unit: String(r.unit ?? ""),
                  };
                })
                .filter((f) => f.name)
            : undefined,
          menu: Array.isArray(body.menu)
            ? (body.menu as unknown[])
                .map((m) => {
                  const r = m as Record<string, unknown>;
                  return {
                    name: String(r.name ?? ""),
                    price: Number(r.price ?? 0),
                  };
                })
                .filter((m) => m.name)
            : undefined,
          bookingsSummary: body.bookingsSummary as
            | { total: number; paid: number; pending: number; revenue: number }
            | undefined,
          updatedAt: new Date().toISOString(),
        };
        mitrapoinStore.set(params.id, payload);
        return Response.json(
          { ok: true, id: params.id, override: payload },
          { headers: CORS },
        );
      },
    },
  },
});

function numOrUndef(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
