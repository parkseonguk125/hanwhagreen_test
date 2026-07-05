import { test, expect } from "@playwright/test";

test.describe("로그인 5분 제한 UI", () => {
  test("11회 실패 후 경고·입력 비활성화", async ({ page, request }) => {
    test.setTimeout(120000);

    // API rate limit 초기화
    await request.post("/api/auth/login", {
      data: { mb_id: "admin", mb_password: "warmup" },
    }).catch(() => {});

    await page.goto("/bbs/login.php");
    await page.evaluate(() => sessionStorage.removeItem("hanwhagreen_login_lockout_until"));

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    for (let i = 0; i < 11; i += 1) {
      if (await page.locator("#login_id").isDisabled()) break;

      await page.fill("#login_id", "admin");
      await page.fill("#login_pw", `wrong_${i}`);
      await page.click(".login_submit");
      await page.waitForTimeout(300);
    }

    await expect(page.locator(".login_lockout_notice")).toBeVisible();
    await expect(page.locator("#login_id")).toBeDisabled();
    await expect(page.locator(".login_submit")).toContainText("로그인 제한");
  });
});
