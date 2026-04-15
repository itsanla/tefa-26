import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUM Constants
// ============================================================
export const USER_ROLES = ["admin", "guru", "siswa"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STATUS_KELULUSAN = ["lulus", "tidak_lulus"] as const;
export type StatusKelulusan = (typeof STATUS_KELULUSAN)[number];

export const JENIS_KELAMIN = ["L", "P"] as const;
export type JenisKelamin = (typeof JENIS_KELAMIN)[number];

// ============================================================
// TABLE: users
// Login credentials & role-based access
// ============================================================
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  nama_lengkap: text("nama_lengkap").notNull(),
  role: text("role", { enum: USER_ROLES }).notNull().default("siswa"),
  nisn: text("nisn").unique(), // nullable, hanya untuk siswa
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// TABLE: siswa
// Data lengkap siswa
// ============================================================
export const siswa = sqliteTable("siswa", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nisn: text("nisn").notNull().unique(),
  nama: text("nama").notNull(),
  kelas: text("kelas").notNull(), // e.g., "XII RPL 1"
  jurusan: text("jurusan").notNull(), // e.g., "Rekayasa Perangkat Lunak"
  tahun_ajaran: text("tahun_ajaran").notNull(), // e.g., "2025/2026"
  tempat_lahir: text("tempat_lahir").notNull(),
  tanggal_lahir: text("tanggal_lahir").notNull(), // ISO date string
  jenis_kelamin: text("jenis_kelamin", { enum: JENIS_KELAMIN }).notNull(),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// TABLE: kelulusan
// Hasil kelulusan per siswa
// ============================================================
export const kelulusan = sqliteTable("kelulusan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siswa_id: integer("siswa_id")
    .notNull()
    .references(() => siswa.id, { onDelete: "cascade" })
    .unique(),
  status: text("status", { enum: STATUS_KELULUSAN }).notNull(),
  nilai_rata_rata: real("nilai_rata_rata"), // e.g., 85.5
  nilai_ujian: real("nilai_ujian"),
  nilai_sikap: text("nilai_sikap"), // e.g., "Baik", "Sangat Baik"
  keterangan: text("keterangan"), // catatan tambahan
  tanggal_pengumuman: text("tanggal_pengumuman"), // ISO date string
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ============================================================
// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ one }) => ({
  siswa: one(siswa, {
    fields: [users.id],
    references: [siswa.user_id],
  }),
}));

export const siswaRelations = relations(siswa, ({ one }) => ({
  user: one(users, {
    fields: [siswa.user_id],
    references: [users.id],
  }),
  kelulusan: one(kelulusan, {
    fields: [siswa.id],
    references: [kelulusan.siswa_id],
  }),
}));

export const kelulusanRelations = relations(kelulusan, ({ one }) => ({
  siswa: one(siswa, {
    fields: [kelulusan.siswa_id],
    references: [siswa.id],
  }),
}));
