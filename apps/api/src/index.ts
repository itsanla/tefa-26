import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env, Variables } from "./types";
import { isRole, jwtCheckToken } from "./middlewares/auth";
import { authApp } from "./routes/auth";
import { usersApp } from "./routes/users";
import { jenisApp } from "./routes/jenis";
import { komoditasApp } from "./routes/komoditas";
import { barangApp } from "./routes/barang";
import { transaksiBarangApp } from "./routes/transaksi_barang";
import { produksiApp } from "./routes/produksi";
import { penjualanApp } from "./routes/penjualan";
import { asalProduksiApp } from "./routes/asal_produksi";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", logger());
app.use("*", async (c, next) => {
  const mw = cors({
    origin: (origin) => {
      // Split ALLOWED_ORIGINS by comma if exists, otherwise use FRONTEND_URL
      const allowedOrigins = c.env.ALLOWED_ORIGINS 
        ? c.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : [c.env.FRONTEND_URL].filter(Boolean);
      
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "*";
    },
    credentials: true,
  });
  return mw(c, next);
});

const api = new Hono<{ Bindings: Env; Variables: Variables }>();

api.get("/test", (c) => c.json({ message: "Test" }));
api.route("/auth", authApp);
api.route("/komoditas", komoditasApp);

api.use("/users/*", jwtCheckToken, isRole(["admin"]));
api.route("/users", usersApp);

api.use("/jenis/*", jwtCheckToken, isRole(["admin", "guru"]));
api.route("/jenis", jenisApp);

api.use("/barang/*", jwtCheckToken, isRole(["admin", "guru"]));
api.route("/barang", barangApp);

api.use("/transaksi-barang/*", jwtCheckToken, isRole(["admin", "guru"]));
api.route("/transaksi-barang", transaksiBarangApp);

api.use("/produksi/*", jwtCheckToken, isRole(["admin", "guru", "siswa"]));
api.route("/produksi", produksiApp);

api.use("/penjualan/*", jwtCheckToken, isRole(["admin", "guru", "siswa"]));
api.route("/penjualan", penjualanApp);

api.use("/asal-produksi/*", jwtCheckToken, isRole(["admin", "guru"]));
api.route("/asal-produksi", asalProduksiApp);

app.get("/", (c) => c.text("Hello Cloudflare Workers!"));
app.route("/api", api);

export default app;
