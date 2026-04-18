import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Role type definitions
export const roleEnum = ["siswa", "guru", "admin"] as const;
export type Role = (typeof roleEnum)[number];

// Users table - untuk autentikasi dan role management
export const usersTable = sqliteTable("users_table", {
  id: text().primaryKey(),
  username: text().notNull().unique(),
  email: text().unique(),
  password: text().notNull(),
  role: text().notNull(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
});

// Siswa table - data spesifik siswa
export const siswaTable = sqliteTable("siswa_table", {
  id: text().primaryKey(),
  userId: text().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  nim: text().notNull().unique(),
  name: text().notNull(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
});

// Kelulusan table - status kelulusan siswa
export const kelulusanTable = sqliteTable("kelulusan_table", {
  id: text().primaryKey(),
  nim: text().notNull().references(() => siswaTable.nim, { onDelete: "cascade" }),
  lulus: int().notNull(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
});
