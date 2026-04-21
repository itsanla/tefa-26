import type { Role } from "./db/schema";

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  FRONTEND_URL?: string;
  ALLOWED_ORIGINS?: string;
}

export interface AuthUser {
  id: number;
  nama: string;
  email: string;
  role: Role;
}

export interface Variables {
  user: AuthUser;
}

export interface ResponseApi<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}
