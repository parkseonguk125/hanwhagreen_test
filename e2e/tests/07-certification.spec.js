import { test, expect } from "@playwright/test";

test.describe("지식산업권 - 인증서", () => {
  test("GNB에서 인증서 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#header #nav");
    await nav.locator(".menu_tit", { hasText: "지식산업권 외" }).hover();
    await nav.getByRole("link", { name: "인증서", exact: true }).click();
    await expect(page).toHaveURL(/bo_table=certification/);
    await expect(page.locator("#product01")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("인증서");
    await expect(page.locator(".visual .text_box .text")).toHaveText("");
    await expect(page.locator("#navigation .navi1 .tit")).toHaveText("게시판");
  });

  test("인증서 목록이 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=certification");
    await expect(page).toHaveTitle(/인증서/);

    await expect(page.locator("#product01 > .visual .visual-banner-img")).toHaveAttribute(
      "src",
      /certification\.png/
    );

    const items = page.locator("#product01 .pro_list > li");
    await expect(items).toHaveCount(15);
    await expect(items.first().locator("strong.tit")).toHaveText("안전보건경영시스템인증서");
    await expect(items.first().locator(".moreBtn span")).toHaveText("more +");
    await expect(items.nth(14).locator("strong.tit")).toHaveText(
      /미세오존가족증폭장치와 광촉매를 활용한/
    );

    await expect(page.locator(".pg_current")).toHaveText("열린1페이지");
    await expect(page.locator(".pg_page", { hasText: "2" })).toBeVisible();
    await expect(page.locator(".pg_page.pg_end")).toBeVisible();
  });

  test("인증서 2페이지 이동", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=certification&page=2");
    await expect(page.locator(".pg_current")).toHaveText("2페이지");
    await expect(page.locator("#product01 .pro_list > li")).toHaveCount(3);
  });

  test("인증서 상세 페이지", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=certification&wr_id=15");
    await expect(page.locator("#product01 .viewSkin .title2")).toHaveText(
      "안전보건경영시스템인증서"
    );
    await expect(page.locator("#bo_v_img img")).toBeVisible();
    await expect(page.locator(".viewSkin .cont_box")).toContainText("안전보건경영시스템인증서");
    await expect(page.locator(".viewSkin .cont_box p")).toHaveCSS("text-align", "center");
    await expect(page.locator(".list_move").getByRole("link", { name: "목록" })).toBeVisible();
    await expect(page.locator(".info_box .tit", { hasText: "이전글" })).toBeVisible();
    await expect(page.locator(".info_box .tit", { hasText: "다음글" })).toBeVisible();
    await expect(page.locator(".info_box")).toContainText("품질경영시스템 인증서");
    await expect(page.locator(".info_box")).toContainText("고농도 폐수 슬러지의 막힘 없는 산기통");
  });

  test("more + 버튼으로 상세 이동", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=certification");
    await page.locator(".pro_list li").first().locator(".moreBtn").click();
    await expect(page).toHaveURL(/wr_id=15/);
    await expect(page.locator(".viewSkin .title2")).toHaveText("안전보건경영시스템인증서");
  });
});
