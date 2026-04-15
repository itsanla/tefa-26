import type { Env } from "../../types";
import { getAuthUser, jsonResponse, errorResponse } from "../../auth-utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await getAuthUser(context.request, context.env);

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  return jsonResponse({
    id: user.sub,
    username: user.username,
    nama_lengkap: user.nama_lengkap,
    role: user.role,
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
