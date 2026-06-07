import { readFileSync, writeFileSync } from "fs";

function encodeScaParam(sca) {
  return sca.split("+").map((part) => encodeURIComponent(part)).join("+");
}

const meta = JSON.parse(readFileSync("frontend/src/data/projectGalleryMeta.json", "utf8"));
const idToSca = {};

for (const category of meta.categories) {
  if (!category.sca) continue;
  let page = 1;
  while (page <= 50) {
    const url = `https://hanwhagreen.com/bbs/board.php?bo_table=project&sca=${encodeScaParam(category.sca)}&page=${page}`;
    const html = await (await fetch(url)).text();
    const ids = [...html.matchAll(/wr_id=(\d+)/g)].map((m) => Number(m[1]));
    const unique = [...new Set(ids)].filter((id) => id > 0);
    if (unique.length === 0) break;
    for (const id of unique) idToSca[id] = category.sca;
    const hasNext = html.includes(`page=${page + 1}`);
    console.log(category.label, "page", page, unique.length);
    if (!hasNext) break;
    page += 1;
  }
}

writeFileSync("frontend/src/data/projectCategoryMap.json", JSON.stringify(idToSca, null, 2), "utf8");
console.log("mapped", Object.keys(idToSca).length);
