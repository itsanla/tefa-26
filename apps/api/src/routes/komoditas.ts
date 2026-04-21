import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { jenisTable, komoditasTable } from "../db/schema";
import { Validator } from "../utils/validation";
import { AppError, handleAnyError } from "../errors/app_error";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary";
import { jwtCheckToken, isRole } from "../middlewares/auth";
import { convertTimestamps } from "../utils/date";
import type { Env, Variables } from "../types";

export const komoditasApp = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/jpg"];

async function getKomoditasById(
  db: ReturnType<typeof getDb>,
  id: number,
) {
  const row = await db
    .select()
    .from(komoditasTable)
    .where(and(eq(komoditasTable.id, id), eq(komoditasTable.isDeleted, 0)))
    .get();
  if (!row) throw new AppError(`Komoditas dengan id: ${id}, tidak tersedia.`);
  return row;
}

komoditasApp.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const rows = await db
      .select({
        id: komoditasTable.id,
        id_jenis: komoditasTable.id_jenis,
        nama: komoditasTable.nama,
        deskripsi: komoditasTable.deskripsi,
        foto: komoditasTable.foto,
        satuan: komoditasTable.satuan,
        jumlah: komoditasTable.jumlah,
        createdAt: komoditasTable.createdAt,
        updatedAt: komoditasTable.updatedAt,
        jenisName: jenisTable.name,
      })
      .from(komoditasTable)
      .leftJoin(jenisTable, eq(komoditasTable.id_jenis, jenisTable.id))
      .where(eq(komoditasTable.isDeleted, 0))
      .all();

    const data = rows.map((r) => convertTimestamps({
      id: r.id,
      id_jenis: r.id_jenis,
      jenis: { name: r.jenisName },
      nama: r.nama,
      deskripsi: r.deskripsi,
      foto: r.foto,
      satuan: r.satuan,
      jumlah: r.jumlah,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return c.json({ success: true, message: "Berhasil mengambil data.", data });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

komoditasApp.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const komoditas = await getKomoditasById(db, id);
    return c.json({
      success: true,
      message: `Berhasil mendapatkan komoditas dengan id: ${id}`,
      data: convertTimestamps(komoditas),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

komoditasApp.use("*", jwtCheckToken, isRole(["admin", "guru"]));

komoditasApp.post("/", async (c) => {
  try {
    const form = await c.req.formData();
    const id_jenis = form.get("id_jenis")?.toString();
    const nama = form.get("nama")?.toString();
    const deskripsi = form.get("deskripsi")?.toString();
    const satuan = form.get("satuan")?.toString();
    const foto = form.get("foto");
    const file = foto instanceof File ? foto : undefined;

    const v = new Validator();
    if (!file) {
      v.check(false, "foto", "Gambar wajib diunggah");
    } else {
      v.check(
        ALLOWED_IMAGE_MIME.includes(file.type),
        "foto",
        "Format file tidak didukung",
      );
    }
    v.required(id_jenis, "id_jenis", "Pilih salah satu jenis");
    v.required(nama, "nama", "Nama harus diisi.");
    v.required(deskripsi, "deskripsi", "Deskripsi harus diisi");
    v.minLength(deskripsi, 5, "deskripsi", "Deskripsi minimal 5 karakter");
    v.required(satuan, "satuan", "Satuan harus diisi");

    const db = getDb(c.env);
    if (id_jenis) {
      const jenis = await db
        .select()
        .from(jenisTable)
        .where(eq(jenisTable.id, Number(id_jenis)))
        .get();
      if (!jenis) v.check(false, "id_jenis", "Jenis tidak tersedia");
    }

    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const fotoUrl = await uploadImageToCloudinary(file!, c.env);

    const [newKomoditas] = await db
      .insert(komoditasTable)
      .values({
        id_jenis: Number(id_jenis),
        nama: nama!,
        deskripsi: deskripsi!,
        foto: fotoUrl,
        satuan: satuan!,
        jumlah: 0,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: `Berhasil menambahkan komoditas baru: ${newKomoditas.nama}`,
        data: convertTimestamps(newKomoditas),
      },
      201,
    );
  } catch (error) {
    return handleAnyError(c, error);
  }
});

komoditasApp.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const form = await c.req.formData();
    const id_jenis = form.get("id_jenis")?.toString();
    const nama = form.get("nama")?.toString();
    const deskripsi = form.get("deskripsi")?.toString();
    const satuan = form.get("satuan")?.toString();
    const foto = form.get("foto");
    const file = foto instanceof File && foto.size > 0 ? foto : undefined;

    const v = new Validator();
    if (file) {
      v.check(
        ALLOWED_IMAGE_MIME.includes(file.type),
        "foto",
        "Format file tidak didukung",
      );
    }
    if (deskripsi !== undefined)
      v.minLength(deskripsi, 5, "deskripsi", "Deskripsi minimal 5 karakter");

    const db = getDb(c.env);
    if (id_jenis) {
      const jenis = await db
        .select()
        .from(jenisTable)
        .where(eq(jenisTable.id, Number(id_jenis)))
        .get();
      if (!jenis) v.check(false, "id_jenis", "Jenis tidak tersedia");
    }

    if (v.hasErrors()) {
      return c.json(
        { success: false, message: "Validasi gagal", errors: v.getErrors() },
        400,
      );
    }

    const existing = await getKomoditasById(db, id);
    let fotoUrl = existing.foto;
    if (file) {
      fotoUrl = await uploadImageToCloudinary(file, c.env);
    }

    const update: Record<string, unknown> = {
      updatedAt: Math.floor(Date.now() / 1000),
      foto: fotoUrl,
    };
    if (id_jenis) update.id_jenis = Number(id_jenis);
    if (nama !== undefined) update.nama = nama;
    if (deskripsi !== undefined) update.deskripsi = deskripsi;
    if (satuan !== undefined) update.satuan = satuan;

    const [updated] = await db
      .update(komoditasTable)
      .set(update)
      .where(eq(komoditasTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil update komoditas: ${updated.nama}`,
      data: convertTimestamps(updated),
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});

komoditasApp.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const db = getDb(c.env);
    const komoditas = await getKomoditasById(db, id);

    const matches = komoditas.foto.match(/\/([^/]+\/[^/]+)\.[a-zA-Z]+$/);
    const publicId = matches ? matches[1] : undefined;
    if (publicId) {
      try {
        await deleteImageFromCloudinary(publicId, c.env);
      } catch (e) {
        console.warn("Gagal menghapus gambar dari Cloudinary:", e);
      }
    }

    const [deleted] = await db
      .update(komoditasTable)
      .set({ isDeleted: 1, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(komoditasTable.id, id))
      .returning();

    return c.json({
      success: true,
      message: `Berhasil menghapus komoditas: ${deleted.nama}`,
    });
  } catch (error) {
    return handleAnyError(c, error);
  }
});
