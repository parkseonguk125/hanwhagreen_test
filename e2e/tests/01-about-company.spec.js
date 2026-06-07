import { test, expect } from "@playwright/test";

test.describe("ABOUT US - 회사소개", () => {
  test("GNB에서 회사소개 페이지로 이동", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "회사소개", exact: true }).first().click();
    await expect(page).toHaveURL(/co_id=company/);
    await expect(page.locator("#company")).toBeVisible();
    await expect(page.locator(".visual .text_box h2")).toHaveText("회사소개");
    await expect(page.locator(".visual .text_box p.text")).toHaveText(
      "다년간의 노하우와 경험으로 가장최적화된 기술력을 선보입니다."
    );
  });

  test("배너·소개·영상·다운로드·사업부 구조가 원본과 같다", async ({ page }) => {
    await page.goto("/bbs/content.php?co_id=company");

    const visual = page.locator("#company > .visual");
    await expect(visual.locator(".visual-banner-img")).toHaveAttribute(
      "src",
      /aboutus\.webp/
    );

    await expect(page.locator("#company .sec1-tit dt")).toContainText("녹색환경의 선두주자");
    await expect(page.locator("#company .sec1-tit dt")).toContainText("벤처기업입니다.");

    const iframes = page.locator("#company .sec1-contents iframe");
    await expect(iframes).toHaveCount(3);
    await expect(iframes.nth(0)).toHaveAttribute("src", /2miCfR4OQJU/);
    await expect(iframes.nth(1)).toHaveAttribute("src", /wnj6C5LBa80/);
    await expect(iframes.nth(2)).toHaveAttribute("src", /dU2SQylDQqw/);

    const downloads = page.locator("#faq .qa_li");
    await expect(downloads).toHaveCount(2);
    await expect(downloads.nth(0)).toContainText("회사소개서");
    await expect(downloads.nth(1)).toContainText("공사지명원");
    await expect(page.locator("#faq .faq_icon img").first()).toHaveAttribute(
      "src",
      /file_download\.png/
    );

    await expect(page.locator("#company .sec3-lt h3")).toHaveText("한화그린의 사업부");
    await expect(page.locator("#company .sec3-lt ul li")).toHaveCount(3);

    const divisionImage = page.locator("#company .sec3-img img");
    await expect(divisionImage).toHaveAttribute(
      "src",
      /sub_com01\.jpg/
    );

    await page.locator("#company .sec3-lt ul li").nth(1).click();
    await expect(page.locator("#company .sec3-lt ul li").nth(1)).toHaveClass(/active/);
    await expect(divisionImage).toHaveAttribute("src", /signboard2\.jpg/);
  });
});
