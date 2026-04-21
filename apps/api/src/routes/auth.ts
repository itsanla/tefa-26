import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { usersTable } from "../db/schema";
import { verifyPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { Validator } from "../utils/validation";
import { handleAnyError } from "../errors/app_error";
import type { Env, Variables } from "../types";

export const authApp = new Hono<{ Bindings: Env; Variables: Variables }>();

authApp.post("/login", async (c) => {
  try {
    const body = await c.req.json<{ email?: string; password?: string }>();
    const { email, password } = body;

    const v = new Validator();
    v.required(email, "email");
    v.required(password, "password");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email!))
      .get();

    const passwordOk = user
      ? await verifyPassword(password!, user.password)
      : false;

    if (!user || !passwordOk) {
      return c.json(
        { success: false, message: "Login gagal, cek email dan password." },
        400,
      );
    }

    const token = await generateToken(
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      c.env.JWT_SECRET,
    );

    return c.json({
      success: true,
      message: "Login berhasil",
      data: { token, user },
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
