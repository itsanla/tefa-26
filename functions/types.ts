// Type definitions for Cloudflare Pages Functions environment
export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

// JWT Payload structure
export interface JWTPayload {
  sub: number; // user id
  username: string;
  role: "admin" | "guru" | "siswa";
  nama_lengkap: string;
  iat: number;
  exp: number;
}
