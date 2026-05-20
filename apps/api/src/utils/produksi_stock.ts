import { eq, sql } from "drizzle-orm";
import { produksiTable, stokVariabelTable } from "../db/schema";
import type { DB } from "../db";

/**
 * Apply a stock delta to a produksi.
 *
 * If the produksi is linked to a stok variabel, the delta is applied to the
 * shared pool (the variabel) and propagated to ALL produksi linked to the same
 * variabel — this is the "shared live inventory" behaviour: selling product A
 * also reduces the stock shown for product B when both use the same variabel.
 *
 * If the produksi is not linked, only its own `jumlah` is changed.
 */
export async function adjustProduksiStockDelta(
  db: DB,
  id_produksi: number,
  delta: number,
  now: number,
): Promise<void> {
  const produksi = await db
    .select({
      id: produksiTable.id,
      id_stok_variabel: produksiTable.id_stok_variabel,
    })
    .from(produksiTable)
    .where(eq(produksiTable.id, id_produksi))
    .get();
  if (!produksi) return;

  if (produksi.id_stok_variabel) {
    await db
      .update(stokVariabelTable)
      .set({
        jumlah: sql`${stokVariabelTable.jumlah} + ${delta}`,
        updatedAt: now,
      })
      .where(eq(stokVariabelTable.id, produksi.id_stok_variabel));

    const variabel = await db
      .select({ jumlah: stokVariabelTable.jumlah })
      .from(stokVariabelTable)
      .where(eq(stokVariabelTable.id, produksi.id_stok_variabel))
      .get();

    await db
      .update(produksiTable)
      .set({ jumlah: variabel?.jumlah ?? 0, updatedAt: now })
      .where(eq(produksiTable.id_stok_variabel, produksi.id_stok_variabel));
  } else {
    await db
      .update(produksiTable)
      .set({
        jumlah: sql`${produksiTable.jumlah} + ${delta}`,
        updatedAt: now,
      })
      .where(eq(produksiTable.id, id_produksi));
  }
}
