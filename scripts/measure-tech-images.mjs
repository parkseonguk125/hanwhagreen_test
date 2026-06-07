import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function measure(url, label) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".qa_li", { timeout: 15000 });
  const items = page.locator(".qa_li");
  const count = await items.count();
  console.log(`\n=== ${label} (${count} items) ===`);
  for (let i = 0; i < count; i++) {
    await items.nth(i).locator(".question").click();
    const title = (await items.nth(i).locator(".question .tit").textContent())?.trim();
    const img = items.nth(i).locator(".answer img").first();
    const iframe = items.nth(i).locator(".answer iframe").first();
    const lfBox = items.nth(i).locator(".answer .lf_box").first();
    const answer = items.nth(i).locator(".answer").first();

    if (await img.count()) {
      const box = await img.boundingBox();
      const lf = await lfBox.boundingBox();
      const ans = await answer.boundingBox();
      console.log(`${title}: img ${Math.round(box?.width || 0)}x${Math.round(box?.height || 0)}, lf_box ${Math.round(lf?.width || 0)}, answer ${Math.round(ans?.width || 0)}`);
    } else if (await iframe.count()) {
      const box = await iframe.boundingBox();
      console.log(`${title}: iframe ${Math.round(box?.width || 0)}x${Math.round(box?.height || 0)}`);
    } else {
      console.log(`${title}: (no media)`);
    }
  }
}

await measure("https://hanwhagreen.com/bbs/content.php?co_id=technology", "ORIGINAL");
await measure("http://localhost:8081/bbs/content.php?co_id=technology", "OURS");

await browser.close();
