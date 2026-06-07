import { writeFileSync } from "fs";
const res = await fetch("https://hanwhagreen.com/bbs/board.php?bo_table=project&wr_id=354");
const html = await res.text();
const start = html.indexOf('class="viewSkin"');
if (start < 0) {
  const alt = html.indexOf('id="bo_v"');
  writeFileSync("scripts/project-view.txt", html.slice(alt, alt + 4000), "utf8");
} else {
  writeFileSync("scripts/project-view.txt", html.slice(start, start + 4000), "utf8");
}
console.log("done", start);
