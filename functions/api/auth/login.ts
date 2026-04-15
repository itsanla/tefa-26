import type { Env } from "../../types";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../../../drizzle/schema";
import {
  verifyPassword,
  createJWT,
  setAuthCookie,
  jsonResponse,
  errorResponse,
} from "../../auth-utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      username?: string;
      password?: string;
    };

    const { username, password } = body;

    if (!username || !password) {
      return errorResponse("Username dan password harus diisi", 400);
    }

    const db = drizzle(context.env.DB);

    // Find user by username OR nisn (for siswa login)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      // Try by NISN
      const [userByNisn] = await db
        .select()
        .from(users)
        .where(eq(users.nisn, username))
        .limit(1);

      if (!userByNisn) {
        return errorResponse("Username atau password salah", 401);
      }

      const passwordValid = await verifyPassword(
        password,
        userByNisn.password_hash
      );
      if (!passwordValid) {
        return errorResponse("Username atau password salah", 401);
      }

      const token = await createJWT(
        {
          sub: userByNisn.id,
          username: userByNisn.username,
          role: userByNisn.role as "admin" | "guru" | "siswa",
          nama_lengkap: userByNisn.nama_lengkap,
        },
        context.env.JWT_SECRET
      );

      const response = jsonResponse({
        success: true,
        user: {
          id: userByNisn.id,
          username: userByNisn.username,
          nama_lengkap: userByNisn.nama_lengkap,
          role: userByNisn.role,
        },
      });
      response.headers.set("Set-Cookie", setAuthCookie(token));
      return response;
    }

    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return errorResponse("Username atau password salah", 401);
    }

    const token = await createJWT(
      {
        sub: user.id,
        username: user.username,
        role: user.role as "admin" | "guru" | "siswa",
        nama_lengkap: user.nama_lengkap,
      },
      context.env.JWT_SECRET
    );

    const response = jsonResponse({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });
    response.headers.set("Set-Cookie", setAuthCookie(token));
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
