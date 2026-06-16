/**
 * 카카오 OAuth — 리프레시 토큰 1회 발급 (나에게 보내기)
 * 사용: node scripts/kakao-setup-token.mjs
 * 사전: Kakao Developers 에 Redirect URI http://localhost:8765/callback 등록
 */
import http from "http";
import { exec } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = resolve(ROOT, ".env");
const REDIRECT_URI = "http://localhost:8765/callback";
const PORT = 8765;

function loadEnvValue(name) {
  if (!existsSync(ENV_PATH)) return "";
  const match = readFileSync(ENV_PATH, "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
  return match?.[1]?.trim() || "";
}

function loadRestApiKey() {
  const key = loadEnvValue("KAKAO_REST_API_KEY");
  if (key) return key;
  console.error("오류: .env 에 KAKAO_REST_API_KEY= 를 먼저 넣어 주세요.");
  process.exit(1);
}

async function exchangeCode(clientId, code, clientSecret) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code,
  });
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { error: raw || `HTTP ${response.status}` };
  }
  if (!response.ok) {
    const code = data.error_code || data.code;
    const detail = data.error_description || data.error || JSON.stringify(data);
    const hint =
      code === "KOE320" || /authorization code not found/i.test(detail)
        ? "\n\n→ 인증 코드가 만료/재사용됨. Ctrl+C 후 스크립트를 다시 실행하고 새로 로그인하세요."
        : code === "KOE303" || /redirect uri mismatch/i.test(detail)
          ? `\n\n→ hanwhagreen-test 키의 Redirect URI에 정확히 ${REDIRECT_URI} 가 등록됐는지 확인하세요.`
          : code === "KOE010" || /client_secret/i.test(detail)
            ? "\n\n→ hanwhagreen-test 키의 카카오 로그인 클라이언트 시크릿을 .env KAKAO_CLIENT_SECRET 에 넣으세요."
            : code === "KOE101" || /invalid_client/i.test(detail)
              ? "\n\n→ REST API 키가 hanwhagreen-test 키와 일치하는지 확인하세요."
              : "";
    if (!clientSecret && /secret|client/i.test(detail)) {
      throw new Error(
        `${detail}${hint}\n\n→ Kakao Developers 에서 클라이언트 시크릿이 ON 이면 .env 에 KAKAO_CLIENT_SECRET= 를 넣으세요.`
      );
    }
    throw new Error(`${code ? `[${code}] ` : ""}${detail}${hint}` || "토큰 교환 실패");
  }
  return data;
}

const clientId = loadRestApiKey();
const clientSecret = loadEnvValue("KAKAO_CLIENT_SECRET");
const authUrl =
  `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code&scope=talk_message`;

console.log("\n=== 카카오 로그인 (1회) ===\n");
console.log(`REST API 키: ${clientId.slice(0, 8)}... (hanwhagreen-test 키와 같은지 확인)`);
console.log(`클라이언트 시크릿: ${clientSecret ? "로드됨" : "없음 — ON 이면 .env 에 KAKAO_CLIENT_SECRET 필요"}`);
console.log(`Redirect URI: ${REDIRECT_URI}`);
console.log("→ 카카오 콘솔: hanwhagreen-test → 로그인 리다이렉트 URI 에 위 주소 등록\n");
console.log("아래 URL을 브라우저에 붙여넣고 로그인·동의하세요:\n");
console.log(authUrl);
console.log("\n대기 중... (포트 8765)\n");

function openBrowser(url) {
  if (process.platform === "win32") {
    exec(`start "" "${url}"`);
    console.log("(브라우저를 자동으로 열었습니다. 안 열리면 위 URL을 직접 붙여넣으세요.)\n");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>로그인 실패</h1><p>터미널을 확인하세요.</p>");
    console.error("OAuth error:", error || "no code");
    server.close();
    process.exit(1);
  }

  try {
    const tokens = await exchangeCode(clientId, code, clientSecret);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>성공!</h1><p>터미널의 리프레시 토큰을 .env 에 저장하세요. 이 창은 닫아도 됩니다.</p>");

    console.log("\n=== 성공 — .env 에 아래를 추가하세요 ===\n");
    console.log(`KAKAO_REFRESH_TOKEN=${tokens.refresh_token}`);
    if (tokens.refresh_token_expires_in) {
      console.log(`\n(refresh_token 만료까지 약 ${Math.floor(tokens.refresh_token_expires_in / 86400)}일)`);
    }
    console.log("\nADMIN_NOTIFY_ENABLED=1");
    console.log("NOTIFY_PROVIDER=kakao\n");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>오류</h1><pre>${err.message}</pre>`);
    console.error(err.message);
    process.exit(1);
  } finally {
    setTimeout(() => server.close(), 500);
  }
});

server.listen(PORT, () => {
  console.log(`콜백 서버: http://localhost:${PORT}/callback`);
  openBrowser(authUrl);
});
