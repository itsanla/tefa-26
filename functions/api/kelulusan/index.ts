import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { siswa, kelulusan } from "../../../drizzle/schema";
import { getAuthUser, jsonResponse, errorResponse } from "../../auth-utils";

// GET /api/kelulusan — Get kelulusan data for logged-in siswa
// POST /api/kelulusan — Set/update kelulusan (Admin only)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);

  const db = drizzle(context.env.DB);

  try {
    if (user.role === "siswa") {
      // Get siswa record linked to this user
      const [siswaRecord] = await db
        .select()
        .from(siswa)
        .where(eq(siswa.user_id, user.sub))
        .limit(1);

      if (!siswaRecord) {
        return errorResponse("Data siswa tidak ditemukan", 404);
      }

      const [kelulusanRecord] = await db
        .select()
        .from(kelulusan)
        .where(eq(kelulusan.siswa_id, siswaRecord.id))
        .limit(1);

      return jsonResponse({
        siswa: siswaRecord,
        kelulusan: kelulusanRecord || null,
      });
    }

    // Admin/Guru: get by siswa_id query param
    const url = new URL(context.request.url);
    const siswaId = url.searchParams.get("siswa_id");

    if (siswaId) {
      const [record] = await db
        .select()
        .from(kelulusan)
        .where(eq(kelulusan.siswa_id, parseInt(siswaId)))
        .limit(1);

      return jsonResponse({ data: record || null });
    }

    return errorResponse("Parameter siswa_id dibutuhkan", 400);
  } catch (err) {
    console.error("Get kelulusan error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);
  if (user.role !== "admin") return errorResponse("Forbidden", 403);

  try {
    const body = (await context.request.json()) as {
      siswa_id: number;
      status: "lulus" | "tidak_lulus";
      nilai_rata_rata?: number;
      nilai_ujian?: number;
      nilai_sikap?: string;
      keterangan?: string;
    };

    if (!body.siswa_id || !body.status) {
      return errorResponse("siswa_id dan status harus diisi", 400);
    }

    const db = drizzle(context.env.DB);
    const now = new Date().toISOString();

    // Check if kelulusan exists
    const [existing] = await db
      .select()
      .from(kelulusan)
      .where(eq(kelulusan.siswa_id, body.siswa_id))
      .limit(1);

    if (existing) {
      await db
        .update(kelulusan)
        .set({
          status: body.status,
          nilai_rata_rata: body.nilai_rata_rata ?? null,
          nilai_ujian: body.nilai_ujian ?? null,
          nilai_sikap: body.nilai_sikap ?? null,
          keterangan: body.keterangan ?? null,
          tanggal_pengumuman: now,
          updated_at: now,
        })
        .where(eq(kelulusan.siswa_id, body.siswa_id));
    } else {
      await db.insert(kelulusan).values({
        siswa_id: body.siswa_id,
        status: body.status,
        nilai_rata_rata: body.nilai_rata_rata ?? null,
        nilai_ujian: body.nilai_ujian ?? null,
        nilai_sikap: body.nilai_sikap ?? null,
        keterangan: body.keterangan ?? null,
        tanggal_pengumuman: now,
        created_at: now,
        updated_at: now,
      });
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("Set kelulusan error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
