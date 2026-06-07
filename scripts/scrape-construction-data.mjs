import { writeFileSync } from "fs";

const res = await fetch("https://hanwhagreen.com/bbs/content.php?co_id=construction");
const html = await res.text();
const tbodyStart = html.indexOf("<tbody>");
const tbodyEnd = html.indexOf("</tbody>", tbodyStart);
const tbody = html.slice(tbodyStart, tbodyEnd);
const rows = [...tbody.matchAll(/<tr class="([^"]*)">([\s\S]*?)<\/tr>/g)];

const lines = [
  "/** 공사실적 테이블 데이터 (원본 hanwhagreen.com 기준) */",
  "export const constructionRecords = [",
];

for (const match of rows) {
  const cells = [...match[2].matchAll(/<td class="([^"]*)">([^<]*)<\/td>/g)].map((c) =>
    c[2].trim()
  );
  const row = {
    no: Number(cells[0]),
    year: cells[1],
    client: cells[2],
    region: cells[3],
    rep: cells[4],
    type: cells[5],
    capacity: cells[6],
    compare: cells[7] || "",
  };
  lines.push(
    `  { no: ${row.no}, year: ${row.year}, client: ${JSON.stringify(row.client)}, region: ${JSON.stringify(row.region)}, rep: ${JSON.stringify(row.rep)}, type: ${JSON.stringify(row.type)}, capacity: ${JSON.stringify(row.capacity)}, compare: ${JSON.stringify(row.compare)} },`
  );
}

lines.push("];");
writeFileSync("src/data/constructionRecords.js", `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${rows.length} records`);
