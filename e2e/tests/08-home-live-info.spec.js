import { test, expect } from "@playwright/test";

test.describe("홈 실시간 정보 섹션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("실시간 정보 섹션과 4개 패널이 표시된다", async ({ page }) => {
    const section = page.locator(".live-info-section");
    await expect(section).toBeVisible();
    await expect(section.getByRole("heading", { name: "실시간 정보" })).toBeVisible();

    await expect(section.getByRole("heading", { name: "전국 날씨" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "전국 미세먼지" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "핵심 주가" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "한화그린 위치" })).toBeVisible();
  });

  test("한화그린 주소가 표시된다", async ({ page }) => {
    await expect(page.getByText("경북 칠곡군 가산면 송학5길 57-1")).toBeVisible();
  });

  test("길찾기 링크가 네이버 지도를 가리킨다", async ({ page }) => {
    const link = page.locator(".live-panel-map .live-map-link");
    await expect(link).toHaveAttribute("href", /map\.naver\.com/);
  });
});
