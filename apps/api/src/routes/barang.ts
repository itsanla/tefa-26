import { Hono } from "hono";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { barangTable, transaksiBarangTable } from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import type { Env, Variables } from "../types";
import { convertTimestamps } from "../utils/date";

export const barangApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

barangApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const barangs = await db.select().from(barangTable).all();

    const data = await Promise.all(
      barangs.map(async (b) => {
        const transaksis = await db
          .select()
          .from(transaksiBarangTable)
          .where(eq(transaksiBarangTable.id_barang, b.id))
          .orderBy(asc(transaksiBarangTable.tanggal))
          .all();
        const jumlah = transaksis.reduce(
          (sum, t) => sum + t.masuk - t.keluar,
          0,
        );
        return convertTimestamps({ ...b, TransaksiBarang: transaksis, jumlah });
      }),
    );

    return c.json({
      success: true,
      message: "Berhasil mendapatkan data barang",
      data,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

barangApp.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const barang = await db
      .select()
      .from(barangTable)
      .where(eq(barangTable.id, id))
      .get();
    if (!barang) throw new AppError(`Barang dengan id: ${id}, tidak tersedia.`);
    return c.json({
      success: true,
      message: `Berhasil mendapatkan data barang dengan id ${id}`,
      data: convertTimestamps(barang),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

barangApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{ nama?: string; satuan?: string }>();
    const v = new Validator();
    v.required(body.nama, "nama", "Nama barang harus diisi.");
    v.required(body.satuan, "satuan", "Satuan barang harus diisi.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [newBarang] = await db
      .insert(barangTable)
      .values({ nama: body.nama!, satuan: body.satuan! })
      .returning();

    return c.json({
      success: true,
      message: `Berhasil menambahkan barang: ${newBarang.nama}.`,
      data: convertTimestamps(newBarang),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

barangApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{ nama?: string; satuan?: string }>();
    const v = new Validator();
    v.required(body.nama, "nama", "Nama barang harus diisi.");
    v.required(body.satuan, "satuan", "Satuan barang harus diisi.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [updated] = await db
      .update(barangTable)
      .set({
        nama: body.nama!,
        satuan: body.satuan!,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(barangTable.id, id))
      .returning();

    if (!updated)
      throw new AppError(`Barang dengan id: ${id}, tidak tersedia.`);

    return c.json({
      success: true,
      message: `Berhasil mengupdate barang: ${updated.nama}.`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

barangApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(barangTable)
      .where(eq(barangTable.id, id))
      .get();
    if (!existing)
      throw new AppError(`Barang dengan id: ${id}, tidak tersedia.`);

    const [deleted] = await db
      .delete(barangTable)
      .where(eq(barangTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil menghapus barang: ${deleted.nama}.`,
      data: convertTimestamps(deleted),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
