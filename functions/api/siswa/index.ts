import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { siswa, users, kelulusan } from "../../../drizzle/schema";
import { getAuthUser, hashPassword, jsonResponse, errorResponse } from "../../auth-utils";

// POST /api/siswa — Create new siswa (Admin only)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);
  if (user.role !== "admin") return errorResponse("Forbidden", 403);

  try {
    const body = (await context.request.json()) as {
      nisn: string;
      nama: string;
      kelas: string;
      jurusan: string;
      tahun_ajaran: string;
      tempat_lahir: string;
      tanggal_lahir: string;
      jenis_kelamin: "L" | "P";
      // Kelulusan data (optional)
      status_kelulusan?: "lulus" | "tidak_lulus";
      nilai_rata_rata?: number;
      nilai_ujian?: number;
      nilai_sikap?: string;
      keterangan?: string;
    };

    if (
      !body.nisn ||
      !body.nama ||
      !body.kelas ||
      !body.jurusan ||
      !body.tahun_ajaran ||
      !body.tempat_lahir ||
      !body.tanggal_lahir ||
      !body.jenis_kelamin
    ) {
      return errorResponse("Semua field wajib harus diisi", 400);
    }

    const db = drizzle(context.env.DB);
    const now = new Date().toISOString();

    // Create user account for siswa (password default = NISN)
    const passwordHash = await hashPassword(body.nisn);
    const [newUser] = await db
      .insert(users)
      .values({
        username: body.nisn,
        password_hash: passwordHash,
        nama_lengkap: body.nama,
        role: "siswa",
        nisn: body.nisn,
        created_at: now,
        updated_at: now,
      })
      .returning();

    // Create siswa record
    const [newSiswa] = await db
      .insert(siswa)
      .values({
        nisn: body.nisn,
        nama: body.nama,
        kelas: body.kelas,
        jurusan: body.jurusan,
        tahun_ajaran: body.tahun_ajaran,
        tempat_lahir: body.tempat_lahir,
        tanggal_lahir: body.tanggal_lahir,
        jenis_kelamin: body.jenis_kelamin,
        user_id: newUser.id,
        created_at: now,
        updated_at: now,
      })
      .returning();

    // Create kelulusan record if status provided
    if (body.status_kelulusan) {
      await db.insert(kelulusan).values({
        siswa_id: newSiswa.id,
        status: body.status_kelulusan,
        nilai_rata_rata: body.nilai_rata_rata ?? null,
        nilai_ujian: body.nilai_ujian ?? null,
        nilai_sikap: body.nilai_sikap ?? null,
        keterangan: body.keterangan ?? null,
        tanggal_pengumuman: now,
        created_at: now,
        updated_at: now,
      });
    }

    return jsonResponse({ success: true, data: newSiswa }, 201);
  } catch (err: unknown) {
    console.error("Create siswa error:", err);
    if (err instanceof Error && err.message?.includes("UNIQUE")) {
      return errorResponse("NISN sudah terdaftar", 409);
    }
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
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
