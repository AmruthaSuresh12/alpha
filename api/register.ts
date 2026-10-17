import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleRegister } from "../server/handle-register.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Use POST to submit the form." });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0] : undefined)?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;

  const result = await handleRegister(req.body, { ip, origin });
  return res.status(result.status).json(result.body);
}
