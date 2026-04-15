import type { Env } from "../../types";
import { clearAuthCookie, jsonResponse } from "../../auth-utils";

export const onRequestPost: PagesFunction<Env> = async () => {
  const response = jsonResponse({ success: true, message: "Berhasil logout" });
  response.headers.set("Set-Cookie", clearAuthCookie());
  return response;
};

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
