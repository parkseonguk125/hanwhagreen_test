const res = await fetch("https://hanwhagreen.com/bbs/content.php?co_id=construction");
const html = await res.text();

const visual = html.match(/<section class="visual"[\s\S]*?<\/section>/);
console.log("=== VISUAL ===");
console.log(visual?.[0] ?? "not found");

const subMatch = html.match(/<div class="sub[^"]*"[^>]*>/);
console.log("\n=== SUB DIV ===");
console.log(subMatch?.[0]);

const start = html.indexOf('class="listSkin"');
const end = html.indexOf("<footer", start);
console.log("\n=== CONTENT (first 4000) ===");
console.log(html.slice(start, start + 4000));

const tableStart = html.indexOf("<table");
console.log("\n=== TABLE HEAD ===");
console.log(html.slice(tableStart, tableStart + 1500));

const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
for (const s of styleBlocks) {
  if (s[1].includes("construction") || s[1].includes("tbl_head") || s[1].includes("product")) {
    console.log("\n=== INLINE STYLE ===");
    console.log(s[1]);
  }
}
