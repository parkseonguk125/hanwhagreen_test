import { test, expect } from "@playwright/test";

test.describe("ABOUT US - 인사말", () => {
  test("GNB에서 인사말 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#header #nav");
    await nav.locator(".menu_tit", { hasText: "ABOUT US" }).hover();
    await nav.getByRole("link", { name: "인사말", exact: true }).click();
    await expect(page).toHaveURL(/co_id=ceo/);
    await expect(page.locator("#ceo")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("인사말");
  });

  test("인사말 본문 구조가 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/content.php?co_id=ceo");
    await expect(page).toHaveTitle(/인사말/);

    await expect(page.locator("#ceo > .visual .visual-banner-img")).toHaveAttribute(
      "src",
      /company_banner\.jpg/
    );

    await expect(page.locator("#ceo .blind")).toHaveText("회사소개");
    await expect(page.locator("#ceo .lf_box img")).toHaveAttribute(
      "src",
      /ceo_img01\.jpg/
    );

    await expect(page.locator("#ceo .rt_box .tit")).toContainText("창의적인 아이디어를 통해");
    await expect(page.locator("#ceo .rt_box .tit")).toContainText("새로운 가치를 만들어 갑니다");

    await expect(page.locator("#ceo .rt_box dt strong")).toHaveText(
      "한화그린에 오신걸 환영합니다"
    );
    await expect(page.locator("#ceo .rt_box .txt p")).toContainText("세계 유일한 단일 기업");
    await expect(page.locator("#ceo .rt_box .txt p")).toContainText("감사합니다.");

    await expect(page.locator("#ceo .sign p")).toHaveText(
      "(주)한화그린 대표이사 김용우 및 임직원 일동"
    );

    const watermark = await page.locator("#ceo .sec1").evaluate((el) => {
      const style = window.getComputedStyle(el, "::after");
      return {
        content: style.content,
        opacity: style.opacity,
        fontSize: style.fontSize,
      };
    });
    expect(watermark.content).toContain("GREETINGS");
    expect(Number(watermark.opacity)).toBeGreaterThan(0);
  });
});
