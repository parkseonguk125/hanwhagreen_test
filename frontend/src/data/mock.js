const ASSET = "https://hanwhagreen.com";

export const assets = {
  logoBlack: `${ASSET}/html/typhoon_html/images/hd_logo_black.png`,
  logoWhite: `${ASSET}/html/typhoon_html/images/hd_logo.png`,
  heroSlides: [
    `${ASSET}/theme/FT_WEB50/img/main_pig_with_green.jpg`,
    `${ASSET}/theme/FT_WEB50/img/main_slide_02.jpg`,
    `${ASSET}/theme/FT_WEB50/img/main_slide_03.jpg`,
  ],
  areaPanels: [
    `${ASSET}/theme/FT_WEB50/img/area_con01.jpg`,
    `${ASSET}/theme/FT_WEB50/img/area_con02.jpg`,
    `${ASSET}/theme/FT_WEB50/img/area_con04.jpg`,
  ],
  galleryBg: `${ASSET}/theme/FT_WEB50/img/gall_Back.jpg`,
};

export const topLinks = [
  { label: "회사소개", href: "#", icon: "at" },
  { label: "공지사항", href: "/bbs/board.php?bo_table=notice", icon: "mega-phone" },
  { label: "고객센터", href: "/bbs/board.php?bo_table=qa", icon: "headphone" },
  { label: "보유기술", href: "#", icon: "badge" },
];

export const navGroups = [
  {
    title: "ABOUT US",
    items: [
      { label: "회사소개", href: "#" },
      { label: "인사말", href: "#" },
      { label: "오시는길", href: "#" },
    ],
  },
  { title: "BUSINESS", items: [{ label: "보유기술", href: "#" }] },
  {
    title: "회사실적",
    items: [
      { label: "공사실적", href: "#" },
      { label: "주요실적", href: "#" },
    ],
  },
  { title: "지식산업권 외", items: [{ label: "인증서", href: "#" }] },
  {
    title: "고객센터",
    items: [
      { label: "공지사항", href: "/bbs/board.php?bo_table=notice" },
      { label: "온라인문의", href: "/bbs/board.php?bo_table=qa" },
    ],
  },
];

export const introLines = [
  "한화그린은",
  "녹색환경의 선두주자로서",
  "지속적으로 성장하는 벤처기업입니다.",
];

export const areaTabs = [
  {
    id: 0,
    label: "회사소개",
    text: "한화그린은 환경을 우선으로<br> 최적화된 새로운 정화기술을 제시합니다.",
  },
  {
    id: 1,
    label: "공사실적",
    text: "한화그린은 다양한 수처리, 에너지화 현장에<br> 최적화된 혁신적인 기술과 솔루션을 제시합니다.",
  },
  {
    id: 2,
    label: "보유기술",
    text: "한화그린은 많은 현장경험으로<br> 자체 기술력을 보유하고 있습니다.",
  },
];

export const projects = [
  { title: "상철농장_202505291_51", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_z83HnRqp_9be3f49d0bf795e0b47ba5772a48e140f1f666d8_480x420.jpg` },
  { title: "상철농장_202505291_50", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_YNj8r3eB_07661ce2aaaf72377c6b611aa566623e03062dce_480x420.jpg` },
  { title: "상철농장_202505291_49", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_dR63jQHJ_7053ab53ef42fc8695a9833822d14f3cc0f1b22c_480x420.jpg` },
  { title: "상철농장_202505291_48", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_doJYsLwG_1caab4ff1c7c130067b9c0ee4148cee435b44ebd_480x420.jpg` },
  { title: "상철농장_202505291_47", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_ZuWlh5ty_1588e995b2a25b94396ea1b938ce4ec5eb6d83ec_480x420.jpg` },
  { title: "상철농장_202505291_46", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_SLKA4CjN_069de84156ce09088781f864561be8588d3d35ed_480x420.jpg` },
  { title: "상철농장_202505291_45", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_jfenuKR8_176c864d5da0055a92807333c305f5ce59d6c20e_480x420.jpg` },
  { title: "상철농장_202505291_44", image: `${ASSET}/data/file/project/thumb-33e14eacab792c84887f35beff081a70_LvyAlEZk_3d20dd001e5eba191fdeaf15bafb0284a897e1bb_480x420.jpg` },
];

export const certificates = [
  { title: "안전보건경영시스템인증서", desc: "안전보건경영시스템인증서", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_ukjnd6t4_f2bd76f4c7cd7fe837034075018fe9fba2a5d047_460x550.jpg` },
  { title: "품질경영시스템 인증서", desc: "품질경영시스템 인증서", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_YXGpUTVr_6631b217814322425b718430908790dac06a66de_460x550.jpg` },
  { title: "환경경영시스템인증서", desc: "환경경영시스템인증서", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_NX5LjklR_b73cb593431a4b183a42e43e504d78583bf466d9_460x550.jpg` },
  { title: "환경전문공사업 등록증", desc: "환경전문공사업 등록증", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_nQPazRgH_1c247eb1f84773d95a2d40b8ecb5833944a6b3be_460x550.jpg` },
  { title: "건설업등록증", desc: "건설업등록증", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_q4pMRjrE_6bfddb9f9565bf3910110cf468aad89f3960037b_460x550.jpg` },
  { title: "벤처기업확인서", desc: "벤처기업확인서", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_93kpC6gw_f6be535a1b9fc332a396633ae2dbfdc57dfa8144_460x550.jpg` },
  { title: "축산폐수의 4무 정화공법", desc: "특허등록증-축산폐수의 4무 정화공법", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_MiIGQBVA_50d472aaa45a0c4c2001bb0d4b6858d7731671e3_460x550.png` },
  { title: "고농도 폐수 슬러지의 막힘 없는 산기통", desc: "고농도 폐수 슬러지의 막힘 없는 산기통", image: `${ASSET}/data/file/certification/thumb-9cdfc0fc5d82328c0a1e999cc9468361_uNmpV5YR_1034e113527c6f87122dbdbaf91114638482e518_460x550.jpg` },
];

export const promoVideos = [
  {
    id: 3,
    title: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
    desc: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_NYyQHwS5_3243b4b9e834dae13fe6c731943561660c8e3ffc_331x290.jpg`,
  },
  {
    id: 2,
    title: "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
    desc: "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_R26MGEHV_9616802bc0a0eff2f62f7a0e987bda6c65651aaf_331x290.jpg`,
  },
];

export const notices = [
  { title: "한화그린 홈페이지 리뉴얼", date: "04-11" },
];

export const noticeItem = notices[0];

export const footerInfo = {
  address: "경북 칠곡군 가산면 송학5길 57-1",
  email: "hanwhagreen@hanmail.net",
  phone: "054-977-4700",
  hours: "월~금 07:30 ~ 16:30",
};
