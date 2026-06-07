import { test, expect } from "@playwright/test";

test.describe("ABOUT US - 오시는길", () => {
  test("GNB에서 오시는길 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#header #nav");
    await nav.locator(".menu_tit", { hasText: "ABOUT US" }).hover();
    await nav.getByRole("link", { name: "오시는길", exact: true }).click();
    await expect(page).toHaveURL(/co_id=map/);
    await expect(page.locator("#map")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("오시는 길");
  });

  test("오시는길 본문 구조가 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/content.php?co_id=map");
    await expect(page).toHaveTitle(/오시는/);

    await expect(page.locator("#map > .visual .visual-banner-img")).toHaveAttribute(
      "src",
      /company_banner\.jpg/
    );

    await expect(page.locator("#map .title")).toHaveText("오시는 길");
    await expect(page.locator("#daumRoughmapContainer1713010532775")).toHaveCount(1);
    await expect(page.locator("#daumRoughmapContainer1756457907165")).toHaveCount(1);
    await expect(page.locator("#daumRoughmapContainer1713010532775")).toHaveClass(
      /root_daum_roughmap/
    );

    await expect(page.locator("#daumRoughmapContainer1713010532775 .wrap_map")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("#daumRoughmapContainer1756457907165 .wrap_map")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("button", { name: "확대" })).toHaveCount(2);

    const headquartersInfo = page.locator("#map .map_info").first();
    await expect(headquartersInfo.locator("strong")).toHaveText("한화그린");
    await expect(headquartersInfo.getByText("경북 칠곡군 가산면 송학5길 57-1")).toBeVisible();
    await expect(headquartersInfo.getByText("054-977-4700")).toBeVisible();
    await expect(headquartersInfo.getByText("054-977-4701")).toBeVisible();

    await expect(page.getByText("자차로 오시는 방법")).toBeVisible();
    await expect(page.getByRole("link", { name: "네비게이션 +" })).toHaveAttribute(
      "href",
      /map\.naver\.com/
    );
    await expect(page.locator("#map .btnBox")).toBeVisible();
    await expect(page.locator("#map .map-direction-text")).toHaveCount(3);
    await expect(page.getByText("서울방향에서 오실때")).toBeVisible();
    await expect(page.getByText("통영방향에서 오실때")).toBeVisible();

    const branchInfo = page.locator("#map .map_info").last();
    await expect(branchInfo.locator("strong")).toHaveText("한화그린 전라지사");
    await expect(branchInfo.getByText("전북 전주시 덕진구 진버들1길 52")).toBeVisible();
    await expect(branchInfo.getByText("010-2372-9059")).toBeVisible();
  });
});
