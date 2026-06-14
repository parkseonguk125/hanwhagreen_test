import { test, expect } from "@playwright/test";

test.use({ launchOptions: { slowMo: 800 } });

const PAUSE_MS = 1200;

async function pause(page, ms = PAUSE_MS) {
  await page.waitForTimeout(ms);
}

async function clickGnbItem(page, groupTitle, itemLabel) {
  const nav = page.locator("#header #nav");
  if (groupTitle) {
    await nav.locator(".menu_tit", { hasText: groupTitle }).hover();
    await pause(page, 600);
    await nav.getByRole("link", { name: itemLabel, exact: true }).click();
  } else {
    await page
      .locator("#header")
      .getByRole("link", { name: itemLabel, exact: true })
      .first()
      .click();
  }
}

test.describe("홈페이지 구경 데모", () => {
  test("메뉴 탐색 · 로그인 · 온라인문의 작성", async ({ page }) => {
    test.setTimeout(180000);

    page.on("dialog", (dialog) => dialog.accept());

    // 1) 홈에서 둘러보기
    await page.goto("/");
    await expect(page).toHaveTitle(/한화그린/);
    await pause(page, 2000);

    // 2) ABOUT US → 인사말
    await clickGnbItem(page, "ABOUT US", "인사말");
    await expect(page.locator(".visual .text_box h2")).toHaveText("인사말");
    await pause(page);

    // 3) BUSINESS → 보유기술
    await clickGnbItem(page, "BUSINESS", "보유기술");
    await expect(page.locator(".visual .text_box h2")).toHaveText("보유기술");
    await pause(page);

    // 4) 회사실적 → 주요실적
    await clickGnbItem(page, "회사실적", "주요실적");
    await expect(page.locator(".visual .text_box h2")).toHaveText("주요실적");
    await pause(page);

    // 5) 고객센터 → 공지사항
    await clickGnbItem(page, "고객센터", "공지사항");
    await expect(page.locator(".visual .text_box h2")).toHaveText("공지사항");
    await pause(page);

    // 6) 로그인
    await page.locator("#header").getByRole("link", { name: "로그인" }).click();
    await expect(page.locator("#mb_login")).toBeVisible();
    await pause(page);

    await page.locator("#login_id").fill("admin");
    await pause(page, 500);
    await page.locator("#login_pw").fill("green1234");
    await pause(page, 500);
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page.locator(".header-user-name")).toContainText("관리자님");
    await pause(page, 1500);

    // 7) 온라인문의 목록
    await clickGnbItem(page, "고객센터", "온라인문의");
    await expect(page.locator(".visual .text_box h2")).toHaveText("온라인문의");
    await pause(page);

    // 8) 글쓰기
    await page.locator('a[title="글쓰기"]').first().click();
    await expect(page.locator("#wr_subject")).toBeVisible();
    await pause(page);

    const stamp = new Date().toLocaleString("ko-KR");
    const subject = `Playwright 체험 문의 (${stamp})`;

    await page.locator("#wr_name").fill("홍길동");
    await pause(page, 400);
    await page.locator("#wr_password").fill("test1234");
    await pause(page, 400);
    await page.locator("#wr_email").fill("demo@example.com");
    await pause(page, 400);
    await page.locator("#wr_subject").fill(subject);
    await pause(page, 400);
    await page.locator("#wr_content").fill(
      "Playwright headed 모드로 홈페이지를 직접 둘러보며 남긴 테스트 문의입니다.\n실제 방문자가 글을 남기는 흐름을 확인합니다."
    );
    await pause(page, 800);
    await page.locator("#recaptcha-check").check();
    await pause(page, 800);

    await page.getByRole("button", { name: "작성완료" }).click();
    await pause(page, 2000);

    // 9) 작성된 글 상세 확인
    await expect(page.getByText(subject)).toBeVisible({ timeout: 10000 });
    await pause(page, 2000);

    // 10) 홈으로 돌아가기
    await page.locator("#header .logo a").click();
    await expect(page).toHaveTitle(/한화그린/);
    await pause(page, 1500);
  });
});
