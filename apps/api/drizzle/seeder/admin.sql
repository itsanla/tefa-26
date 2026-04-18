-- Seed admin user
-- Password: admin123 (hashed dengan PBKDF2)
-- Run: pnpm wrangler d1 execute DB --local --file=./drizzle/seeder/admin.sql
-- Production: pnpm wrangler d1 execute DB --remote --file=./drizzle/seeder/admin.sql

INSERT INTO users_table (id, username, email, password, role, createdAt, updatedAt)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@example.com',
  'ef658cff85ee748a8fb3f76bfd863c64:82e7b32f2abfc1c9be621815c9d4c80a425106907333b532ea5b4adfa0e33a6b',
  'admin',
  strftime('%s', 'now'),
  strftime('%s', 'now')
)
ON CONFLICT(username) DO NOTHING;
