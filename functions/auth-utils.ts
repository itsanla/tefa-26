import { jwtVerify, SignJWT } from "jose";
import type { Env, JWTPayload } from "./types";

// ============================================================
// Password hashing using Web Crypto API (PBKDF2)
// bcrypt is NOT available in Workers runtime
// ============================================================
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(hash);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const computedHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computedHex === hashHex;
}

// ============================================================
// JWT utilities
// ============================================================
export async function createJWT(
  payload: Omit<JWTPayload, "iat" | "exp">,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================================
// Cookie helpers
// ============================================================
export function setAuthCookie(token: string): string {
  return `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;
}

export function clearAuthCookie(): string {
  return `auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

// ============================================================
// Auth middleware helper — extracts and verifies user from request
// ============================================================
export async function getAuthUser(
  request: Request,
  env: Env
): Promise<JWTPayload | null> {
  const cookieHeader = request.headers.get("Cookie");
  const token = getTokenFromCookie(cookieHeader);
  if (!token) return null;
  return verifyJWT(token, env.JWT_SECRET);
}

// ============================================================
// JSON response helpers
// ============================================================
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
