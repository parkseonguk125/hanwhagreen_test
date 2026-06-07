import express from "express";
import authRouter from "./routes/auth.js";
import noticeRouter from "./routes/notice.js";
import qaRouter from "./routes/qa.js";
import { checkDbHealth, initDb } from "./db.js";
import { ensureQaUploadDir } from "./qaFiles.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Qa-Password"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await checkDbHealth();
    res.json({ status: "ok", database: "postgresql" });
  } catch (error) {
    console.error(error);
    res.status(503).json({ status: "error", message: "데이터베이스 연결 실패" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/notice", noticeRouter);
app.use("/api/qa", qaRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

async function start() {
  ensureQaUploadDir();
  await initDb();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API server:", error);
  process.exit(1);
});
