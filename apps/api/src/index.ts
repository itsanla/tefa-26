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
import { preferenceApp } from "./routes/preference";
import { analyticsApp } from "./routes/analytics";
import { bahanBakuApp } from "./routes/bahan_baku";
import { stokVariabelApp } from "./routes/stok_variabel";

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

api.use("/jenis/*", jwtCheckToken, isRole(["admin", "guru", "kepsek"]));
api.route("/jenis", jenisApp);

api.use("/barang/*", jwtCheckToken, isRole(["admin", "guru", "kepsek"]));
api.route("/barang", barangApp);

api.use("/transaksi-barang/*", jwtCheckToken, isRole(["admin", "guru", "kepsek"]));
api.route("/transaksi-barang", transaksiBarangApp);

api.use("/produksi/*", jwtCheckToken, isRole(["admin", "guru", "siswa", "kepsek"]));
api.route("/produksi", produksiApp);

api.use("/stok-variabel/*", jwtCheckToken, isRole(["admin", "guru", "siswa", "kepsek"]));
api.route("/stok-variabel", stokVariabelApp);

api.use("/penjualan/*", jwtCheckToken, isRole(["admin", "guru", "siswa", "kepsek"]));
api.route("/penjualan", penjualanApp);

api.use("/asal-produksi/*", jwtCheckToken, isRole(["admin", "guru", "kepsek"]));
api.route("/asal-produksi", asalProduksiApp);

api.use("/user/preference/*", jwtCheckToken);
api.route("/user/preference", preferenceApp);

api.use("/analytics/*", jwtCheckToken, isRole(["admin", "guru", "kepsek"]));
api.route("/analytics", analyticsApp);

api.use("/bahan-baku/*", jwtCheckToken, isRole(["admin", "guru", "kepsek"]));
api.route("/bahan-baku", bahanBakuApp);

app.get("/", (c) => c.text("Hello Cloudflare Workers!"));
app.route("/api", api);

export default app;
