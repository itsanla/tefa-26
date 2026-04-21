import { Hono } from "hono";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "../db";
import { roleEnum, usersTable } from "../db/schema";
import { hashPassword } from "../utils/password";
import { Validator } from "../utils/validation";
import { handleAnyError } from "../errors/app_error";
import type { Env, Variables } from "../types";
import { convertTimestamps, convertTimestampsArray } from "../utils/date";


export const usersApp = new Hono<{ Bindings: Env; Variables: Variables }>();

usersApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const users = await db.select().from(usersTable).all();
    return c.json({
      success: true,
      message: "Mendapatkan data user.",
      data: convertTimestampsArray(users),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

usersApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      email?: string;
      nama?: string;
      password?: string;
      role?: string;
    }>();
    const { email, nama, password, role } = body;

    const v = new Validator();
    v.required(email, "email");
    v.isEmail(email, "email");
    v.required(nama, "nama");
    v.required(password, "password");
    v.required(role, "role");
    v.isIn(role, roleEnum, "role");

    const db = getDb(c.env);

    if (email) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .get();
      if (existing) {
        v.check(false, "email", "Email sudah tersedia.");
      }
    }

    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const hashed = await hashPassword(password!);
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: email!,
        nama: nama!,
        password: hashed,
        role: role as (typeof roleEnum)[number],
      })
      .returning();

    return c.json({
      success: true,
      message: `Berhasil manambahkan user: ${newUser.nama}.`,
      data: convertTimestamps(newUser),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

usersApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{
      email?: string;
      nama?: string;
      password?: string;
      role?: string;
    }>();
    const { email, nama, password, role } = body;

    const v = new Validator();
    v.required(email, "email");
    v.isEmail(email, "email");
    v.required(nama, "nama");
    v.required(role, "role");
    v.isIn(role, roleEnum, "role");
    if (password !== undefined) v.required(password, "password");

    const db = getDb(c.env);
    if (email) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.email, email), ne(usersTable.id, id)))
        .get();
      if (existing) v.check(false, "email", "Email sudah tersedia.");
    }

    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const update: Record<string, unknown> = {
      email,
      nama,
      role,
      updatedAt: Math.floor(Date.now() / 1000),
    };
    if (password) update.password = await hashPassword(password);

    const [updated] = await db
      .update(usersTable)
      .set(update)
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      return c.json(
        { success: false, message: `User dengan id: ${id}, tidak tersedia.` },
        400,
      );
    }

    return c.json({
      success: true,
      message: `Berhasil mengupdate user: ${updated.nama}.`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

usersApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const authUser = c.get("user");

    if (authUser?.id === id) {
      return c.json(
        { success: false, message: "Tidak bisa menghapus akun sendiri." },
        400,
      );
    }

    const db = getDb(c.env);
    const [deleted] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();

    if (!deleted) {
      return c.json(
        { success: false, message: `User dengan id: ${id}, tidak tersedia.` },
        400,
      );
    }

    return c.json({
      success: true,
      message: `Berhasil menghapus user: ${deleted.nama}`,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
