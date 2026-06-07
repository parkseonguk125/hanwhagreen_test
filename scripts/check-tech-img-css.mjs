const urls = [
  "https://hanwhagreen.com/theme/FT_WEB50/css/common.css",
  "https://hanwhagreen.com/theme/FT_WEB50/css/default.css",
  "https://hanwhagreen.com/theme/FT_WEB50/css/sub.css",
  "https://hanwhagreen.com/theme/FT_WEB50/css/board.css",
  "https://hanwhagreen.com/bbs/content.php?co_id=technology",
];

for (const url of urls) {
  const res = await fetch(url);
  const text = await res.text();
  if (text.includes("img_box2")) {
    let idx = 0;
    while ((idx = text.indexOf("img_box2", idx)) >= 0) {
      console.log(`\n${url} @ ${idx}:`);
      console.log(text.slice(Math.max(0, idx - 100), idx + 300));
      idx += 8;
    }
  }
}

const pageRes = await fetch("https://hanwhagreen.com/bbs/content.php?co_id=technology");
const html = await pageRes.text();
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
for (const s of styleBlocks) {
  if (s[1].includes("img") || s[1].includes("answer")) {
    console.log("\nINLINE STYLE:", s[1].slice(0, 500));
  }
}
