const res = await fetch("https://hanwhagreen.com/bbs/content.php?co_id=technology");
const html = await res.text();
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
for (const s of scripts) {
  if (s[1].includes("question") || s[1].includes("qa_li") || s[1].includes("listForm")) {
    console.log("=== SCRIPT ===");
    console.log(s[1].slice(0, 2000));
  }
}
