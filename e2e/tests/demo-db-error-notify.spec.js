import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

test.use({ launchOptions: { slowMo: 800 } });

const PAUSE_MS = 1500;
const ROOT = process.cwd();

function pause(page, ms = PAUSE_MS) {
  return page.waitForTimeout(ms);
}

function docker(args) {
  execSync(`docker compose ${args}`, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });
}

test.describe("1단계 DB 장애 (복구 없음)", () => {
  test("홈 구경 -> DB 중지 -> 로그인 실패까지", async ({ page }) => {
    test.setTimeout(180000);

    page.on("dialog", (dialog) => dialog.accept());

    await page.goto("/");
    await expect(page).toHaveTitle(/한화그린/);
    await pause(page, 2000);

    await page.locator("#header").getByRole("link", { name: "회사소개", exact: true }).first().click();
    await expect(page.locator(".visual .text_box h2")).toHaveText("회사소개");
    await pause(page, 1500);

    await page.locator("#header .logo a").click();
    await pause(page, 1000);

    docker("stop db");
    await pause(page, 3000);

    await page.goto("/bbs/login.php");
    await pause(page, 1000);
    await page.locator("#login_id").fill("admin");
    await pause(page, 400);
    await page.locator("#login_pw").fill("green1234");
    await pause(page, 400);
    await page.getByRole("button", { name: "로그인" }).click();
    await pause(page, 3000);

    const health = await page.request.get("/api/health").catch(() => null);
    expect(health?.ok() ?? false).toBe(false);

    await pause(page, 5000);
  });
});
