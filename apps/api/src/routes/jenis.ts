import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { jenisTable } from "../db/schema";
import { Validator } from "../utils/validation";
import { handleAnyError } from "../errors/app_error";
import type { Env, Variables } from "../types";

export const jenisApp = new Hono<{ Bindings: Env; Variables: Variables }>();

jenisApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const data = await db
      .select()
      .from(jenisTable)
      .where(eq(jenisTable.isDeleted, 0))
      .all();
    return c.json({
      success: true,
      message: "Berhasil mengembil semua jenis.",
      data,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

jenisApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{ name?: string }>();
    const v = new Validator();
    v.required(body.name, "name", "Nama jenis harus diisi.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [newJenis] = await db
      .insert(jenisTable)
      .values({ name: body.name! })
      .returning();

    return c.json(
      { success: true, message: `Berhasil jenis ${body.name}`, data: newJenis },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});

jenisApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{ name?: string }>();
    const v = new Validator();
    v.required(body.name, "name", "Nama jenis harus diisi.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [updated] = await db
      .update(jenisTable)
      .set({ name: body.name!, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(jenisTable.id, id))
      .returning();

    if (!updated) {
      return c.json(
        { success: false, message: `Jenis dengan id ${id} tidak ditemukan.` },
        400,
      );
    }

    return c.json({
      success: true,
      message: `Berhasil memperbarui jenis: ${body.name} -> ${updated.name}`,
      data: updated,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

jenisApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const [deleted] = await db
      .update(jenisTable)
      .set({ isDeleted: 1, updatedAt: Math.floor(Date.now() / 1000) })
      .where(and(eq(jenisTable.id, id), eq(jenisTable.isDeleted, 0)))
      .returning();

    if (!deleted) {
      return c.json(
        { success: false, message: `Jenis dengan id ${id} tidak ditemukan.` },
        400,
      );
    }

    return c.json({
      success: true,
      message: `Berhasil menghapus jenis: ${deleted.name}`,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
