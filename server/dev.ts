import "dotenv/config";
import express from "express";
import { handleRegister } from "./handle-register.ts";

const app = express();
const port = Number(process.env.REGISTRATION_DEV_PORT ?? 8787);

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.post("/api/register", async (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0] : undefined)?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;

  const result = await handleRegister(req.body, { ip, origin });
  res.status(result.status).json(result.body);
});

app.listen(port, () => {
  console.log(`Registration API listening on http://127.0.0.1:${port}`);
});
