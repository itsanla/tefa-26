import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { siswa, kelulusan } from "../../../drizzle/schema";
import { getAuthUser, errorResponse } from "../../auth-utils";

// GET /api/export/pdf — Export data siswa as PDF (HTML-rendered)
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

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Generate printable HTML page
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Data Siswa SMK 26 — ${today}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; padding: 20mm; color: #111; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 3px double #111; padding-bottom: 16px; }
    .header h1 { font-size: 18px; margin-bottom: 4px; }
    .header h2 { font-size: 14px; font-weight: normal; }
    .header p { font-size: 11px; color: #555; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 16px; }
    th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
    th { background: #1a365d; color: white; font-weight: bold; text-align: center; }
    tr:nth-child(even) { background: #f7f7f7; }
    .status-lulus { color: #166534; font-weight: bold; }
    .status-tidak { color: #991b1b; font-weight: bold; }
    .footer { margin-top: 24px; font-size: 11px; text-align: right; color: #555; }
    @media print { body { padding: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>SMK NEGERI 26</h1>
    <h2>Data Siswa & Hasil Kelulusan</h2>
    <p>Dicetak pada: ${today}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>NISN</th>
        <th>Nama</th>
        <th>Kelas</th>
        <th>Jurusan</th>
        <th>L/P</th>
        <th>Status</th>
        <th>Rata-Rata</th>
        <th>Ujian</th>
        <th>Sikap</th>
        <th>Keterangan</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${row.nisn}</td>
          <td>${row.nama}</td>
          <td>${row.kelas}</td>
          <td>${row.jurusan}</td>
          <td style="text-align:center">${row.jenis_kelamin}</td>
          <td style="text-align:center" class="${row.status_kelulusan === "lulus" ? "status-lulus" : "status-tidak"}">${
            row.status_kelulusan === "lulus"
              ? "LULUS"
              : row.status_kelulusan === "tidak_lulus"
                ? "TIDAK LULUS"
                : "-"
          }</td>
          <td style="text-align:center">${row.nilai_rata_rata ?? "-"}</td>
          <td style="text-align:center">${row.nilai_ujian ?? "-"}</td>
          <td style="text-align:center">${row.nilai_sikap ?? "-"}</td>
          <td>${row.keterangan ?? "-"}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>
  <div class="footer">
    <p>Total siswa: ${data.length} &mdash; Lulus: ${data.filter((d) => d.status_kelulusan === "lulus").length} &mdash; Tidak Lulus: ${data.filter((d) => d.status_kelulusan === "tidak_lulus").length}</p>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (err) {
    console.error("Export PDF error:", err);
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
