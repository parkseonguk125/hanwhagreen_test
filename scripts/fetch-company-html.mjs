const res = await fetch("https://hanwhagreen.com/bbs/content.php?co_id=company");
const html = await res.text();
for (const m of html.matchAll(/href="([^"]+\.css[^"]*)"/g)) {
  console.log(m[1]);
}
