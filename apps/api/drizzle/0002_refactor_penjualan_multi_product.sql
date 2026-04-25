-- Refactor Penjualan to support multi-product transactions
-- Create new PenjualanItem table first
CREATE TABLE `PenjualanItem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_penjualan` integer NOT NULL,
	`id_komodity` integer NOT NULL,
	`id_produksi` integer NOT NULL,
	`jumlah_terjual` integer DEFAULT 0 NOT NULL,
	`harga_satuan` integer DEFAULT 0 NOT NULL,
	`sub_total` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`id_penjualan`) REFERENCES `Penjualan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`id_komodity`) REFERENCES `Komoditas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_produksi`) REFERENCES `Produksi`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Migrate existing data from Penjualan to PenjualanItem
INSERT INTO PenjualanItem (id_penjualan, id_komodity, id_produksi, jumlah_terjual, harga_satuan, sub_total, createdAt, updatedAt)
SELECT id, id_komodity, id_produksi, jumlah_terjual, 0, total_harga, createdAt, updatedAt
FROM Penjualan;
--> statement-breakpoint

-- Recreate Penjualan table without the product-specific columns
CREATE TABLE `Penjualan_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_harga` integer DEFAULT 0 NOT NULL,
	`keterangan` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint

-- Copy data to new table
INSERT INTO Penjualan_new (id, total_harga, keterangan, createdAt, updatedAt)
SELECT id, total_harga, keterangan, createdAt, updatedAt
FROM Penjualan;
--> statement-breakpoint

-- Drop old Penjualan table
DROP TABLE Penjualan;
--> statement-breakpoint

-- Rename new table to Penjualan
ALTER TABLE Penjualan_new RENAME TO Penjualan;
--> statement-breakpoint

-- Create index for faster queries
CREATE INDEX `idx_penjualan_items` ON `PenjualanItem` (`id_penjualan`);
CREATE INDEX `idx_penjualan_created` ON `Penjualan` (`createdAt`);
