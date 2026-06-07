import { test, expect } from "@playwright/test";

test.describe("회사실적 - 주요실적", () => {
  test("GNB에서 주요실적 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#header #nav");
    await nav.locator(".menu_tit", { hasText: "회사실적" }).hover();
    await nav.getByRole("link", { name: "주요실적", exact: true }).click();
    await expect(page).toHaveURL(/bo_table=project/);
    await expect(page.locator("#product03")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("주요실적");
  });

  test("주요실적 갤러리 목록이 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=project");
    await expect(page).toHaveTitle(/주요실적/);

    await expect(page.locator("#product03 > .visual .visual-banner-img")).toHaveAttribute(
      "src",
      /construction2\.webp/
    );

    await expect(page.locator("#board_cate li")).toHaveCount(15);
    await expect(page.locator("#board_cate #bo_cate_on")).toHaveText("전체");
    await expect(page.locator("#board_cate").getByRole("link", { name: "축사스마트팜" })).toBeVisible();
    await expect(page.locator("#board_cate").getByRole("link", { name: "지렁이농장" })).toBeVisible();

    const items = page.locator("#bo_list .listForm li");
    await expect(items).toHaveCount(15);
    await expect(items.first().locator("h2.subject")).toHaveText(/상철농장_202505291_51/);
    await expect(items.nth(14).locator("h2.subject")).toHaveText(/상철농장_202505291_37/);

    await expect(page.locator(".pg_current")).toHaveText("열린1페이지");
    await expect(page.locator(".pg_page", { hasText: "2" })).toBeVisible();
    await expect(page.locator(".pg_page.pg_end")).toBeVisible();
  });

  test("주요실적 카테고리와 페이지 이동", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=project");
    await page.locator("#board_cate").getByRole("link", { name: "축사스마트팜" }).click();
    await expect(page).toHaveURL(/sca=/);
    await expect(page.locator("#board_cate #bo_cate_on")).toHaveText("축사스마트팜");

    await page.goto(
      "/bbs/board.php?bo_table=project&sca=%EC%B6%95%EC%82%B0%EB%B6%84%EB%87%A8+%EC%95%A1%EB%B9%84%EC%88%9C%ED%99%98%EC%8B%9C%EC%8A%A4%ED%85%9C%2C+%EC%95%85%EC%B7%A8%EC%A0%80%EA%B0%90"
    );
    await expect(page.locator("#board_cate #bo_cate_on")).toHaveText("축산분뇨 액비순환시스템, 악취저감");
    const items = page.locator("#bo_list .listForm li");
    await expect(items).toHaveCount(15);
    await expect(items.first().locator("h2.subject")).toHaveText(/액비순환 영상 20250529-4/);

    await page.goto("/bbs/board.php?bo_table=project&page=2");
    await expect(page.locator(".pg_current")).toHaveText("2페이지");
    await expect(page.locator("#bo_list .listForm li")).toHaveCount(15);

    await page.goto("/bbs/board.php?bo_table=project&page=10");
    await expect(page.locator(".pg_page.pg_next")).toBeVisible();
    await expect(page.locator(".pg_current")).toHaveText("10페이지");

    await page.goto("/bbs/board.php?bo_table=project&page=11");
    await expect(page.locator(".pg_page.pg_prev")).toBeVisible();
    await expect(page.locator(".pg_current")).toHaveText("열린11페이지");
  });

  test("빈 카테고리는 게시물 없음 메시지를 표시한다", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=project");
    await page.locator("#board_cate").getByRole("link", { name: "바이오가스화시설,온실가스 저감" }).click();
    await expect(page.locator("#board_cate #bo_cate_on")).toHaveText("바이오가스화시설,온실가스 저감");
    await expect(page.locator("#board_cate #bo_cate_on")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.locator("#bo_list .listForm li.empty_list")).toHaveText("게시물이 없습니다.");
    await expect(page.locator(".pg_wrap")).toHaveCount(0);

    await page.locator("#board_cate").getByRole("link", { name: "도축장" }).click();
    await expect(page.locator("#board_cate #bo_cate_on")).toHaveText("도축장");
    await expect(page.locator("#bo_list .listForm li.empty_list")).toHaveText("게시물이 없습니다.");
  });

  test("주요실적 상세 페이지", async ({ page }) => {
    await page.goto("/bbs/board.php?bo_table=project&wr_id=354");
    await expect(page.locator("#bo_v_img img")).toBeVisible();
    await expect(page.getByRole("link", { name: "목록" })).toBeVisible();
    await expect(page.locator("#bo_v_con")).toContainText("상철농장_202505291_51");
  });
});
