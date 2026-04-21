import { sign, verify } from "hono/jwt";
import type { AuthUser } from "../types";

const DEFAULT_SECRET = "123456";

export async function generateToken(
  payload: AuthUser,
  secret: string = DEFAULT_SECRET,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  return sign({ ...payload, exp }, secret, "HS256");
}

export async function verifyToken(
  token: string,
  secret: string = DEFAULT_SECRET,
): Promise<AuthUser | null> {
  try {
    const decoded = (await verify(token, secret, "HS256")) as AuthUser & {
      exp?: number;
    };
    return {
      id: decoded.id,
      nama: decoded.nama,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
