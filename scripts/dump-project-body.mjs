const res = await fetch("https://hanwhagreen.com/bbs/board.php?bo_table=project");
const html = await res.text();

const listStart = html.indexOf('class="listSkin"');
const footerStart = html.indexOf("<footer", listStart);
console.log(html.slice(listStart, footerStart));
