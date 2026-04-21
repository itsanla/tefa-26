import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { asalProduksiTable } from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import { convertTimestamps } from "../utils/date";
import type { Env, Variables } from "../types";

export const asalProduksiApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

asalProduksiApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const data = await db
      .select()
      .from(asalProduksiTable)
      .orderBy(desc(asalProduksiTable.createdAt))
      .all()
      .then(rows => rows.map(convertTimestamps));
    return c.json({
      success: true,
      message: "Berhasil mengambil semua asal produksi.",
      data,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

asalProduksiApp.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const row = await db
      .select()
      .from(asalProduksiTable)
      .where(eq(asalProduksiTable.id, id))
      .get();

    if (!row) {
      return c.json(
        { success: false, message: "Asal produksi tidak ditemukan." },
        404,
      );
    }

    return c.json({
      success: true,
      message: `Berhasil mengambil asal produksi dengan ID ${id}.`,
      data: convertTimestamps(row),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

asalProduksiApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{ nama?: string }>();
    const v = new Validator();
    v.required(body.nama, "nama", "Nama asal produksi wajib diisi");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [newData] = await db
      .insert(asalProduksiTable)
      .values({ nama: body.nama! })
      .returning();

    return c.json(
      {
        success: true,
        message: `Berhasil menambahkan asal produksi: ${newData.nama}`,
        data: convertTimestamps(newData),
      },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});

asalProduksiApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{ nama?: string }>();
    const v = new Validator();
    v.required(body.nama, "nama", "Nama asal produksi wajib diisi");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(asalProduksiTable)
      .where(eq(asalProduksiTable.id, id))
      .get();
    if (!existing) throw new AppError("Asal produksi tidak ditemukan", 404);

    const [updated] = await db
      .update(asalProduksiTable)
      .set({ nama: body.nama!, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(asalProduksiTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil memperbarui asal produksi: ${updated.nama}`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

asalProduksiApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const [deleted] = await db
      .delete(asalProduksiTable)
      .where(eq(asalProduksiTable.id, id))
      .returning();

    if (!deleted) throw new AppError("Asal produksi tidak ditemukan", 404);

    return c.json({
      success: true,
      message: `Berhasil menghapus asal produksi: ${deleted.nama}`,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
