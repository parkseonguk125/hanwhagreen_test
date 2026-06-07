import { test, expect } from "@playwright/test";

test.describe("기본 smoke", () => {
  test("홈페이지가 열린다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/한화그린/);
    await expect(page.getByRole("link", { name: "한화그린" }).first()).toBeVisible();
  });

  test("공지사항 페이지가 열린다", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=notice");
    await expect(page.locator(".visual .text_box h2")).toHaveText("공지사항");
  });

  test("온라인문의 페이지가 열린다", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=qa");
    await expect(page.locator(".visual .text_box h2")).toHaveText("온라인문의");
  });
});
