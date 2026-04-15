import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { siswa, kelulusan, users } from "../../../drizzle/schema";
import { getAuthUser, jsonResponse, errorResponse } from "../../auth-utils";

// GET /api/siswa/:id — Get siswa detail
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);

  const id = parseInt(context.params.id as string);
  if (isNaN(id)) return errorResponse("Invalid ID", 400);

  const db = drizzle(context.env.DB);

  try {
    const [record] = await db
      .select({
        id: siswa.id,
        nisn: siswa.nisn,
        nama: siswa.nama,
        kelas: siswa.kelas,
        jurusan: siswa.jurusan,
        tahun_ajaran: siswa.tahun_ajaran,
        tempat_lahir: siswa.tempat_lahir,
        tanggal_lahir: siswa.tanggal_lahir,
        jenis_kelamin: siswa.jenis_kelamin,
        user_id: siswa.user_id,
        status_kelulusan: kelulusan.status,
        nilai_rata_rata: kelulusan.nilai_rata_rata,
        nilai_ujian: kelulusan.nilai_ujian,
        nilai_sikap: kelulusan.nilai_sikap,
        keterangan: kelulusan.keterangan,
        tanggal_pengumuman: kelulusan.tanggal_pengumuman,
      })
      .from(siswa)
      .leftJoin(kelulusan, eq(siswa.id, kelulusan.siswa_id))
      .where(eq(siswa.id, id))
      .limit(1);

    if (!record) return errorResponse("Siswa tidak ditemukan", 404);

    return jsonResponse({ data: record });
  } catch (err) {
    console.error("Get siswa error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

// PUT /api/siswa/:id — Update siswa (Admin only)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);
  if (user.role !== "admin") return errorResponse("Forbidden", 403);

  const id = parseInt(context.params.id as string);
  if (isNaN(id)) return errorResponse("Invalid ID", 400);

  try {
    const body = (await context.request.json()) as {
      nisn?: string;
      nama?: string;
      kelas?: string;
      jurusan?: string;
      tahun_ajaran?: string;
      tempat_lahir?: string;
      tanggal_lahir?: string;
      jenis_kelamin?: "L" | "P";
      status_kelulusan?: "lulus" | "tidak_lulus";
      nilai_rata_rata?: number;
      nilai_ujian?: number;
      nilai_sikap?: string;
      keterangan?: string;
    };

    const db = drizzle(context.env.DB);
    const now = new Date().toISOString();

    // Update siswa data
    const siswaUpdate: Record<string, unknown> = { updated_at: now };
    if (body.nisn) siswaUpdate.nisn = body.nisn;
    if (body.nama) siswaUpdate.nama = body.nama;
    if (body.kelas) siswaUpdate.kelas = body.kelas;
    if (body.jurusan) siswaUpdate.jurusan = body.jurusan;
    if (body.tahun_ajaran) siswaUpdate.tahun_ajaran = body.tahun_ajaran;
    if (body.tempat_lahir) siswaUpdate.tempat_lahir = body.tempat_lahir;
    if (body.tanggal_lahir) siswaUpdate.tanggal_lahir = body.tanggal_lahir;
    if (body.jenis_kelamin) siswaUpdate.jenis_kelamin = body.jenis_kelamin;

    const [updated] = await db
      .update(siswa)
      .set(siswaUpdate)
      .where(eq(siswa.id, id))
      .returning();

    if (!updated) return errorResponse("Siswa tidak ditemukan", 404);

    // Update kelulusan if provided
    if (body.status_kelulusan !== undefined) {
      const kelulusanData = {
        status: body.status_kelulusan,
        nilai_rata_rata: body.nilai_rata_rata ?? null,
        nilai_ujian: body.nilai_ujian ?? null,
        nilai_sikap: body.nilai_sikap ?? null,
        keterangan: body.keterangan ?? null,
        updated_at: now,
      };

      // Check if kelulusan record exists
      const [existing] = await db
        .select()
        .from(kelulusan)
        .where(eq(kelulusan.siswa_id, id))
        .limit(1);

      if (existing) {
        await db
          .update(kelulusan)
          .set(kelulusanData)
          .where(eq(kelulusan.siswa_id, id));
      } else {
        await db.insert(kelulusan).values({
          siswa_id: id,
          ...kelulusanData,
          tanggal_pengumuman: now,
          created_at: now,
        });
      }
    }

    // Also update user nama_lengkap if nama changed
    if (body.nama && updated.user_id) {
      await db
        .update(users)
        .set({ nama_lengkap: body.nama, updated_at: now })
        .where(eq(users.id, updated.user_id));
    }

    return jsonResponse({ success: true, data: updated });
  } catch (err) {
    console.error("Update siswa error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

// DELETE /api/siswa/:id — Delete siswa (Admin only)
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);
  if (user.role !== "admin") return errorResponse("Forbidden", 403);

  const id = parseInt(context.params.id as string);
  if (isNaN(id)) return errorResponse("Invalid ID", 400);

  const db = drizzle(context.env.DB);

  try {
    // Get siswa to find user_id
    const [record] = await db
      .select()
      .from(siswa)
      .where(eq(siswa.id, id))
      .limit(1);

    if (!record) return errorResponse("Siswa tidak ditemukan", 404);

    // Delete siswa (cascade will delete kelulusan)
    await db.delete(siswa).where(eq(siswa.id, id));

    // Delete associated user account
    if (record.user_id) {
      await db.delete(users).where(eq(users.id, record.user_id));
    }

    return jsonResponse({ success: true, message: "Siswa berhasil dihapus" });
  } catch (err) {
    console.error("Delete siswa error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
