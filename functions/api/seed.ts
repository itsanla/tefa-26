import type { Env } from "../types";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../../drizzle/schema";
import { hashPassword, jsonResponse, errorResponse, getAuthUser } from "../auth-utils";
import { eq } from "drizzle-orm";

// POST /api/seed — Seed initial admin account (run once)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = drizzle(context.env.DB);

  try {
    // Check if admin already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (existing) {
      return errorResponse("Admin sudah ada, seed tidak diperlukan", 409);
    }

    const now = new Date().toISOString();
    const adminHash = await hashPassword("admin123");
    const guruHash = await hashPassword("guru123");

    // Create admin
    await db.insert(users).values({
      username: "admin",
      password_hash: adminHash,
      nama_lengkap: "Administrator",
      role: "admin",
      created_at: now,
      updated_at: now,
    });

    // Create a sample guru
    await db.insert(users).values({
      username: "guru1",
      password_hash: guruHash,
      nama_lengkap: "Budi Santoso, S.Pd",
      role: "guru",
      created_at: now,
      updated_at: now,
    });

    return jsonResponse({
      success: true,
      message: "Seed berhasil! Admin: admin/admin123, Guru: guru1/guru123",
    });
  } catch (err) {
    console.error("Seed error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
