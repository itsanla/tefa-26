import { Hono } from "hono";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { getDb } from "../db";
import { barangTable, transaksiBarangTable } from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import type { Env, Variables } from "../types";
import { convertTimestamps } from "../utils/date";

export const transaksiBarangApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

function toUnixSecondsStartOfDay(y: number, mIdx: number, d: number): number {
  return Math.floor(Date.UTC(y, mIdx, d) / 1000);
}

function dateToISO(unix: number): string {
  return new Date(unix * 1000).toISOString().split("T")[0];
}

transaksiBarangApp.get("/", async (c) => {
  try {
    const tanggal = c.req.query("tanggal");
    const bulan = c.req.query("bulan");
    const tahun = c.req.query("tahun");

    const db = getDb(c.env);

    let whereCond;
    if (tanggal) {
      const d = new Date(tanggal);
      if (Number.isNaN(d.getTime()))
        throw new AppError("Format tanggal tidak valid", 400);
      const start = toUnixSecondsStartOfDay(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
      );
      const end = start + 86400;
      whereCond = and(
        gte(transaksiBarangTable.tanggal, start),
        lt(transaksiBarangTable.tanggal, end),
      );
    } else if (bulan && tahun) {
      const y = Number(tahun);
      const m = Number(bulan) - 1;
      const start = toUnixSecondsStartOfDay(y, m, 1);
      const end = toUnixSecondsStartOfDay(y, m + 1, 1);
      whereCond = and(
        gte(transaksiBarangTable.tanggal, start),
        lt(transaksiBarangTable.tanggal, end),
      );
    } else if (tahun) {
      const y = Number(tahun);
      const start = toUnixSecondsStartOfDay(y, 0, 1);
      const end = toUnixSecondsStartOfDay(y + 1, 0, 1);
      whereCond = and(
        gte(transaksiBarangTable.tanggal, start),
        lt(transaksiBarangTable.tanggal, end),
      );
    }

    const query = db
      .select({
        id: transaksiBarangTable.id,
        id_barang: transaksiBarangTable.id_barang,
        tanggal: transaksiBarangTable.tanggal,
        masuk: transaksiBarangTable.masuk,
        keluar: transaksiBarangTable.keluar,
        keterangan: transaksiBarangTable.keterangan,
        barangNama: barangTable.nama,
        barangSatuan: barangTable.satuan,
      })
      .from(transaksiBarangTable)
      .leftJoin(
        barangTable,
        eq(transaksiBarangTable.id_barang, barangTable.id),
      )
      .orderBy(asc(transaksiBarangTable.tanggal));

    const transaksi = whereCond
      ? await query.where(whereCond).all()
      : await query.all();

    const barang_masuk = transaksi
      .filter((t) => t.masuk > 0)
      .map((t) => ({
        id: t.id,
        id_barang: t.id_barang,
        nama: t.barangNama,
        satuan: t.barangSatuan,
        jumlah: t.masuk,
        keterangan: t.keterangan,
        tanggal: dateToISO(t.tanggal),
      }));

    const barang_keluar = transaksi
      .filter((t) => t.keluar > 0)
      .map((t) => ({
        id: t.id,
        id_barang: t.id_barang,
        nama: t.barangNama,
        satuan: t.barangSatuan,
        jumlah: t.keluar,
        keterangan: t.keterangan,
        tanggal: dateToISO(t.tanggal),
      }));

    const totalMasuk = barang_masuk.reduce((s, x) => s + x.jumlah, 0);
    const totalKeluar = barang_keluar.reduce((s, x) => s + x.jumlah, 0);

    if (barang_masuk.length === 0 && barang_keluar.length === 0) {
      let detail = "Data transaksi tidak ditemukan";
      if (tanggal) detail += ` pada tanggal ${tanggal}`;
      else if (bulan && tahun) detail += ` pada bulan ${bulan}-${tahun}`;
      else if (tahun) detail += ` pada tahun ${tahun}`;

      return c.json(
        {
          success: false,
          message: detail,
          data: { barang_masuk: [], barang_keluar: [], totalMasuk: 0, totalKeluar: 0 },
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Berhasil mendapatkan data semua transaksi barang",
      data: { barang_masuk, barang_keluar, totalMasuk, totalKeluar },
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

transaksiBarangApp.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const transaksi = await db
      .select()
      .from(transaksiBarangTable)
      .where(eq(transaksiBarangTable.id, id))
      .get();
    if (!transaksi)
      throw new AppError(`Transaksi dengan id: ${id} tidak ditemukan.`);

    const barang = await db
      .select()
      .from(barangTable)
      .where(eq(barangTable.id, transaksi.id_barang))
      .get();

    return c.json({
      success: true,
      message: `Berhasil mendapatkan data transaksi barang dengan id ${id}`,
      data: convertTimestamps({ ...transaksi, barang }),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

transaksiBarangApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      id_barang?: number | string;
      tanggal?: string;
      masuk?: number | string;
      keluar?: number | string;
      keterangan?: string;
    }>();

    const v = new Validator();
    v.required(body.id_barang, "id_barang", "ID barang harus diisi.");
    v.isIntGt(body.id_barang, 0, "id_barang", "ID barang harus berupa angka positif.");
    v.required(body.tanggal, "tanggal", "Tanggal harus diisi.");
    v.isISODate(body.tanggal, "tanggal", "Format tanggal harus ISO 8601.");
    if (body.masuk !== undefined)
      v.isIntGte(body.masuk, 0, "masuk", "Jumlah masuk harus berupa angka >= 0.");
    if (body.keluar !== undefined)
      v.isIntGte(body.keluar, 0, "keluar", "Jumlah keluar harus berupa angka >= 0.");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const [newTransaksi] = await db
      .insert(transaksiBarangTable)
      .values({
        id_barang: Number(body.id_barang),
        tanggal: Math.floor(new Date(body.tanggal!).getTime() / 1000),
        masuk: Number(body.masuk ?? 0),
        keluar: Number(body.keluar ?? 0),
        keterangan: body.keterangan ?? "",
      })
      .returning();

    return c.json({
      success: true,
      message: `Berhasil menambahkan transaksi untuk barang dengan id ${body.id_barang}`,
      data: convertTimestamps(newTransaksi),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

transaksiBarangApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{
      id_barang?: number | string;
      tanggal?: string;
      masuk?: number | string;
      keluar?: number | string;
      keterangan?: string;
    }>();

    const v = new Validator();
    v.required(body.id_barang, "id_barang");
    v.isIntGt(body.id_barang, 0, "id_barang");
    v.required(body.tanggal, "tanggal");
    v.isISODate(body.tanggal, "tanggal");
    if (body.masuk !== undefined) v.isIntGte(body.masuk, 0, "masuk");
    if (body.keluar !== undefined) v.isIntGte(body.keluar, 0, "keluar");
    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(transaksiBarangTable)
      .where(eq(transaksiBarangTable.id, id))
      .get();
    if (!existing)
      throw new AppError(`Transaksi dengan id: ${id} tidak ditemukan.`);

    const [updated] = await db
      .update(transaksiBarangTable)
      .set({
        id_barang: Number(body.id_barang),
        tanggal: Math.floor(new Date(body.tanggal!).getTime() / 1000),
        masuk: Number(body.masuk ?? 0),
        keluar: Number(body.keluar ?? 0),
        keterangan: body.keterangan ?? "",
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(transaksiBarangTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil mengupdate transaksi dengan id ${id}`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

transaksiBarangApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(transaksiBarangTable)
      .where(eq(transaksiBarangTable.id, id))
      .get();
    if (!existing)
      throw new AppError(`Transaksi dengan id: ${id} tidak ditemukan.`);

    const [deleted] = await db
      .delete(transaksiBarangTable)
      .where(eq(transaksiBarangTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil menghapus transaksi dengan id ${id}`,
      data: convertTimestamps(deleted),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
