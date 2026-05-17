import { Hono } from "hono";
import { asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  asalProduksiTable,
  jenisTable,
  komoditasTable,
  penjualanTable,
  penjualanItemTabel,
  pembayaranPenjualanTable,
  produksiTable,
} from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import { convertTimestamps, unixToISO } from "../utils/date";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
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
      harga_per_buah: produksiTable.harga_per_buah,
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
      id_komodity: penjualanItemTabel.id_komodity,
      id_produksi: penjualanItemTabel.id_produksi,
      jumlah_terjual: penjualanItemTabel.jumlah_terjual,
      berat: penjualanItemTabel.berat,
      satuan_jual: penjualanItemTabel.satuan_jual,
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
          harga_per_buah: produksiTable.harga_per_buah,
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

  const pembayaran = await db
    .select({
      id: pembayaranPenjualanTable.id,
      jumlah_bayar: pembayaranPenjualanTable.jumlah_bayar,
      keterangan: pembayaranPenjualanTable.keterangan,
      createdAt: pembayaranPenjualanTable.createdAt,
    })
    .from(pembayaranPenjualanTable)
    .where(eq(pembayaranPenjualanTable.id_penjualan, transaksi.id))
    .orderBy(asc(pembayaranPenjualanTable.createdAt))
    .all();

  const pembayaranConverted = pembayaran.map((p: any) => convertTimestamps(p));

  return convertTimestamps({
    id: summary.id,
    total_harga: summary.total_harga,
    keterangan: summary.keterangan,
    status: (transaksi as any).status ?? "lunas",
    total_terbayar: (transaksi as any).total_terbayar ?? summary.total_harga,
    sisa_bayar: summary.total_harga - ((transaksi as any).total_terbayar ?? summary.total_harga),
    items: itemsWithDetails,
    pembayaran: pembayaranConverted,
    created_at: summary.createdAt,
    updated_at: summary.updatedAt,
  });
}

type PenjualanListHeader = {
  id: number;
  total_harga: number;
  keterangan: string;
  status: string;
  total_terbayar: number;
  createdAt: number;
  updatedAt: number;
};

type PenjualanListItem = {
  id: number;
  id_penjualan: number;
  id_produksi: number;
  jumlah_terjual: number;
  berat: number;
};

type PenjualanListProduksi = {
  id: number;
  kode_produksi: string;
};

function buildLowercaseContains(column: unknown, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return undefined;

  return sql`instr(lower(${column}), ${normalizedSearch}) > 0`;
}

function buildPenjualanSearchCondition(search: string) {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) return undefined;

  const conditions = [
    buildLowercaseContains(penjualanTable.keterangan, trimmedSearch),
  ];

  if (/^\d+$/.test(trimmedSearch)) {
    conditions.unshift(eq(penjualanTable.id, Number(trimmedSearch)));
  }

  return or(
    ...conditions.filter(
      (condition): condition is NonNullable<typeof condition> =>
        Boolean(condition),
    ),
  );
}

function buildProduksiSearchCondition(search: string) {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) return undefined;

  const conditions = [
    buildLowercaseContains(produksiTable.kode_produksi, trimmedSearch),
    buildLowercaseContains(produksiTable.kualitas, trimmedSearch),
    buildLowercaseContains(produksiTable.ukuran, trimmedSearch),
  ].filter((condition): condition is NonNullable<typeof condition> =>
    Boolean(condition),
  );

  return conditions.length > 0 ? or(...conditions) : undefined;
}

async function loadPenjualanListRows(
  db: any,
  pageSize: number,
  offset: number,
  search: string,
) {
  const trimmedSearch = search.trim();
  const penjualanSearchCondition = buildPenjualanSearchCondition(trimmedSearch);
  const produksiSearchCondition = buildProduksiSearchCondition(trimmedSearch);

  let headerIds: number[] = [];

  if (penjualanSearchCondition || produksiSearchCondition) {
    const matchedHeaders = await db
      .select({ id: penjualanTable.id })
      .from(penjualanTable)
      .where(penjualanSearchCondition)
      .all();

    const matchedItemPenjualan = await db
      .select({ id_penjualan: penjualanItemTabel.id_penjualan })
      .from(penjualanItemTabel)
      .innerJoin(
        produksiTable,
        eq(produksiTable.id, penjualanItemTabel.id_produksi),
      )
      .where(produksiSearchCondition)
      .all();

    headerIds = Array.from(
      new Set([
        ...(matchedHeaders as Array<{ id: number }>).map((row) => row.id),
        ...(matchedItemPenjualan as Array<{ id_penjualan: number }>).map(
          (row) => row.id_penjualan,
        ),
      ]),
    );
  } else {
    const headerRows = await db
      .select({ id: penjualanTable.id })
      .from(penjualanTable)
      .orderBy(desc(penjualanTable.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    headerIds = (headerRows as Array<{ id: number }>).map((row) => row.id);
  }

  if (headerIds.length === 0) {
    return [] as PenjualanListHeader[];
  }

  const headers = await db
    .select({
      id: penjualanTable.id,
      total_harga: penjualanTable.total_harga,
      keterangan: penjualanTable.keterangan,
      status: penjualanTable.status,
      total_terbayar: penjualanTable.total_terbayar,
      createdAt: penjualanTable.createdAt,
      updatedAt: penjualanTable.updatedAt,
    })
    .from(penjualanTable)
    .where(inArray(penjualanTable.id, headerIds))
    .orderBy(desc(penjualanTable.createdAt))
    .all();

  const pagedHeaders = trimmedSearch
    ? (headers as PenjualanListHeader[]).slice(offset, offset + pageSize)
    : (headers as PenjualanListHeader[]);

  const pagedHeaderIds = pagedHeaders.map((header) => header.id);

  const itemRows = await db
    .select({
      id: penjualanItemTabel.id,
      id_penjualan: penjualanItemTabel.id_penjualan,
      id_produksi: penjualanItemTabel.id_produksi,
      jumlah_terjual: penjualanItemTabel.jumlah_terjual,
      berat: penjualanItemTabel.berat,
    })
    .from(penjualanItemTabel)
    .where(inArray(penjualanItemTabel.id_penjualan, pagedHeaderIds))
    .orderBy(asc(penjualanItemTabel.id))
    .all();

  const produksiIds = Array.from(
    new Set((itemRows as PenjualanListItem[]).map((row) => row.id_produksi)),
  );

  const produksiRows = produksiIds.length
    ? await db
        .select({
          id: produksiTable.id,
          kode_produksi: produksiTable.kode_produksi,
        })
        .from(produksiTable)
        .where(inArray(produksiTable.id, produksiIds))
        .all()
    : [];

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

  return pagedHeaders.map((header) => {
    const relatedItems = itemsByPenjualan.get(header.id) ?? [];
    const kodeProduksiList = relatedItems
      .map((item) => produksiMap.get(item.id_produksi))
      .filter((kode): kode is string => Boolean(kode));

    const total_berat_kg = relatedItems.reduce(
      (sum, item) => sum + item.berat,
      0,
    );

    const jumlah_buah = relatedItems.reduce(
      (sum, item) => sum + item.jumlah_terjual,
      0,
    );

    return convertTimestamps({
      ...header,
      jumlah_produk: relatedItems.length,
      jumlah_buah,
      kode_produksi_list: kodeProduksiList,
      total_berat_kg,
      sisa_bayar: header.total_harga - header.total_terbayar,
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
    const { search, page, pageSize, offset } = parsePagination(c.req.query());

    const trimmedSearch = search.trim();
    let totalItems = 0;
    const penjualanSearchCondition =
      buildPenjualanSearchCondition(trimmedSearch);
    const produksiSearchCondition = buildProduksiSearchCondition(trimmedSearch);

    if (penjualanSearchCondition || produksiSearchCondition) {
      const matchedHeaders = await db
        .select({ id: penjualanTable.id })
        .from(penjualanTable)
        .where(penjualanSearchCondition)
        .all();

      const matchedItemPenjualan = await db
        .select({ id_penjualan: penjualanItemTabel.id_penjualan })
        .from(penjualanItemTabel)
        .innerJoin(
          produksiTable,
          eq(produksiTable.id, penjualanItemTabel.id_produksi),
        )
        .where(produksiSearchCondition)
        .all();

      totalItems = new Set([
        ...(matchedHeaders as Array<{ id: number }>).map((row) => row.id),
        ...(matchedItemPenjualan as Array<{ id_penjualan: number }>).map(
          (row) => row.id_penjualan,
        ),
      ]).size;
    } else {
      const totalRow = await db
        .select({ count: sql<number>`count(*)` })
        .from(penjualanTable)
        .get();
      totalItems = Number(totalRow?.count ?? 0);
    }

    const data = await loadPenjualanListRows(db, pageSize, offset, search);

    return c.json({
      success: true,
      message: "Berhasil mendapatkan data penjualan",
      data,
      meta: buildPaginationMeta(page, pageSize, totalItems),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      keterangan?: string;
      status?: string;
      uang_muka?: number | string;
      items?: Array<{
        keterangan?: string;
        id_komodity?: number | string;
        id_produksi?: number | string;
        jumlah_terjual?: number | string;
        berat?: number | string;
        satuan_jual?: string;
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
        "Jumlah buah harus diisi.",
      );
      v.isIntGt(
        item.jumlah_terjual,
        0,
        `items.${index}.jumlah_terjual`,
        "Jumlah buah harus berupa angka bulat lebih dari 0.",
      );
      const satuan = item.satuan_jual === "buah" ? "buah" : "kilogram";
      if (satuan === "kilogram") {
        v.required(
          item.berat,
          `items.${index}.berat`,
          "Berat harus diisi.",
        );
        v.check(
          !isNaN(Number(item.berat)) && Number(item.berat) > 0,
          `items.${index}.berat`,
          "Berat harus berupa angka lebih dari 0.",
        );
      }
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
      berat: number;
      satuan_jual: string;
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
      const satuan_jual = item.satuan_jual === "buah" ? "buah" : "kilogram";
      const berat = satuan_jual === "kilogram" ? Number(item.berat) : 0;
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

      const harga_satuan = satuan_jual === "kilogram"
        ? produksi.harga_persatuan
        : produksi.harga_per_buah;
      const sub_total = satuan_jual === "kilogram"
        ? Math.round(harga_satuan * berat)
        : Math.round(harga_satuan * jumlah_terjual);

      resolvedItems.push({
        id_komodity,
        id_produksi,
        jumlah_terjual,
        berat,
        satuan_jual,
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

    const status = (body.status ?? "lunas") as string;
    if (!["lunas", "angsuran", "hutang"].includes(status)) {
      throw new AppError("Status tidak valid. Gunakan: lunas, angsuran, atau hutang", 400);
    }
    const uang_muka = Number(body.uang_muka ?? 0);
    if (status === "angsuran") {
      if (uang_muka <= 0) throw new AppError("Uang muka harus lebih dari 0 untuk status angsuran", 400);
      if (uang_muka >= total_harga) throw new AppError("Uang muka harus kurang dari total harga", 400);
    }
    const total_terbayar = status === "lunas" ? total_harga : status === "angsuran" ? uang_muka : 0;

    const [newPenjualan] = await db
      .insert(penjualanTable)
      .values({
        keterangan,
        total_harga,
        status,
        total_terbayar,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (total_terbayar > 0) {
      await db.insert(pembayaranPenjualanTable).values({
        id_penjualan: newPenjualan.id,
        jumlah_bayar: total_terbayar,
        keterangan: status === "lunas" ? "Pembayaran lunas" : "Uang muka awal",
        createdAt: now,
        updatedAt: now,
      });
    }

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
            berat: item.berat,
            satuan_jual: item.satuan_jual,
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
            berat: item.berat,
            satuan_jual: item.satuan_jual,
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

// GET /penjualan/export/bulan — daftar bulan yang tersedia di DB
penjualanApp.get("/export/bulan", async (c) => {
  try {
    const db = getDb(c.env);
    const rows = await db
      .select({
        bulan: sql<string>`strftime('%Y-%m', datetime(${penjualanTable.createdAt}, 'unixepoch'))`,
      })
      .from(penjualanTable)
      .groupBy(sql`strftime('%Y-%m', datetime(${penjualanTable.createdAt}, 'unixepoch'))`)
      .orderBy(desc(sql`strftime('%Y-%m', datetime(${penjualanTable.createdAt}, 'unixepoch'))`))
      .all();

    return c.json({
      success: true,
      data: (rows as Array<{ bulan: string }>).map((r) => r.bulan).filter(Boolean),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

// GET /penjualan/export/data?bulan=YYYY-MM — data penjualan untuk satu bulan
penjualanApp.get("/export/data", async (c) => {
  try {
    const bulan = c.req.query("bulan");
    if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
      throw new AppError("Parameter bulan tidak valid. Format: YYYY-MM", 400);
    }

    const db = getDb(c.env);

    const headers = await db
      .select({
        id: penjualanTable.id,
        total_harga: penjualanTable.total_harga,
        keterangan: penjualanTable.keterangan,
        createdAt: penjualanTable.createdAt,
      })
      .from(penjualanTable)
      .where(
        sql`strftime('%Y-%m', datetime(${penjualanTable.createdAt}, 'unixepoch')) = ${bulan}`,
      )
      .orderBy(asc(penjualanTable.createdAt))
      .all();

    if (headers.length === 0) {
      return c.json({ success: true, data: [] });
    }

    const headerIds = (headers as Array<{ id: number }>).map((h) => h.id);

    const itemRows = await db
      .select({
        id_penjualan: penjualanItemTabel.id_penjualan,
        id_produksi: penjualanItemTabel.id_produksi,
        berat: penjualanItemTabel.berat,
      })
      .from(penjualanItemTabel)
      .where(inArray(penjualanItemTabel.id_penjualan, headerIds))
      .all();

    const produksiIds = Array.from(
      new Set((itemRows as Array<{ id_produksi: number }>).map((r) => r.id_produksi)),
    );
    const produksiRows = produksiIds.length
      ? await db
          .select({ id: produksiTable.id, kode_produksi: produksiTable.kode_produksi })
          .from(produksiTable)
          .where(inArray(produksiTable.id, produksiIds))
          .all()
      : [];

    const produksiMap = new Map<number, string>(
      (produksiRows as Array<{ id: number; kode_produksi: string }>).map((r) => [r.id, r.kode_produksi]),
    );

    const itemsByPenjualan = new Map<number, Array<{ id_produksi: number; berat: number }>>();
    for (const item of itemRows as Array<{ id_penjualan: number; id_produksi: number; berat: number }>) {
      const current = itemsByPenjualan.get(item.id_penjualan) ?? [];
      current.push(item);
      itemsByPenjualan.set(item.id_penjualan, current);
    }

    const data = (headers as Array<{ id: number; total_harga: number; keterangan: string; createdAt: number }>).map((header) => {
      const relatedItems = itemsByPenjualan.get(header.id) ?? [];
      return {
        ...convertTimestamps(header),
        jumlah_produk: relatedItems.length,
        kode_produksi_list: relatedItems
          .map((item) => produksiMap.get(item.id_produksi))
          .filter((k): k is string => Boolean(k)),
        total_berat_kg: relatedItems.reduce((sum, item) => sum + item.berat, 0),
      };
    });

    return c.json({ success: true, data });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.get("/summary", async (c) => {
  try {
    const bulan = c.req.query("bulan");
    if (bulan && !/^\d{4}-\d{2}$/.test(bulan)) {
      throw new AppError("Format bulan tidak valid. Gunakan: YYYY-MM", 400);
    }

    const db = getDb(c.env);

    const bulanFilter = bulan
      ? sql`strftime('%Y-%m', datetime(${penjualanTable.createdAt}, 'unixepoch')) = ${bulan}`
      : undefined;

    const rows = await db
      .select({
        status: penjualanTable.status,
        count: sql<number>`count(*)`,
        total_nominal: sql<number>`coalesce(sum(${penjualanTable.total_harga}), 0)`,
        total_terbayar: sql<number>`coalesce(sum(${penjualanTable.total_terbayar}), 0)`,
        total_sisa: sql<number>`coalesce(sum(${penjualanTable.total_harga} - ${penjualanTable.total_terbayar}), 0)`,
      })
      .from(penjualanTable)
      .where(bulanFilter)
      .groupBy(penjualanTable.status)
      .all();

    const summary: Record<string, { count: number; nominal: number; terbayar: number; sisa: number }> = {
      lunas: { count: 0, nominal: 0, terbayar: 0, sisa: 0 },
      angsuran: { count: 0, nominal: 0, terbayar: 0, sisa: 0 },
      hutang: { count: 0, nominal: 0, terbayar: 0, sisa: 0 },
    };

    for (const row of rows as any[]) {
      const s = row.status as string;
      if (s in summary) {
        summary[s] = {
          count: Number(row.count),
          nominal: Number(row.total_nominal),
          terbayar: Number(row.total_terbayar),
          sisa: Number(row.total_sisa),
        };
      }
    }

    const grand_total = Object.values(summary).reduce((sum, s) => sum + s.nominal, 0);
    const grand_terbayar = Object.values(summary).reduce((sum, s) => sum + s.terbayar, 0);
    const grand_sisa = Object.values(summary).reduce((sum, s) => sum + s.sisa, 0);
    const grand_count = Object.values(summary).reduce((sum, s) => sum + s.count, 0);

    return c.json({
      success: true,
      data: {
        bulan: bulan ?? null,
        lunas: summary.lunas,
        angsuran: summary.angsuran,
        hutang: summary.hutang,
        grand: { count: grand_count, nominal: grand_total, terbayar: grand_terbayar, sisa: grand_sisa },
      },
    });
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

penjualanApp.put("/:id", async (c) => {
  try {
    const authUser = c.get("user");
    if (!authUser || authUser.role !== "admin") {
      return c.json(
        { success: false, message: "Hanya admin yang dapat mengubah data penjualan." },
        403,
      );
    }

    const penjualanId = Number(c.req.param("id"));
    const body = await c.req.json<{
      keterangan?: string;
      status?: string;
      uang_muka?: number | string;
      items?: Array<{
        keterangan?: string;
        id_komodity?: number | string;
        id_produksi?: number | string;
        jumlah_terjual?: number | string;
        berat?: number | string;
        satuan_jual?: string;
      }>;
    }>();

    if (body.status && !["lunas", "angsuran", "hutang"].includes(body.status)) {
      throw new AppError("Status tidak valid. Gunakan: lunas, angsuran, atau hutang", 400);
    }
    if (body.status === "angsuran") {
      const dp = Number(body.uang_muka ?? 0);
      if (!dp || dp <= 0) throw new AppError("Uang muka harus lebih dari 0 untuk status angsuran", 400);
    }

    const items = body.items;
    if (!items || items.length === 0)
      throw new AppError("items harus dikirimkan", 400);

    const v = new Validator();
    v.check(items.length > 0, "items", "Minimal harus ada satu item penjualan.");
    items.forEach((item, index) => {
      v.required(item.id_komodity, `items.${index}.id_komodity`, "ID Komoditas harus diisi.");
      v.isIntGt(item.id_komodity, 0, `items.${index}.id_komodity`, "ID Komoditas harus berupa angka.");
      v.required(item.id_produksi, `items.${index}.id_produksi`, "ID Produksi harus diisi.");
      v.isIntGt(item.id_produksi, 0, `items.${index}.id_produksi`, "ID Produksi harus berupa angka.");
      v.required(item.jumlah_terjual, `items.${index}.jumlah_terjual`, "Jumlah buah harus diisi.");
      v.isIntGt(item.jumlah_terjual, 0, `items.${index}.jumlah_terjual`, "Jumlah buah harus berupa angka bulat lebih dari 0.");
      const satuan = item.satuan_jual === "buah" ? "buah" : "kilogram";
      if (satuan === "kilogram") {
        v.required(item.berat, `items.${index}.berat`, "Berat harus diisi.");
        v.check(
          !isNaN(Number(item.berat)) && Number(item.berat) > 0,
          `items.${index}.berat`,
          "Berat harus berupa angka lebih dari 0.",
        );
      }
    });

    if (v.hasErrors()) {
      return c.json({ success: false, message: "Validasi gagal", errors: v.getErrors() }, 400);
    }

    const db = getDb(c.env);
    const now = Math.floor(Date.now() / 1000);

    const existingPenjualan = await db
      .select()
      .from(penjualanTable)
      .where(eq(penjualanTable.id, penjualanId))
      .get();
    if (!existingPenjualan) throw new AppError("Transaksi tidak ditemukan", 404);

    const oldItems = await db
      .select({
        id: penjualanItemTabel.id,
        id_komodity: penjualanItemTabel.id_komodity,
        id_produksi: penjualanItemTabel.id_produksi,
        jumlah_terjual: penjualanItemTabel.jumlah_terjual,
        berat: penjualanItemTabel.berat,
        harga_satuan: penjualanItemTabel.harga_satuan,
        sub_total: penjualanItemTabel.sub_total,
        createdAt: penjualanItemTabel.createdAt,
      })
      .from(penjualanItemTabel)
      .where(eq(penjualanItemTabel.id_penjualan, penjualanId))
      .all();

    const restoredKomoditasQty = new Map<number, number>();
    const restoredProduksiQty = new Map<number, number>();
    for (const old of oldItems) {
      restoredKomoditasQty.set(old.id_komodity, (restoredKomoditasQty.get(old.id_komodity) ?? 0) + old.jumlah_terjual);
      restoredProduksiQty.set(old.id_produksi, (restoredProduksiQty.get(old.id_produksi) ?? 0) + old.jumlah_terjual);
    }

    // Resolve new items — validate against effective stock (current + what old items will restore)
    const resolvedItems = [] as Array<{
      id_komodity: number;
      id_produksi: number;
      jumlah_terjual: number;
      berat: number;
      satuan_jual: string;
      harga_satuan: number;
      sub_total: number;
      keterangan: string;
    }>;

    for (const item of items) {
      const id_komodity = Number(item.id_komodity);
      const id_produksi = Number(item.id_produksi);
      const jumlah_terjual = Number(item.jumlah_terjual);
      const satuan_jual = item.satuan_jual === "buah" ? "buah" : "kilogram";
      const berat = satuan_jual === "kilogram" ? Number(item.berat) : 0;
      const keterangan = item.keterangan ?? "";

      const komoditas = await db
        .select()
        .from(komoditasTable)
        .where(eq(komoditasTable.id, id_komodity))
        .get();
      if (!komoditas) throw new AppError("Komoditas tidak ditemukan", 404);
      const effectiveKomoditasJumlah = komoditas.jumlah + (restoredKomoditasQty.get(id_komodity) ?? 0);
      if (effectiveKomoditasJumlah < jumlah_terjual) {
        throw new AppError("Stok komoditas tidak mencukupi", 400);
      }

      const produksi = await db
        .select()
        .from(produksiTable)
        .where(eq(produksiTable.id, id_produksi))
        .get();
      if (!produksi) throw new AppError("Produksi tidak ditemukan", 404);
      const effectiveProduksiJumlah = produksi.jumlah + (restoredProduksiQty.get(id_produksi) ?? 0);
      if (effectiveProduksiJumlah < jumlah_terjual) {
        throw new AppError("Stok produksi tidak mencukupi", 400);
      }

      const harga_satuan = satuan_jual === "kilogram"
        ? produksi.harga_persatuan
        : produksi.harga_per_buah;
      const sub_total = satuan_jual === "kilogram"
        ? Math.round(harga_satuan * berat)
        : Math.round(harga_satuan * jumlah_terjual);

      resolvedItems.push({ id_komodity, id_produksi, jumlah_terjual, berat, satuan_jual, harga_satuan, sub_total, keterangan });
    }

    // Perform update with rollback tracking
    const restoredKomoditasLog: Array<{ id: number; qty: number }> = [];
    const restoredProduksiLog: Array<{ id: number; qty: number }> = [];
    const newDeductedKomoditas: Array<{ id: number; qty: number }> = [];
    const newDeductedProduksi: Array<{ id: number; qty: number }> = [];
    const createdItemIds: number[] = [];
    let oldItemsDeleted = false;

    try {
      for (const old of oldItems) {
        await db
          .update(komoditasTable)
          .set({ jumlah: sql`${komoditasTable.jumlah} + ${old.jumlah_terjual}`, updatedAt: now })
          .where(eq(komoditasTable.id, old.id_komodity));
        await db
          .update(produksiTable)
          .set({ jumlah: sql`${produksiTable.jumlah} + ${old.jumlah_terjual}`, updatedAt: now })
          .where(eq(produksiTable.id, old.id_produksi));
        restoredKomoditasLog.push({ id: old.id_komodity, qty: old.jumlah_terjual });
        restoredProduksiLog.push({ id: old.id_produksi, qty: old.jumlah_terjual });
      }

      await db
        .delete(penjualanItemTabel)
        .where(eq(penjualanItemTabel.id_penjualan, penjualanId));
      oldItemsDeleted = true;

      for (const item of resolvedItems) {
        await db
          .update(komoditasTable)
          .set({ jumlah: sql`${komoditasTable.jumlah} - ${item.jumlah_terjual}`, updatedAt: now })
          .where(eq(komoditasTable.id, item.id_komodity));
        await db
          .update(produksiTable)
          .set({ jumlah: sql`${produksiTable.jumlah} - ${item.jumlah_terjual}`, updatedAt: now })
          .where(eq(produksiTable.id, item.id_produksi));
        newDeductedKomoditas.push({ id: item.id_komodity, qty: item.jumlah_terjual });
        newDeductedProduksi.push({ id: item.id_produksi, qty: item.jumlah_terjual });

        const [newItem] = await db
          .insert(penjualanItemTabel)
          .values({
            id_penjualan: penjualanId,
            id_komodity: item.id_komodity,
            id_produksi: item.id_produksi,
            jumlah_terjual: item.jumlah_terjual,
            berat: item.berat,
            satuan_jual: item.satuan_jual,
            harga_satuan: item.harga_satuan,
            sub_total: item.sub_total,
            createdAt: now,
            updatedAt: now,
          })
          .returning();
        createdItemIds.push(newItem.id);
      }

      const total_harga = resolvedItems.reduce((sum, i) => sum + i.sub_total, 0);
      const keteranganFinal =
        body.keterangan?.trim() ||
        resolvedItems
          .map((i) => i.keterangan.trim())
          .filter(Boolean)
          .join(" | ") ||
        (existingPenjualan as any).keterangan;

      const currentStatus = (existingPenjualan as any).status ?? "lunas";
      const newStatus = body.status && ["lunas", "angsuran", "hutang"].includes(body.status)
        ? body.status
        : currentStatus;
      const statusChanged = newStatus !== currentStatus;

      let new_total_terbayar: number;
      if (newStatus === "lunas") {
        new_total_terbayar = total_harga;
      } else if (newStatus === "angsuran" && statusChanged) {
        const dp = Number(body.uang_muka ?? 0);
        if (dp >= total_harga) throw new AppError("Uang muka harus kurang dari total harga", 400);
        new_total_terbayar = dp;
      } else if (newStatus === "angsuran") {
        // status tetap angsuran, harga item berubah — pertahankan total_terbayar lama
        new_total_terbayar = (existingPenjualan as any).total_terbayar ?? 0;
      } else {
        new_total_terbayar = 0;
      }

      const updatedFields: Record<string, unknown> = {
        keterangan: keteranganFinal,
        total_harga,
        status: newStatus,
        total_terbayar: new_total_terbayar,
        updatedAt: now,
      };

      await db
        .update(penjualanTable)
        .set(updatedFields)
        .where(eq(penjualanTable.id, penjualanId));

      if (statusChanged) {
        await db
          .delete(pembayaranPenjualanTable)
          .where(eq(pembayaranPenjualanTable.id_penjualan, penjualanId));
        if (new_total_terbayar > 0) {
          await db.insert(pembayaranPenjualanTable).values({
            id_penjualan: penjualanId,
            jumlah_bayar: new_total_terbayar,
            keterangan: newStatus === "lunas"
              ? "Pembayaran lunas (diperbarui admin)"
              : "Uang muka (diperbarui admin)",
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } catch (error) {
      // Rollback new insertions
      for (const id of createdItemIds.reverse()) {
        await db.delete(penjualanItemTabel).where(eq(penjualanItemTabel.id, id));
      }
      // Undo new stock deductions
      for (const k of newDeductedKomoditas) {
        await db
          .update(komoditasTable)
          .set({ jumlah: sql`${komoditasTable.jumlah} + ${k.qty}`, updatedAt: now })
          .where(eq(komoditasTable.id, k.id));
      }
      for (const p of newDeductedProduksi) {
        await db
          .update(produksiTable)
          .set({ jumlah: sql`${produksiTable.jumlah} + ${p.qty}`, updatedAt: now })
          .where(eq(produksiTable.id, p.id));
      }
      // Re-insert old items if they were deleted
      if (oldItemsDeleted) {
        for (const old of oldItems) {
          await db.insert(penjualanItemTabel).values({
            id_penjualan: penjualanId,
            id_komodity: old.id_komodity,
            id_produksi: old.id_produksi,
            jumlah_terjual: old.jumlah_terjual,
            berat: old.berat,
            satuan_jual: old.satuan_jual,
            harga_satuan: old.harga_satuan,
            sub_total: old.sub_total,
            createdAt: old.createdAt,
            updatedAt: now,
          });
        }
      }
      // Undo stock restoration
      for (const k of restoredKomoditasLog) {
        await db
          .update(komoditasTable)
          .set({ jumlah: sql`${komoditasTable.jumlah} - ${k.qty}`, updatedAt: now })
          .where(eq(komoditasTable.id, k.id));
      }
      for (const p of restoredProduksiLog) {
        await db
          .update(produksiTable)
          .set({ jumlah: sql`${produksiTable.jumlah} - ${p.qty}`, updatedAt: now })
          .where(eq(produksiTable.id, p.id));
      }
      throw error;
    }

    return c.json({
      success: true,
      message: "Berhasil mengubah data penjualan",
      data: convertTimestamps({ ...existingPenjualan, id: penjualanId }),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.delete("/:id", async (c) => {
  try {
    const authUser = c.get("user");
    if (!authUser || authUser.role !== "admin") {
      return c.json(
        { success: false, message: "Hanya admin yang dapat menghapus data penjualan." },
        403,
      );
    }

    const penjualanId = Number(c.req.param("id"));
    const db = getDb(c.env);
    const now = Math.floor(Date.now() / 1000);

    const existingPenjualan = await db
      .select()
      .from(penjualanTable)
      .where(eq(penjualanTable.id, penjualanId))
      .get();
    if (!existingPenjualan) throw new AppError("Transaksi tidak ditemukan", 404);

    const oldItems = await db
      .select()
      .from(penjualanItemTabel)
      .where(eq(penjualanItemTabel.id_penjualan, penjualanId))
      .all();

    for (const item of oldItems) {
      await db
        .update(komoditasTable)
        .set({ jumlah: sql`${komoditasTable.jumlah} + ${item.jumlah_terjual}`, updatedAt: now })
        .where(eq(komoditasTable.id, item.id_komodity));
      await db
        .update(produksiTable)
        .set({ jumlah: sql`${produksiTable.jumlah} + ${item.jumlah_terjual}`, updatedAt: now })
        .where(eq(produksiTable.id, item.id_produksi));
    }

    await db
      .delete(pembayaranPenjualanTable)
      .where(eq(pembayaranPenjualanTable.id_penjualan, penjualanId));
    await db
      .delete(penjualanItemTabel)
      .where(eq(penjualanItemTabel.id_penjualan, penjualanId));
    await db
      .delete(penjualanTable)
      .where(eq(penjualanTable.id, penjualanId));

    return c.json({
      success: true,
      message: "Berhasil menghapus data penjualan dan stok produksi telah dikembalikan",
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

penjualanApp.post("/:id/bayar", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{
      jumlah_bayar?: number | string;
      keterangan?: string;
    }>();

    const v = new Validator();
    v.required(body.jumlah_bayar, "jumlah_bayar", "Jumlah bayar harus diisi.");
    v.check(
      !isNaN(Number(body.jumlah_bayar)) && Number(body.jumlah_bayar) > 0,
      "jumlah_bayar",
      "Jumlah bayar harus berupa angka lebih dari 0.",
    );

    if (v.hasErrors()) {
      return c.json({ success: false, message: "Validasi gagal", errors: v.getErrors() }, 400);
    }

    const db = getDb(c.env);
    const now = Math.floor(Date.now() / 1000);

    const penjualan = await db
      .select()
      .from(penjualanTable)
      .where(eq(penjualanTable.id, id))
      .get();
    if (!penjualan) throw new AppError("Penjualan tidak ditemukan", 404);
    if ((penjualan as any).status === "lunas") {
      throw new AppError("Penjualan sudah lunas", 400);
    }

    const jumlah_bayar = Number(body.jumlah_bayar);
    const sisa_bayar = (penjualan as any).total_harga - (penjualan as any).total_terbayar;

    if (jumlah_bayar > sisa_bayar) {
      throw new AppError(`Jumlah bayar melebihi sisa tagihan (Rp ${sisa_bayar.toLocaleString("id-ID")})`, 400);
    }

    const new_total_terbayar = (penjualan as any).total_terbayar + jumlah_bayar;
    const new_status = new_total_terbayar >= (penjualan as any).total_harga ? "lunas" : "angsuran";

    await db.insert(pembayaranPenjualanTable).values({
      id_penjualan: id,
      jumlah_bayar,
      keterangan: body.keterangan?.trim() ?? "",
      createdAt: now,
      updatedAt: now,
    });

    await db
      .update(penjualanTable)
      .set({ total_terbayar: new_total_terbayar, status: new_status, updatedAt: now })
      .where(eq(penjualanTable.id, id));

    return c.json({
      success: true,
      message: `Pembayaran berhasil. Status: ${new_status}`,
      data: convertTimestamps({
        id,
        status: new_status,
        total_terbayar: new_total_terbayar,
        sisa_bayar: (penjualan as any).total_harga - new_total_terbayar,
      }),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
