-- Seed Asal Produksi (5 Greenhouses)
PRAGMA foreign_keys = OFF;
DELETE FROM AsalProduksi;
PRAGMA foreign_keys = ON;

INSERT INTO AsalProduksi (id, nama) VALUES
  (1, 'Greenhouse 1'),
  (2, 'Greenhouse 2'),
  (3, 'Greenhouse 3'),
  (4, 'Greenhouse 4'),
  (5, 'Greenhouse 5');
