export const subNavGroups = [
  { title: "ABOUT US", href: "#" },
  { title: "BUSINESS", href: "#" },
  { title: "회사실적", href: "#" },
  { title: "지식산업권 외", href: "#" },
  { title: "고객센터", href: "/bbs/board.php?bo_table=qa" },
];

export const allSubMenus = [
  [
    { label: "회사소개", href: "#" },
    { label: "인사말", href: "#" },
    { label: "오시는길", href: "#" },
  ],
  [{ label: "보유기술", href: "#" }],
  [
    { label: "공사실적", href: "#" },
    { label: "주요실적", href: "#" },
  ],
  [{ label: "인증서", href: "#" }],
  [
    { label: "공지사항", href: "/bbs/board.php?bo_table=notice" },
    { label: "온라인문의", href: "/bbs/board.php?bo_table=qa" },
  ],
];

export const customerSubItems = allSubMenus[4];

export function parseAppHref(href) {
  if (!href?.startsWith("/")) return null;
  const url = new URL(href, "http://local");
  return {
    pathname: url.pathname,
    search: url.search,
  };
}

export function boardTableFromHref(href) {
  const parsed = parseAppHref(href);
  if (!parsed) return null;
  return new URLSearchParams(parsed.search).get("bo_table");
}

export function boardRouteTarget(table) {
  return parseAppHref(`/bbs/board.php?bo_table=${table}`);
}

export function boardViewRouteTarget(table, id) {
  return parseAppHref(`/bbs/board.php?bo_table=${table}&wr_id=${id}`);
}

export function boardPasswordRouteTarget(table, id, mode = "s") {
  return parseAppHref(`/bbs/password.php?w=${mode}&bo_table=${table}&wr_id=${id}`);
}
