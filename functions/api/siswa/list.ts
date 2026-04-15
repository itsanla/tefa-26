import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { like, or, sql, eq } from "drizzle-orm";
import { siswa, kelulusan } from "../../../drizzle/schema";
import { getAuthUser, jsonResponse, errorResponse } from "../../auth-utils";

// GET /api/siswa/list?page=1&limit=20&search=keyword
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);
  if (user.role === "siswa") return errorResponse("Forbidden", 403);

  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  const db = drizzle(context.env.DB);

  try {
    let query = db
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
        status_kelulusan: kelulusan.status,
        nilai_rata_rata: kelulusan.nilai_rata_rata,
        nilai_ujian: kelulusan.nilai_ujian,
        nilai_sikap: kelulusan.nilai_sikap,
        keterangan: kelulusan.keterangan,
      })
      .from(siswa)
      .leftJoin(kelulusan, eq(siswa.id, kelulusan.siswa_id));

    if (search) {
      query = query.where(
        or(
          like(siswa.nama, `%${search}%`),
          like(siswa.nisn, `%${search}%`),
          like(siswa.kelas, `%${search}%`)
        )
      ) as typeof query;
    }

    const data = await query.limit(limit).offset(offset).all();

    // Count total
    let countQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(siswa);

    if (search) {
      countQuery = countQuery.where(
        or(
          like(siswa.nama, `%${search}%`),
          like(siswa.nisn, `%${search}%`),
          like(siswa.kelas, `%${search}%`)
        )
      ) as typeof countQuery;
    }

    const [{ count }] = await countQuery;

    return jsonResponse({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("List siswa error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
