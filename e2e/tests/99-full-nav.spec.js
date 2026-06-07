import { test, expect } from "@playwright/test";

async function clickGnbItem(page, groupTitle, itemLabel) {
  const nav = page.locator("#header #nav");
  if (groupTitle) {
    await nav.locator(".menu_tit", { hasText: groupTitle }).hover();
    await nav.getByRole("link", { name: itemLabel, exact: true }).click();
  } else {
    await page.locator("#header").getByRole("link", { name: itemLabel, exact: true }).first().click();
  }
}

const menuCases = [
  { group: null, label: "회사소개", url: /co_id=company/, heading: "회사소개" },
  { group: "ABOUT US", label: "인사말", url: /co_id=ceo/, heading: "인사말" },
  { group: "ABOUT US", label: "오시는길", url: /co_id=map/, heading: "오시는 길" },
  { group: "BUSINESS", label: "보유기술", url: /co_id=technology/, heading: "보유기술" },
  { group: "회사실적", label: "공사실적", url: /co_id=construction/, heading: "공사실적" },
  { group: "회사실적", label: "주요실적", url: /bo_table=project/, heading: "주요실적" },
  { group: "지식산업권 외", label: "인증서", url: /bo_table=certification/, heading: "인증서" },
  { group: "고객센터", label: "공지사항", url: /bo_table=notice/, heading: "공지사항" },
  { group: "고객센터", label: "온라인문의", url: /bo_table=qa/, heading: "온라인문의" },
];

test.describe("전체 GNB 네비게이션", () => {
  for (const item of menuCases) {
    test(`${item.label} 메뉴`, async ({ page }) => {
      await page.goto("/");
      await clickGnbItem(page, item.group, item.label);
      await expect(page).toHaveURL(item.url);
      await expect(page.locator(".visual .text_box h2")).toHaveText(item.heading);
    });
  }

  test("푸터 링크 - 회사소개", async ({ page }) => {
    await page.goto("/");
    await page.locator("#footer").getByRole("link", { name: "회사소개" }).click();
    await expect(page).toHaveURL(/co_id=company/);
  });
});
