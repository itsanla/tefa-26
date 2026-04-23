import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const roleEnum = ["admin", "guru", "kepsek", "siswa"] as const;
export type Role = (typeof roleEnum)[number];

export const usersTable = sqliteTable("User", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nama: text("nama").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<Role>(),
  print_preference: integer("print_preference").notNull().default(1),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const jenisTable = sqliteTable("Jenis", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  isDeleted: integer("isDeleted").notNull().default(0),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const komoditasTable = sqliteTable("Komoditas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  id_jenis: integer("id_jenis")
    .notNull()
    .references(() => jenisTable.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi").notNull(),
  foto: text("foto").notNull(),
  satuan: text("satuan").notNull(),
  jumlah: integer("jumlah").notNull().default(0),
  isDeleted: integer("isDeleted").notNull().default(0),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const asalProduksiTable = sqliteTable("AsalProduksi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nama: text("nama").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const produksiTable = sqliteTable("Produksi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  id_asal: integer("id_asal")
    .notNull()
    .references(() => asalProduksiTable.id, { onDelete: "cascade" }),
  id_komoditas: integer("id_komoditas").references(() => komoditasTable.id, {
    onDelete: "cascade",
  }),
  kode_produksi: text("kode_produksi").notNull(),
  ukuran: text("ukuran").notNull(),
  kualitas: text("kualitas").notNull(),
  jumlah: integer("jumlah").notNull().default(0),
  harga_persatuan: integer("harga_persatuan").notNull().default(0),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const penjualanTable = sqliteTable("Penjualan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  total_harga: integer("total_harga").notNull().default(0),
  keterangan: text("keterangan").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const penjualanItemTabel = sqliteTable("PenjualanItem", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  id_penjualan: integer("id_penjualan")
    .notNull()
    .references(() => penjualanTable.id),
  id_komodity: integer("id_komodity")
    .notNull()
    .references(() => komoditasTable.id),
  id_produksi: integer("id_produksi")
    .notNull()
    .references(() => produksiTable.id),
  jumlah_terjual: integer("jumlah_terjual").notNull().default(0),
  harga_satuan: integer("harga_satuan").notNull().default(0),
  sub_total: integer("sub_total").notNull().default(0),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const barangTable = sqliteTable("Barang", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nama: text("nama").notNull(),
  satuan: text("satuan").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const transaksiBarangTable = sqliteTable("TransaksiBarang", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  id_barang: integer("id_barang")
    .notNull()
    .references(() => barangTable.id, { onDelete: "cascade" }),
  tanggal: integer("tanggal")
    .notNull()
    .default(sql`(unixepoch())`),
  masuk: integer("masuk").notNull().default(0),
  keluar: integer("keluar").notNull().default(0),
  keterangan: text("keterangan").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const jenisRelations = relations(jenisTable, ({ many }) => ({
  komoditases: many(komoditasTable),
}));

export const komoditasRelations = relations(
  komoditasTable,
  ({ one, many }) => ({
    jenis: one(jenisTable, {
      fields: [komoditasTable.id_jenis],
      references: [jenisTable.id],
    }),
    produksis: many(produksiTable),
    penjualanItems: many(penjualanItemTabel),
  }),
);

export const asalProduksiRelations = relations(
  asalProduksiTable,
  ({ many }) => ({
    produksis: many(produksiTable),
  }),
);

export const produksiRelations = relations(produksiTable, ({ one, many }) => ({
  asal_produksi: one(asalProduksiTable, {
    fields: [produksiTable.id_asal],
    references: [asalProduksiTable.id],
  }),
  komoditas: one(komoditasTable, {
    fields: [produksiTable.id_komoditas],
    references: [komoditasTable.id],
  }),
  penjualanItems: many(penjualanItemTabel),
}));

export const penjualanRelations = relations(penjualanTable, ({ many }) => ({
  penjualanItems: many(penjualanItemTabel),
}));

export const penjualanItemRelations = relations(
  penjualanItemTabel,
  ({ one }) => ({
    Penjualan: one(penjualanTable, {
      fields: [penjualanItemTabel.id_penjualan],
      references: [penjualanTable.id],
    }),
    Komoditas: one(komoditasTable, {
      fields: [penjualanItemTabel.id_komodity],
      references: [komoditasTable.id],
    }),
    Produksi: one(produksiTable, {
      fields: [penjualanItemTabel.id_produksi],
      references: [produksiTable.id],
    }),
  }),
);

export const barangRelations = relations(barangTable, ({ many }) => ({
  TransaksiBarang: many(transaksiBarangTable),
}));

export const transaksiBarangRelations = relations(
  transaksiBarangTable,
  ({ one }) => ({
    barang: one(barangTable, {
      fields: [transaksiBarangTable.id_barang],
      references: [barangTable.id],
    }),
  }),
);

export type User = typeof usersTable.$inferSelect;
export type Jenis = typeof jenisTable.$inferSelect;
export type Komoditas = typeof komoditasTable.$inferSelect;
export type AsalProduksi = typeof asalProduksiTable.$inferSelect;
export type Produksi = typeof produksiTable.$inferSelect;
export type Penjualan = typeof penjualanTable.$inferSelect;
export type Barang = typeof barangTable.$inferSelect;
export type TransaksiBarang = typeof transaksiBarangTable.$inferSelect;
