import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { siswa, kelulusan } from "../../../drizzle/schema";
import { getAuthUser, errorResponse } from "../../auth-utils";

// GET /api/export/excel — Export data siswa as CSV (Excel-compatible)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);
  if (!user) return errorResponse("Unauthorized", 401);
  if (user.role === "siswa") return errorResponse("Forbidden", 403);

  const db = drizzle(context.env.DB);

  try {
    const data = await db
      .select({
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
      .leftJoin(kelulusan, eq(siswa.id, kelulusan.siswa_id))
      .all();

    // Build CSV with BOM for Excel compatibility
    const BOM = "\uFEFF";
    const headers = [
      "NISN",
      "Nama",
      "Kelas",
      "Jurusan",
      "Tahun Ajaran",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Jenis Kelamin",
      "Status Kelulusan",
      "Nilai Rata-Rata",
      "Nilai Ujian",
      "Nilai Sikap",
      "Keterangan",
    ];

    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = [
        `"${row.nisn}"`,
        `"${row.nama}"`,
        `"${row.kelas}"`,
        `"${row.jurusan}"`,
        `"${row.tahun_ajaran}"`,
        `"${row.tempat_lahir}"`,
        `"${row.tanggal_lahir}"`,
        `"${row.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}"`,
        `"${row.status_kelulusan === "lulus" ? "Lulus" : row.status_kelulusan === "tidak_lulus" ? "Tidak Lulus" : "Belum Ditentukan"}"`,
        row.nilai_rata_rata ?? "",
        row.nilai_ujian ?? "",
        `"${row.nilai_sikap ?? ""}"`,
        `"${row.keterangan ?? ""}"`,
      ];
      csvRows.push(values.join(","));
    }

    const csv = BOM + csvRows.join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="data_siswa_${new Date().toISOString().split("T")[0]}.csv"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (err) {
    console.error("Export excel error:", err);
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
