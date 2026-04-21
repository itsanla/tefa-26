import type { Context, Next } from "hono";
import type { Env, Variables } from "../types";
import type { Role } from "../db/schema";
import { verifyToken } from "../utils/jwt";

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

export const jwtCheckToken = async (c: AppContext, next: Next) => {
  const auth = c.req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  if (!token) {
    return c.json({ success: false, message: "Token dibutuhkan." }, 401);
  }

  const secret = c.env.JWT_SECRET;
  const user = await verifyToken(token, secret);

  if (!user) {
    return c.json(
      { success: false, message: "Token invalid atau sudah kadaluarsa." },
      401,
    );
  }

  c.set("user", user);
  await next();
};

export const isRole = (allowedRoles: Role[]) => {
  return async (c: AppContext, next: Next) => {
    const user = c.get("user");
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ success: false, message: "Akses ditolak" }, 403);
    }
    await next();
  };
};
