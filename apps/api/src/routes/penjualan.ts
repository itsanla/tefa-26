import { Hono } from "hono";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  asalProduksiTable,
  jenisTable,
  komoditasTable,
  penjualanTable,
  penjualanItemTabel,
  produksiTable,
} from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import { convertTimestamps, unixToISO } from "../utils/date";
import type { Env, Variables } from "../types";

async function loadPenjualanSummary(
  db: any,
  transaksi: typeof penjualanTable.$inferSelect,
) {
  const firstItem = await db
    .select({
      id: penjualanItemTabel.id,
      id_komodity: penjualanItemTabel.id_komodity,
      id_produksi: penjualanItemTabel.id_produksi,
      jumlah_terjual: penjualanItemTabel.jumlah_terjual,
    })
    .from(penjualanItemTabel)
    .where(eq(penjualanItemTabel.id_penjualan, transaksi.id))
    .orderBy(desc(penjualanItemTabel.id))
    .get();

  if (!firstItem) {
    return convertTimestamps({
      ...transaksi,
      id_komodity: 0,
      id_produksi: 0,
      jumlah_terjual: 0,
      komoditas: null,
      produksi: null,
    });
  }

  const komoditas = await db
    .select({
      id: komoditasTable.id,
      id_jenis: komoditasTable.id_jenis,
      nama: komoditasTable.nama,
      satuan: komoditasTable.satuan,
    })
    .from(komoditasTable)
    .where(eq(komoditasTable.id, firstItem.id_komodity))
    .get();

  let komoditasWithJenis: unknown = komoditas;
  if (komoditas) {
    const jenis = await db
      .select({
        id: jenisTable.id,
        name: jenisTable.name,
      })
      .from(jenisTable)
      .where(eq(jenisTable.id, komoditas.id_jenis))
      .get();
    komoditasWithJenis = { ...komoditas, jenis };
  }

  const produksi = await db
    .select({
      id: produksiTable.id,
      id_asal: produksiTable.id_asal,
      kode_produksi: produksiTable.kode_produksi,
      ukuran: produksiTable.ukuran,
      kualitas: produksiTable.kualitas,
      harga_persatuan: produksiTable.harga_persatuan,
    })
    .from(produksiTable)
    .where(eq(produksiTable.id, firstItem.id_produksi))
    .get();

  let produksiWithAsal: unknown = produksi;
  if (produksi) {
    const asal = await db
      .select({
        id: asalProduksiTable.id,
        nama: asalProduksiTable.nama,
      })
      .from(asalProduksiTable)
      .where(eq(asalProduksiTable.id, produksi.id_asal))
      .get();
    produksiWithAsal = { ...produksi, asal_produksi: asal };
  }

  return convertTimestamps({
    ...transaksi,
    id_komodity: firstItem.id_komodity,
    id_produksi: firstItem.id_produksi,
    jumlah_terjual: firstItem.jumlah_terjual,
    komoditas: komoditasWithJenis,
    produksi: produksiWithAsal,
  });
}

async function loadPenjualanDetail(
  db: any,
  transaksi: typeof penjualanTable.$inferSelect,
) {
  const summary = await loadPenjualanSummary(db, transaksi);

  const items = await db
    .select({
      id: penjualanItemTabel.id,
      id_penjualan: penjualanItemTabel.id_penjualan,
      id_komodity: penjualanItemTabel.id_komodity,
      id_produksi: penjualanItemTabel.id_produksi,
      jumlah_terjual: penjualanItemTabel.jumlah_terjual,
      harga_satuan: penjualanItemTabel.harga_satuan,
      sub_total: penjualanItemTabel.sub_total,
    })
    .from(penjualanItemTabel)
    .where(eq(penjualanItemTabel.id_penjualan, transaksi.id))
    .all();

  const itemsWithDetails = await Promise.all(
    items.map(async (pi: any) => {
      const komoditas = await db
        .select({
          id: komoditasTable.id,
          id_jenis: komoditasTable.id_jenis,
          nama: komoditasTable.nama,
          satuan: komoditasTable.satuan,
        })
        .from(komoditasTable)
        .where(eq(komoditasTable.id, pi.id_komodity))
        .get();

      let komoditasWithJenis: unknown = komoditas;
      if (komoditas) {
        const jenis = await db
          .select({
            id: jenisTable.id,
            name: jenisTable.name,
          })
          .from(jenisTable)
          .where(eq(jenisTable.id, komoditas.id_jenis))
          .get();
        komoditasWithJenis = { ...komoditas, jenis };
      }

      const produksi = await db
        .select({
          id: produksiTable.id,
          id_asal: produksiTable.id_asal,
          kode_produksi: produksiTable.kode_produksi,
          ukuran: produksiTable.ukuran,
          kualitas: produksiTable.kualitas,
          harga_persatuan: produksiTable.harga_persatuan,
        })
        .from(produksiTable)
        .where(eq(produksiTable.id, pi.id_produksi))
        .get();

      let produksiWithAsal: unknown = produksi;
      if (produksi) {
        const asal = await db
          .select({
            id: asalProduksiTable.id,
            nama: asalProduksiTable.nama,
          })
          .from(asalProduksiTable)
          .where(eq(asalProduksiTable.id, produksi.id_asal))
          .get();
        produksiWithAsal = { ...produksi, asal_produksi: asal };
      }

      return convertTimestamps({
        ...pi,
        komoditas: komoditasWithJenis,
        produksi: produksiWithAsal,
      });
    }),
  );

  const summaryData = summary as any;
  const firstItem = itemsWithDetails[0] as any;

  return convertTimestamps({
    ...summary,
    items: itemsWithDetails,
    namaKomoditas:
      firstItem?.komoditas?.nama ?? summaryData?.komoditas?.nama ?? "",
    satuanKomoditas:
      firstItem?.komoditas?.satuan ?? summaryData?.komoditas?.satuan ?? "",
    kodeProduksi:
      firstItem?.produksi?.kode_produksi ??
      summaryData?.produksi?.kode_produksi ??
      "",
    ukuran: firstItem?.produksi?.ukuran ?? summaryData?.produksi?.ukuran ?? "",
    kualitas:
      firstItem?.produksi?.kualitas ?? summaryData?.produksi?.kualitas ?? "",
    asalProduksi:
      firstItem?.produksi?.asal_produksi?.nama ??
      summaryData?.produksi?.asal_produksi?.nama ??
      "-",
    hargaPersatuan:
      firstItem?.harga_satuan ?? summaryData?.produksi?.harga_persatuan ?? 0,
    jumlahTerjual:
      firstItem?.jumlah_terjual ?? summaryData?.jumlah_terjual ?? 0,
    totalHarga: summaryData?.total_harga,
    keterangan: summaryData?.keterangan,
    tanggal: summaryData?.createdAt,
  });
}

type PenjualanListHeader = {
  id: number;
  total_harga: number;
  keterangan: string;
  createdAt: number;
  updatedAt: number;
};

type PenjualanListItem = {
  id: number;
  id_penjualan: number;
  id_produksi: number;
};

type PenjualanListProduksi = {
  id: number;
  kode_produksi: string;
};

async function loadPenjualanListRows(db: any) {
  const [headers, itemRows, produksiRows] = await Promise.all([
    db
      .select({
        id: penjualanTable.id,
        total_harga: penjualanTable.total_harga,
        keterangan: penjualanTable.keterangan,
        createdAt: penjualanTable.createdAt,
        updatedAt: penjualanTable.updatedAt,
      })
      .from(penjualanTable)
      .orderBy(desc(penjualanTable.createdAt))
      .all(),
    db
      .select({
        id: penjualanItemTabel.id,
        id_penjualan: penjualanItemTabel.id_penjualan,
        id_produksi: penjualanItemTabel.id_produksi,
      })
      .from(penjualanItemTabel)
      .orderBy(asc(penjualanItemTabel.id))
      .all(),
    db
      .select({
        id: produksiTable.id,
        kode_produksi: produksiTable.kode_produksi,
      })
      .from(produksiTable)
      .all(),
  ]);

  const produksiMap = new Map<number, string>(
    (produksiRows as PenjualanListProduksi[]).map((row) => [
      row.id,
      row.kode_produksi,
    ]),
  );

  const itemsByPenjualan = new Map<number, PenjualanListItem[]>();
  for (const item of itemRows as PenjualanListItem[]) {
    const current = itemsByPenjualan.get(item.id_penjualan) ?? [];
    current.push(item);
    itemsByPenjualan.set(item.id_penjualan, current);
  }

  return (headers as PenjualanListHeader[]).map((header) => {
    const relatedItems = itemsByPenjualan.get(header.id) ?? [];
    const kodeProduksiList = relatedItems
      .map((item) => produksiMap.get(item.id_produksi))
      .filter((kode): kode is string => Boolean(kode));

    return convertTimestamps({
      ...header,
      jumlah_produk: relatedItems.length,
      kode_produksi_list: kodeProduksiList,
    });
  });
}

export const penjualanApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

penjualanApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const data = await loadPenjualanListRows(db);

    return c.json({
      success: true,
      message: "Berhasil mendapatkan data penjualan",
      data,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      keterangan?: string;
      items?: Array<{
        keterangan?: string;
        id_komodity?: number | string;
        id_produksi?: number | string;
        jumlah_terjual?: number | string;
      }>;
    }>();

    const items = body.items;

    if (items == null || items == undefined)
      throw new AppError("items harus dikirimkan", 400);

    const v = new Validator();

    v.check(
      items.length > 0,
      "items",
      "Minimal harus ada satu item penjualan.",
    );

    items.forEach((item, index) => {
      v.required(
        item.id_komodity,
        `items.${index}.id_komodity`,
        "ID Komoditas harus diisi.",
      );
      v.isIntGt(
        item.id_komodity,
        0,
        `items.${index}.id_komodity`,
        "ID Komoditas harus berupa angka.",
      );
      v.required(
        item.id_produksi,
        `items.${index}.id_produksi`,
        "ID Produksi harus diisi.",
      );
      v.isIntGt(
        item.id_produksi,
        0,
        `items.${index}.id_produksi`,
        "ID Produksi harus berupa angka.",
      );
      v.required(
        item.jumlah_terjual,
        `items.${index}.jumlah_terjual`,
        "Jumlah terjual harus diisi.",
      );
      v.isIntGt(
        item.jumlah_terjual,
        0,
        `items.${index}.jumlah_terjual`,
        "Jumlah terjual harus berupa angka.",
      );
    });

    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const db = getDb(c.env);
    const now = Math.floor(Date.now() / 1000);

    const resolvedItems = [] as Array<{
      id_komodity: number;
      id_produksi: number;
      jumlah_terjual: number;
      harga_satuan: number;
      sub_total: number;
      keterangan: string;
      komoditas: typeof komoditasTable.$inferSelect;
      produksi: typeof produksiTable.$inferSelect;
    }>;

    for (const item of items) {
      const id_komodity = Number(item.id_komodity);
      const id_produksi = Number(item.id_produksi);
      const jumlah_terjual = Number(item.jumlah_terjual);
      const keterangan = item.keterangan ?? "";

      const komoditas = await db
        .select()
        .from(komoditasTable)
        .where(eq(komoditasTable.id, id_komodity))
        .get();
      if (!komoditas) throw new AppError("Komoditas tidak ditemukan", 404);
      if (komoditas.jumlah < jumlah_terjual) {
        throw new AppError("Stok komoditas tidak mencukupi", 400);
      }

      const produksi = await db
        .select()
        .from(produksiTable)
        .where(eq(produksiTable.id, id_produksi))
        .get();
      if (!produksi) throw new AppError("Produksi tidak ditemukan", 404);
      if (produksi.jumlah < jumlah_terjual) {
        throw new AppError("Stok produksi tidak mencukupi", 400);
      }

      const harga_satuan = produksi.harga_persatuan;
      const sub_total = harga_satuan * jumlah_terjual;

      resolvedItems.push({
        id_komodity,
        id_produksi,
        jumlah_terjual,
        harga_satuan,
        sub_total,
        keterangan,
        komoditas,
        produksi,
      });
    }

    const total_harga = resolvedItems.reduce(
      (sum, item) => sum + item.sub_total,
      0,
    );
    const keterangan =
      body.keterangan?.trim() ||
      resolvedItems
        .map((item) => item.keterangan.trim())
        .filter(Boolean)
        .join(" | ");

    const [newPenjualan] = await db
      .insert(penjualanTable)
      .values({
        keterangan,
        total_harga,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const rollbackKomoditas: Array<{ id: number; jumlah: number }> = [];
    const rollbackProduksi: Array<{ id: number; jumlah: number }> = [];
    const createdItemIds: number[] = [];

    try {
      for (const item of resolvedItems) {
        rollbackKomoditas.push({
          id: item.komoditas.id,
          jumlah: item.komoditas.jumlah,
        });
        rollbackProduksi.push({
          id: item.produksi.id,
          jumlah: item.produksi.jumlah,
        });

        await db
          .update(komoditasTable)
          .set({
            jumlah: item.komoditas.jumlah - item.jumlah_terjual,
            updatedAt: now,
          })
          .where(eq(komoditasTable.id, item.id_komodity));

        await db
          .update(produksiTable)
          .set({
            jumlah: item.produksi.jumlah - item.jumlah_terjual,
            updatedAt: now,
          })
          .where(eq(produksiTable.id, item.id_produksi));

        const [newItem] = await db
          .insert(penjualanItemTabel)
          .values({
            id_penjualan: newPenjualan.id,
            id_komodity: item.id_komodity,
            id_produksi: item.id_produksi,
            jumlah_terjual: item.jumlah_terjual,
            harga_satuan: item.harga_satuan,
            sub_total: item.sub_total,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        createdItemIds.push(newItem.id);
      }
    } catch (error) {
      for (const id of createdItemIds.reverse()) {
        await db
          .delete(penjualanItemTabel)
          .where(eq(penjualanItemTabel.id, id));
      }

      for (const item of rollbackKomoditas) {
        await db
          .update(komoditasTable)
          .set({ jumlah: item.jumlah, updatedAt: now })
          .where(eq(komoditasTable.id, item.id));
      }

      for (const item of rollbackProduksi) {
        await db
          .update(produksiTable)
          .set({ jumlah: item.jumlah, updatedAt: now })
          .where(eq(produksiTable.id, item.id));
      }

      await db
        .delete(penjualanTable)
        .where(eq(penjualanTable.id, newPenjualan.id));
      throw error;
    }

    return c.json(
      {
        success: true,
        message: "Berhasil menambahkan data penjualan",
        data: convertTimestamps({
          ...newPenjualan,
          items: resolvedItems.map((item) => ({
            id_komodity: item.id_komodity,
            id_produksi: item.id_produksi,
            jumlah_terjual: item.jumlah_terjual,
            harga_satuan: item.harga_satuan,
            sub_total: item.sub_total,
            keterangan: item.keterangan,
          })),
        }),
      },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const db = getDb(c.env);
    const transaksi = await db
      .select()
      .from(penjualanTable)
      .where(eq(penjualanTable.id, Number(id)))
      .get();
    if (!transaksi) throw new AppError("Transaksi tidak ditemukan", 404);
    const data = await loadPenjualanDetail(db, transaksi);

    return c.json(
      {
        success: true,
        message: "Berhasil mendapatkan detail penjualan",
        data,
      },
      200,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});
