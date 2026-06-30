import rateLimit from "express-rate-limit";
import { notifySecurityEvent } from "../services/securityNotify.js";
import { getClientIp, logSecurityEvent } from "./securityLogger.js";

const windowMs = Number(process.env.SECURITY_LOGIN_WINDOW_MS ?? 15 * 60 * 1000);
const max = Number(process.env.SECURITY_LOGIN_MAX ?? 10);

export const loginRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    const ip = getClientIp(req);
    logSecurityEvent({
      event: "login_rate_limited",
      severity: 2,
      ip,
      detail: `windowMs=${windowMs} max=${max}`,
    });
    notifySecurityEvent({
      severity: 2,
      key: `login_rate_limit:${ip}`,
      title: "S2 주의: 로그인 무차별 대입 차단",
      detail: `IP ${ip} — ${windowMs / 60000}분 내 ${max}회 초과`,
      hint: "./scripts/security-block-ip.sh " + ip,
    }).catch((err) => {
      console.error("[security] notify failed:", err.message);
    });
    res.status(429).json({
      message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    });
  },
});
