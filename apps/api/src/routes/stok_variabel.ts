import { Hono } from "hono";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  komoditasTable,
  produksiTable,
  stokHistoriProduksiTable,
  stokVariabelTable,
} from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import { convertTimestamps } from "../utils/date";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import type { Env, Variables } from "../types";

export const stokVariabelApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

stokVariabelApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const { page, pageSize, offset } = parsePagination(c.req.query());

    const totalRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(stokVariabelTable)
      .where(eq(stokVariabelTable.isDeleted, 0))
      .get();
    const totalItems = Number(totalRow?.count ?? 0);

    const variabels = await db
      .select()
      .from(stokVariabelTable)
      .where(eq(stokVariabelTable.isDeleted, 0))
      .orderBy(desc(stokVariabelTable.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    const data = await Promise.all(
      variabels.map(async (variabel) => {
        const usageRow = await db
          .select({ count: sql<number>`count(*)` })
          .from(produksiTable)
          .where(eq(produksiTable.id_stok_variabel, variabel.id))
          .get();
        return convertTimestamps({
          ...variabel,
          jumlah_produksi: Number(usageRow?.count ?? 0),
        });
      }),
    );

    return c.json({
      success: true,
      message: "Berhasil mengambil semua variabel stok.",
      data,
      meta: buildPaginationMeta(page, pageSize, totalItems),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

stokVariabelApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{ nama?: string; jumlah?: number | string }>();
    const v = new Validator();
    v.required(body.nama, "nama", "Nama variabel stok wajib diisi.");
    v.isIntGte(body.jumlah ?? 0, 0, "jumlah", "Jumlah harus berupa angka >= 0.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [created] = await db
      .insert(stokVariabelTable)
      .values({
        nama: body.nama!.trim(),
        jumlah: Number(body.jumlah ?? 0),
      })
      .returning();

    return c.json(
      {
        success: true,
        message: `Berhasil menambahkan variabel stok: ${created.nama}`,
        data: convertTimestamps(created),
      },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});

stokVariabelApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{ nama?: string; jumlah?: number | string }>();
    const v = new Validator();
    v.required(body.nama, "nama", "Nama variabel stok wajib diisi.");
    v.isIntGte(body.jumlah ?? 0, 0, "jumlah", "Jumlah harus berupa angka >= 0.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const now = Math.floor(Date.now() / 1000);

    const existing = await db
      .select()
      .from(stokVariabelTable)
      .where(and(eq(stokVariabelTable.id, id), eq(stokVariabelTable.isDeleted, 0)))
      .get();
    if (!existing) throw new AppError("Variabel stok tidak ditemukan", 404);

    const newJumlah = Number(body.jumlah ?? 0);
    const delta = newJumlah - existing.jumlah;

    const [updated] = await db
      .update(stokVariabelTable)
      .set({ nama: body.nama!.trim(), jumlah: newJumlah, updatedAt: now })
      .where(eq(stokVariabelTable.id, id))
      .returning();

    // Sync every produksi linked to this variabel to the new shared value.
    const linked = await db
      .select()
      .from(produksiTable)
      .where(eq(produksiTable.id_stok_variabel, id))
      .all();

    if (delta !== 0 && linked.length > 0) {
      for (const p of linked) {
        await db
          .update(produksiTable)
          .set({ jumlah: newJumlah, updatedAt: now })
          .where(eq(produksiTable.id, p.id));

        if (p.id_komoditas) {
          await db
            .update(komoditasTable)
            .set({
              jumlah: sql`${komoditasTable.jumlah} + ${delta}`,
              updatedAt: now,
            })
            .where(eq(komoditasTable.id, p.id_komoditas));
        }

        await db.insert(stokHistoriProduksiTable).values({
          id_produksi: p.id,
          kode_produksi: p.kode_produksi,
          jumlah_sebelum: p.jumlah,
          jumlah_sesudah: newJumlah,
          selisih: delta,
          tipe: delta > 0 ? "tambah" : "kurang",
          keterangan: `Sinkronisasi variabel stok: ${updated.nama}`,
        });
      }
    }

    return c.json({
      success: true,
      message: `Berhasil memperbarui variabel stok: ${updated.nama}`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

stokVariabelApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const now = Math.floor(Date.now() / 1000);

    const existing = await db
      .select()
      .from(stokVariabelTable)
      .where(and(eq(stokVariabelTable.id, id), eq(stokVariabelTable.isDeleted, 0)))
      .get();
    if (!existing) throw new AppError("Variabel stok tidak ditemukan", 404);

    // Detach produksi so they keep their current stock as a manual value.
    await db
      .update(produksiTable)
      .set({ id_stok_variabel: null, updatedAt: now })
      .where(eq(produksiTable.id_stok_variabel, id));

    await db
      .update(stokVariabelTable)
      .set({ isDeleted: 1, updatedAt: now })
      .where(eq(stokVariabelTable.id, id));

    return c.json({
      success: true,
      message: `Berhasil menghapus variabel stok: ${existing.nama}`,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
