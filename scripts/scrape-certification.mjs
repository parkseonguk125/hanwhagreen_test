import { writeFileSync } from "fs";

const allItems = [];

for (let page = 1; page <= 5; page++) {
  const html = await (
    await fetch(`https://hanwhagreen.com/bbs/board.php?bo_table=certification&page=${page}`)
  ).text();

  const matches = [
    ...html.matchAll(
      /<li style="position: relative;">[\s\S]*?<img src="([^"]+)"[\s\S]*?<strong class="tit">\s*([\s\S]*?)<\/strong>[\s\S]*?wr_id=(\d+)/g
    ),
  ];

  if (matches.length === 0) break;

  for (const m of matches) {
    allItems.push({
      id: Number(m[3]),
      title: m[2].replace(/\s+/g, " ").trim(),
      image: m[1],
    });
  }
}

for (const item of allItems) {
  const html = await (
    await fetch(
      `https://hanwhagreen.com/bbs/board.php?bo_table=certification&wr_id=${item.id}`
    )
  ).text();

  const title = html.match(/<p class="title2">([\s\S]*?)<\/p>/);
  const date = html.match(/<dt>등록일<\/dt>\s*<dd><span>([^<]+)<\/span>/);
  const content = html.match(/<div class="cont_box">\s*<p>([\s\S]*?)<\/p>/);
  const img = html.match(/id="bo_v_img"[\s\S]*?<img src="([^"]+)"/);

  const prevBlock = html.match(
    /<span class="tit">이전글<\/span>[\s\S]*?wr_id=(\d+)[\s\S]*?<p class="txt">([\s\S]*?)<\/p>/
  );
  const nextBlock = html.match(
    /<span class="tit">다음글<\/span>[\s\S]*?wr_id=(\d+)[\s\S]*?<p class="txt">([\s\S]*?)<\/p>/
  );

  item.subject = title?.[1]?.replace(/\s+/g, " ").trim() || item.title;
  item.date = date?.[1] || "2024-01-30";
  item.content = content?.[1]?.replace(/\s+/g, " ").trim() || item.subject;
  item.imageLink = img?.[1] || item.image;
  item.prev = prevBlock
    ? { id: Number(prevBlock[1]), subject: prevBlock[2].replace(/\s+/g, " ").trim() }
    : null;
  item.next = nextBlock
    ? { id: Number(nextBlock[1]), subject: nextBlock[2].replace(/\s+/g, " ").trim() }
    : null;
}

const sortedByIdDesc = [...allItems].sort((a, b) => b.id - a.id);
for (let index = 0; index < sortedByIdDesc.length; index += 1) {
  const item = sortedByIdDesc[index];
  const prevItem = index > 0 ? sortedByIdDesc[index - 1] : null;
  const nextItem = index < sortedByIdDesc.length - 1 ? sortedByIdDesc[index + 1] : null;

  item.prev = prevItem
    ? { id: prevItem.id, subject: prevItem.subject || prevItem.title }
    : null;
  item.next = nextItem
    ? { id: nextItem.id, subject: nextItem.subject || nextItem.title }
    : null;
}

writeFileSync(
  "frontend/src/data/certifications.js",
  `/** 인증서 갤러리 데이터 (원본 hanwhagreen.com 동기화) */\nexport const certifications = ${JSON.stringify(allItems, null, 2)};\n`,
  "utf8"
);

writeFileSync(
  "frontend/src/data/certificationGalleryMeta.json",
  JSON.stringify({ pageSize: 15, totalPages: Math.ceil(allItems.length / 15) }, null, 2),
  "utf8"
);

console.log("saved", allItems.length);
