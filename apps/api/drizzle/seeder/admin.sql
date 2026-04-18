-- Seed admin user
-- Password: admin123 (hashed dengan PBKDF2)
-- Run: pnpm wrangler d1 execute DB --local --file=./seed.sql
-- Production: pnpm wrangler d1 execute DB --remote --file=./seed.sql

INSERT INTO users_table (username, email, password, role, createdAt, updatedAt)
VALUES (
  'admin',
  'admin@example.com',
  'ef658cff85ee748a8fb3f76bfd863c64:82e7b32f2abfc1c9be621815c9d4c80a425106907333b532ea5b4adfa0e33a6b',
  'admin',
  strftime('%s', 'now'),
  strftime('%s', 'now')
)
ON CONFLICT(username) DO NOTHING;
