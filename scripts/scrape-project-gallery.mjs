import { writeFileSync } from "fs";

const categories = [];
const allItems = [];

for (let page = 1; page <= 25; page++) {
  const pageRes = await fetch(
    `https://hanwhagreen.com/bbs/board.php?bo_table=project&page=${page}`
  );
  const pageHtml = await pageRes.text();
  const items = [
    ...pageHtml.matchAll(
      /wr_id=(\d+)[^"]*" title="([^"]*)"[\s\S]*?<img src="([^"]+)" alt="([^"]*)"/g
    ),
  ];
  if (items.length === 0) {
    console.log("stop at page", page);
    break;
  }
  for (const m of items) {
    allItems.push({
      id: Number(m[1]),
      title: m[2],
      image: m[3],
      alt: m[4],
    });
  }
  console.log(`page ${page}: ${items.length}, total ${allItems.length}`);
}

// page 1 categories
const page1 = await fetch("https://hanwhagreen.com/bbs/board.php?bo_table=project");
const html = await page1.text();
const cateBlock = html.match(/<nav id="board_cate">[\s\S]*?<\/nav>/);
if (cateBlock) {
  for (const m of cateBlock[0].matchAll(/<a href="([^"]+)"(?: id="bo_cate_on")?>([^<]+)<\/a>/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    const scaMatch = href.match(/sca=([^&]+)/);
    categories.push({
      label: m[2],
      sca: scaMatch ? decodeURIComponent(scaMatch[1]) : "",
    });
  }
}

// pagination total pages
const endMatch = html.match(/page=(\d+)" class="pg_page pg_end"/);
const totalPages = endMatch ? Number(endMatch[1]) : 1;

writeFileSync(
  "frontend/src/data/projectGalleryMeta.json",
  JSON.stringify({ categories, totalPages, pageSize: 15 }, null, 2),
  "utf8"
);

const lines = [
  "/** 주요실적 갤러리 데이터 (원본 hanwhagreen.com 동기화) */",
  "export const projects = [",
];
for (const item of allItems) {
  lines.push(
    `  { id: ${item.id}, title: ${JSON.stringify(item.title)}, image: ${JSON.stringify(item.image)} },`
  );
}
lines.push("];");
writeFileSync("frontend/src/data/projects.js", `${lines.join("\n")}\n`, "utf8");

console.log("categories", categories.length, "items", allItems.length, "pages", totalPages);
