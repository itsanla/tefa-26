CREATE TABLE `kelulusan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`siswa_id` integer NOT NULL,
	`status` text NOT NULL,
	`nilai_rata_rata` real,
	`nilai_ujian` real,
	`nilai_sikap` text,
	`keterangan` text,
	`tanggal_pengumuman` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`siswa_id`) REFERENCES `siswa`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kelulusan_siswa_id_unique` ON `kelulusan` (`siswa_id`);--> statement-breakpoint
CREATE TABLE `siswa` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nisn` text NOT NULL,
	`nama` text NOT NULL,
	`kelas` text NOT NULL,
	`jurusan` text NOT NULL,
	`tahun_ajaran` text NOT NULL,
	`tempat_lahir` text NOT NULL,
	`tanggal_lahir` text NOT NULL,
	`jenis_kelamin` text NOT NULL,
	`user_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `siswa_nisn_unique` ON `siswa` (`nisn`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`nama_lengkap` text NOT NULL,
	`role` text DEFAULT 'siswa' NOT NULL,
	`nisn` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_nisn_unique` ON `users` (`nisn`);