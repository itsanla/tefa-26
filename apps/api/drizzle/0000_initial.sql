CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);
--> statement-breakpoint
CREATE TABLE `Jenis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`isDeleted` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Komoditas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_jenis` integer NOT NULL,
	`nama` text NOT NULL,
	`deskripsi` text NOT NULL,
	`foto` text NOT NULL,
	`satuan` text NOT NULL,
	`jumlah` integer DEFAULT 0 NOT NULL,
	`isDeleted` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`id_jenis`) REFERENCES `Jenis`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `AsalProduksi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Produksi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_asal` integer NOT NULL,
	`id_komoditas` integer,
	`kode_produksi` text NOT NULL,
	`ukuran` text NOT NULL,
	`kualitas` text NOT NULL,
	`jumlah` integer DEFAULT 0 NOT NULL,
	`harga_persatuan` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`id_asal`) REFERENCES `AsalProduksi`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`id_komoditas`) REFERENCES `Komoditas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Penjualan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_komodity` integer NOT NULL,
	`jumlah_terjual` integer DEFAULT 0 NOT NULL,
	`id_produksi` integer NOT NULL,
	`total_harga` integer DEFAULT 0 NOT NULL,
	`keterangan` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`id_komodity`) REFERENCES `Komoditas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_produksi`) REFERENCES `Produksi`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Barang` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`satuan` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `TransaksiBarang` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_barang` integer NOT NULL,
	`tanggal` integer DEFAULT (unixepoch()) NOT NULL,
	`masuk` integer DEFAULT 0 NOT NULL,
	`keluar` integer DEFAULT 0 NOT NULL,
	`keterangan` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id`) ON UPDATE no action ON DELETE cascade
);
