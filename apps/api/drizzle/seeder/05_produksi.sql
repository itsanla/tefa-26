-- Seed Produksi (deterministic)
PRAGMA foreign_keys = OFF;
DELETE FROM Produksi;
PRAGMA foreign_keys = ON;

INSERT INTO Produksi (id, id_asal, id_komoditas, kode_produksi, ukuran, kualitas, jumlah, harga_persatuan) VALUES
  (1, 4, 1, 'PROD-GREENIGAL-001', 'Sedang', 'Premium', 50, 41657),
  (2, 4, 1, 'PROD-GREENIGAL-002', 'Besar', 'Premium', 12, 37541),
  (3, 5, 1, 'PROD-GREENIGAL-003', 'Besar', 'Premium', 80, 35458),
  (4, 4, 1, 'PROD-GREENIGAL-004', 'Besar', 'A', 70, 39343),
  (5, 1, 2, 'PROD-DALMATIAN-001', 'Sedang', 'Premium', 138, 27744),
  (6, 1, 2, 'PROD-DALMATIAN-002', 'Besar', 'B', 102, 23898),
  (7, 1, 2, 'PROD-DALMATIAN-003', 'Sedang', 'Premium', 117, 25511),
  (8, 4, 3, 'PROD-GREENIESWEET-001', 'Besar', 'A', 0, 25387),
  (9, 1, 3, 'PROD-GREENIESWEET-002', 'Sedang', 'Premium', 3, 28714),
  (10, 3, 3, 'PROD-GREENIESWEET-003', 'Kecil', 'Premium', 106, 24767),
  (11, 3, 3, 'PROD-GREENIESWEET-004', 'Sedang', 'Premium', 12, 24150),
  (12, 4, 4, 'PROD-ARUNI-001', 'Kecil', 'B', 46, 38892),
  (13, 3, 4, 'PROD-ARUNI-002', 'Kecil', 'A', 31, 37210),
  (14, 2, 4, 'PROD-ARUNI-003', 'Besar', 'A', 1, 35015),
  (15, 3, 4, 'PROD-ARUNI-004', 'Sedang', 'A', 109, 31797),
  (16, 3, 5, 'PROD-ELYSIA-001', 'Sedang', 'B', 33, 37050),
  (17, 1, 5, 'PROD-ELYSIA-002', 'Kecil', 'A', 136, 31656),
  (18, 1, 5, 'PROD-ELYSIA-003', 'Kecil', 'A', 164, 36954),
  (19, 3, 5, 'PROD-ELYSIA-004', 'Besar', 'Premium', 124, 32988),
  (20, 2, 6, 'PROD-MIDORI-001', 'Sedang', 'Premium', 102, 32764),
  (21, 1, 6, 'PROD-MIDORI-002', 'Besar', 'Premium', 137, 32178),
  (22, 4, 6, 'PROD-MIDORI-003', 'Sedang', 'Premium', 77, 31264),
  (23, 2, 6, 'PROD-MIDORI-004', 'Kecil', 'A', 126, 32290),
  (24, 1, 7, 'PROD-SUNRAY-001', 'Sedang', 'B', 93, 21529),
  (25, 5, 7, 'PROD-SUNRAY-002', 'Kecil', 'B', 126, 28158),
  (26, 4, 7, 'PROD-SUNRAY-003', 'Kecil', 'A', 119, 29551),
  (27, 3, 7, 'PROD-SUNRAY-004', 'Kecil', 'Premium', 149, 21865);

-- Update komoditas stock based on production minus sales
UPDATE Komoditas SET jumlah = 212 WHERE id = 1;
UPDATE Komoditas SET jumlah = 357 WHERE id = 2;
UPDATE Komoditas SET jumlah = 121 WHERE id = 3;
UPDATE Komoditas SET jumlah = 187 WHERE id = 4;
UPDATE Komoditas SET jumlah = 457 WHERE id = 5;
UPDATE Komoditas SET jumlah = 442 WHERE id = 6;
UPDATE Komoditas SET jumlah = 487 WHERE id = 7;

