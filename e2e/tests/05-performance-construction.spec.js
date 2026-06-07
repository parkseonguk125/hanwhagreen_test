import { test, expect } from "@playwright/test";

test.describe("회사실적 - 공사실적", () => {
  test("GNB에서 공사실적 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#header #nav");
    await nav.locator(".menu_tit", { hasText: "회사실적" }).hover();
    await nav.getByRole("link", { name: "공사실적", exact: true }).click();
    await expect(page).toHaveURL(/co_id=construction/);
    await expect(page.locator("#board_list01.construction-page")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("공사실적");
  });

  test("공사실적 본문 구조가 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/content.php?co_id=construction");
    await expect(page).toHaveTitle(/공사실적/);

    await expect(
      page.locator("#board_list01.construction-page > .visual .visual-banner-img")
    ).toHaveAttribute("src", /construction2\.webp/);

    const table = page.locator("#board_list01 #bo_list .tbl_head01 table");
    await expect(table).toBeVisible();

    const headers = table.locator("thead th");
    await expect(headers).toHaveCount(8);
    await expect(headers.nth(0)).toHaveText("번호");
    await expect(headers.nth(7)).toHaveText("비교");

    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(124);
    await expect(rows.first()).toHaveClass(/even/);
    await expect(rows.first().locator(".td_num2")).toHaveText("1");
    await expect(rows.first().locator(".td_subject").first()).toHaveText("은혜축산");
    await expect(rows.last().locator(".td_num2")).toHaveText("124");
    await expect(rows.last().locator(".td_subject").first()).toHaveText("왕신농장");

    await expect(table.getByRole("cell", { name: "두", exact: true })).toBeVisible();
    await expect(table.getByRole("cell", { name: "2차", exact: true })).toBeVisible();
    await expect(table.getByRole("cell", { name: "왕궁", exact: true })).toBeVisible();
    await expect(table.getByRole("cell", { name: "평", exact: true })).toBeVisible();
    await expect(table.getByRole("cell", { name: "태흥종축" })).toBeVisible();
    await expect(table.getByRole("cell", { name: "25,000" })).toBeVisible();
  });
});
