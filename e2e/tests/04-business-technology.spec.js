import { test, expect } from "@playwright/test";

test.describe("BUSINESS - 보유기술", () => {
  test("GNB에서 보유기술 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#header #nav");
    await nav.locator(".menu_tit", { hasText: "BUSINESS" }).hover();
    await nav.getByRole("link", { name: "보유기술", exact: true }).click();
    await expect(page).toHaveURL(/co_id=technology/);
    await expect(page.locator("#technology")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("보유기술");
  });

  test("보유기술 본문 구조가 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/content.php?co_id=technology");
    await expect(page).toHaveTitle(/보유기술/);

    await expect(page.locator("#technology > .visual .visual-banner-img")).toHaveAttribute(
      "src",
      /business\.webp/
    );

    const items = page.locator("#technology #bo_list .qa_li");
    await expect(items).toHaveCount(8);
    await expect(items.nth(0)).toContainText("액비순환시스템");
    await expect(items.nth(1)).toContainText("돈사내 미생물");
    await expect(items.nth(7)).toContainText("축사스마트팜");

    await expect(
      page.locator("#technology #bo_list .faq_icon img").first()
    ).toHaveAttribute("src", /play-btn\.png/);
    await expect(
      page.locator("#technology #bo_list .rt_box img").first()
    ).toHaveAttribute("src", /faq_arrow\.png/);

    await items.nth(0).locator(".question").click();
    await expect(items.nth(0).locator(".question")).toHaveClass(/on/);
    await expect(items.nth(0).locator(".answer")).toHaveClass(/on/);
    await expect(items.nth(0).locator(".answer")).toBeVisible();
    await expect(items.nth(0).locator(".answer img")).toHaveAttribute(
      "src",
      /recycle\.png/
    );

    await items.nth(1).locator(".question").click();
    await expect(items.nth(1).locator(".answer iframe")).toHaveAttribute(
      "src",
      /4MjzihYhk54/
    );

    await items.nth(2).locator(".question").click();
    await expect(items.nth(2).locator(".answer")).toContainText("슬러지 발생향 1% 미만");
    await expect(items.nth(2).locator(".answer img")).toHaveAttribute(
      "src",
      /NoCompostSystem\.png/
    );

    await items.nth(7).locator(".question").click();
    await expect(items.nth(7).locator(".answer img")).toHaveAttribute(
      "src",
      /smartfarm\.png/
    );

    await expect(page.locator("#business2 h4").nth(0)).toHaveText("기술목표");
    await expect(page.locator("#business2 h4").nth(1)).toHaveText("기술개요");
    await expect(page.locator("#business2 .sec3-inner dd")).toHaveCount(16);
    await expect(page.getByText("4 無 실현")).toBeVisible();
    await expect(page.getByText("고도처리조 및 장치를 신설하여")).toBeVisible();
  });
});
