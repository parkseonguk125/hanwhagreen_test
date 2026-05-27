import express from "express";
import qaRouter from "./routes/qa.js";
import { getDb } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

getDb();

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/qa", qaRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server listening on port ${PORT}`);
});
