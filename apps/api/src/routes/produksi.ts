import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  asalProduksiTable,
  komoditasTable,
  penjualanTable,
  produksiTable,
} from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import { convertTimestamps } from "../utils/date";
import type { Env, Variables } from "../types";

export const produksiApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

produksiApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const produksis = await db
      .select()
      .from(produksiTable)
      .orderBy(desc(produksiTable.createdAt))
      .all();

    const data = await Promise.all(
      produksis.map(async (p) => {
        const [asal, komoditas, penjualans] = await Promise.all([
          db
            .select()
            .from(asalProduksiTable)
            .where(eq(asalProduksiTable.id, p.id_asal))
            .get(),
          p.id_komoditas
            ? db
                .select()
                .from(komoditasTable)
                .where(eq(komoditasTable.id, p.id_komoditas))
                .get()
            : Promise.resolve(null),
          db
            .select()
            .from(penjualanTable)
            .where(eq(penjualanTable.id_produksi, p.id))
            .all(),
        ]);
        return convertTimestamps({ ...p, asal_produksi: asal, komoditas, penjualans });
      }),
    );

    return c.json({
      success: true,
      message: "Berhasil mengambil semua data produksi.",
      data,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

produksiApp.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const produksi = await db
      .select()
      .from(produksiTable)
      .where(eq(produksiTable.id, id))
      .get();
    if (!produksi) throw new AppError("Produksi tidak ditemukan", 404);

    const [asal, penjualans] = await Promise.all([
      db
        .select()
        .from(asalProduksiTable)
        .where(eq(asalProduksiTable.id, produksi.id_asal))
        .get(),
      db
        .select()
        .from(penjualanTable)
        .where(eq(penjualanTable.id_produksi, produksi.id))
        .all(),
    ]);

    return c.json({
      success: true,
      message: `Berhasil mengambil data produksi dengan id ${id}`,
      data: convertTimestamps({ ...produksi, asal_produksi: asal, penjualans }),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

produksiApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      id_asal?: number | string;
      id_komoditas?: number | string;
      kode_produksi?: string;
      ukuran?: string;
      kualitas?: string;
      jumlah_diproduksi?: number | string;
      harga_persatuan?: number | string;
    }>();

    const v = new Validator();
    v.required(body.id_asal, "id_asal", "ID asal produksi wajib diisi");
    v.isIntGt(body.id_asal, 0, "id_asal", "ID asal produksi harus berupa angka positif");
    v.required(body.kode_produksi, "kode_produksi", "Kode produksi wajib diisi");
    v.required(body.ukuran, "ukuran", "Ukuran wajib diisi");
    v.required(body.kualitas, "kualitas", "Kualitas wajib diisi");

    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const id_asal = Number(body.id_asal);
    const id_komoditas = Number(body.id_komoditas);
    const jumlah_diproduksi = Number(body.jumlah_diproduksi);
    const harga_persatuan = Number(body.harga_persatuan);

    if (
      !Number.isFinite(jumlah_diproduksi) ||
      jumlah_diproduksi <= 0
    ) {
      throw new AppError("Jumlah diproduksi harus berupa angka > 0", 400);
    }
    if (!Number.isFinite(harga_persatuan) || harga_persatuan <= 0) {
      throw new AppError("Harga persatuan harus berupa angka >= 0", 400);
    }

    const db = getDb(c.env);

    const komoditas = await db
      .select()
      .from(komoditasTable)
      .where(eq(komoditasTable.id, id_komoditas))
      .get();
    if (!komoditas) throw new AppError("Komoditas tidak ditemukan", 404);

    await db
      .update(komoditasTable)
      .set({
        jumlah: sql`${komoditasTable.jumlah} + ${jumlah_diproduksi}`,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(komoditasTable.id, id_komoditas));

    const [newProduksi] = await db
      .insert(produksiTable)
      .values({
        id_asal,
        id_komoditas,
        kode_produksi: body.kode_produksi!,
        ukuran: body.ukuran!,
        kualitas: body.kualitas!,
        jumlah: jumlah_diproduksi,
        harga_persatuan,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: `Berhasil menambahkan produksi: ${newProduksi.kode_produksi}`,
        data: convertTimestamps(newProduksi),
      },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});

produksiApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{
      id_asal?: number | string;
      kode_produksi?: string;
      ukuran?: string;
      kualitas?: string;
      jumlah_diproduksi?: number | string;
      harga_persatuan?: number | string;
    }>();

    const v = new Validator();
    v.required(body.id_asal, "id_asal", "ID asal produksi wajib diisi");
    v.isIntGt(body.id_asal, 0, "id_asal");
    v.required(body.kode_produksi, "kode_produksi");
    v.required(body.ukuran, "ukuran");
    v.required(body.kualitas, "kualitas");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const produksi = await db
      .select()
      .from(produksiTable)
      .where(eq(produksiTable.id, id))
      .get();
    if (!produksi) throw new AppError("Produksi tidak ditemukan", 404);

    const jumlah = Number(body.jumlah_diproduksi);
    const harga_persatuan = Number(body.harga_persatuan);

    if (produksi.id_komoditas) {
      const komoditas = await db
        .select()
        .from(komoditasTable)
        .where(eq(komoditasTable.id, produksi.id_komoditas))
        .get();
      if (!komoditas) throw new AppError("Komoditas tidak ditemukan", 404);

      const selisih = jumlah - produksi.jumlah;
      if (selisih !== 0) {
        await db
          .update(komoditasTable)
          .set({
            jumlah: sql`${komoditasTable.jumlah} + ${selisih}`,
            updatedAt: Math.floor(Date.now() / 1000),
          })
          .where(eq(komoditasTable.id, produksi.id_komoditas));
      }
    }

    const [updated] = await db
      .update(produksiTable)
      .set({
        id_asal: Number(body.id_asal),
        kode_produksi: body.kode_produksi!,
        ukuran: body.ukuran!,
        kualitas: body.kualitas!,
        jumlah,
        harga_persatuan,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(produksiTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil memperbarui produksi: ${body.kode_produksi} -> ${updated.kode_produksi}`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

produksiApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const produksi = await db
      .select()
      .from(produksiTable)
      .where(eq(produksiTable.id, id))
      .get();
    if (!produksi) throw new AppError("Produksi tidak ditemukan", 404);

    if (produksi.id_komoditas) {
      await db
        .update(komoditasTable)
        .set({
          jumlah: sql`${komoditasTable.jumlah} - ${produksi.jumlah}`,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(komoditasTable.id, produksi.id_komoditas));
    }

    const [deleted] = await db
      .delete(produksiTable)
      .where(eq(produksiTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil menghapus produksi: ${deleted.kode_produksi}`,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
