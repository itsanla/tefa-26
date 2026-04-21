import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  asalProduksiTable,
  jenisTable,
  komoditasTable,
  penjualanTable,
  produksiTable,
} from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import { convertTimestamps } from "../utils/date";
import type { Env, Variables } from "../types";

export const penjualanApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

penjualanApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const rows = await db
      .select()
      .from(penjualanTable)
      .orderBy(desc(penjualanTable.createdAt))
      .all();

    const data = await Promise.all(
      rows.map(async (p) => {
        const komoditas = await db
          .select()
          .from(komoditasTable)
          .where(eq(komoditasTable.id, p.id_komodity))
          .get();

        let komoditasWithJenis: unknown = komoditas;
        if (komoditas) {
          const jenis = await db
            .select()
            .from(jenisTable)
            .where(eq(jenisTable.id, komoditas.id_jenis))
            .get();
          komoditasWithJenis = { ...komoditas, jenis };
        }

        const produksi = await db
          .select()
          .from(produksiTable)
          .where(eq(produksiTable.id, p.id_produksi))
          .get();

        let produksiWithAsal: unknown = produksi;
        if (produksi) {
          const asal = await db
            .select()
            .from(asalProduksiTable)
            .where(eq(asalProduksiTable.id, produksi.id_asal))
            .get();
          produksiWithAsal = { ...produksi, asal_produksi: asal };
        }

        return convertTimestamps({
          ...p,
          komoditas: komoditasWithJenis,
          produksi: produksiWithAsal,
        });
      }),
    );

    return c.json({
      success: true,
      message: "Berhasil mendapatkan data penjualan",
      data,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      keterangan?: string;
      id_komodity?: number | string;
      id_produksi?: number | string;
      jumlah_terjual?: number | string;
      total_harga?: number | string;
    }>();

    const v = new Validator();
    v.required(body.id_komodity, "id_komodity", "ID Komoditas harus diisi.");
    v.isIntGt(body.id_komodity, 0, "id_komodity", "ID Komoditas harus berupa angka.");
    v.required(body.id_produksi, "id_produksi", "ID Produksi harus diisi.");
    v.isIntGt(body.id_produksi, 0, "id_produksi", "ID Produksi harus berupa angka.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const id_komodity = Number(body.id_komodity);
    const id_produksi = Number(body.id_produksi);
    const jumlah_terjual = Number(body.jumlah_terjual);
    const total_harga = Number(body.total_harga);
    const keterangan = body.keterangan ?? "";

    const db = getDb(c.env);

    const komoditas = await db
      .select()
      .from(komoditasTable)
      .where(eq(komoditasTable.id, id_komodity))
      .get();
    if (!komoditas) throw new AppError("Komoditas tidak ditemukan", 404);
    if (komoditas.jumlah < jumlah_terjual)
      throw new AppError("Stok komoditas tidak mencukupi", 400);

    const produksi = await db
      .select()
      .from(produksiTable)
      .where(eq(produksiTable.id, id_produksi))
      .get();
    if (!produksi) throw new AppError("Produksi tidak ditemukan", 404);
    if (produksi.jumlah < jumlah_terjual)
      throw new AppError("Stok produksi tidak mencukupi", 400);

    await db
      .update(komoditasTable)
      .set({
        jumlah: komoditas.jumlah - jumlah_terjual,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(komoditasTable.id, id_komodity));

    await db
      .update(produksiTable)
      .set({
        jumlah: produksi.jumlah - jumlah_terjual,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(produksiTable.id, id_produksi));

    const [newPenjualan] = await db
      .insert(penjualanTable)
      .values({
        keterangan,
        id_komodity,
        id_produksi,
        jumlah_terjual,
        total_harga,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "Berhasil menambahkan data penjualan",
        data: convertTimestamps(newPenjualan),
      },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});
