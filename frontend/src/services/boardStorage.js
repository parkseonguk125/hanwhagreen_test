const ASSET = "https://hanwhagreen.com";

export const newsPosts = [
  {
    id: 3,
    subject: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
    author: "관리자",
    hits: 4712,
    date: "24-04-09 19:17",
    listDate: "04-09",
    content: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_NYyQHwS5_3243b4b9e834dae13fe6c731943561660c8e3ffc_600x338.jpg`,
    imageLink: `${ASSET}/data/file/news/9cdfc0fc5d82328c0a1e999cc9468361_NYyQHwS5_3243b4b9e834dae13fe6c731943561660c8e3ffc.jpg`,
    relatedLink: "https://www.youtube.com/embed/wnj6C5LBa80?si=ZH8ZFKJU4-wffSa0",
    linkCount: 2504,
    next: {
      id: 2,
      subject:
        "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
      date: "24.04.09",
    },
    prev: null,
  },
  {
    id: 2,
    subject:
      "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
    author: "관리자",
    hits: 4812,
    date: "24-04-09 19:16",
    listDate: "04-09",
    content:
      "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_R26MGEHV_9616802bc0a0eff2f62f7a0e987bda6c65651aaf_600x338.jpg`,
    imageLink: `${ASSET}/data/file/news/9cdfc0fc5d82328c0a1e999cc9468361_R26MGEHV_9616802bc0a0eff2f62f7a0e987bda6c65651aaf.jpg`,
    relatedLink: "https://www.youtube.com/embed/dU2SQylDQqw?si=FZxEadWx3bf5zy2_",
    linkCount: 2436,
    prev: {
      id: 3,
      subject: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
      date: "24.04.09",
    },
    next: {
      id: 1,
      subject:
        "인류최강 축산분뇨정화처리기업, 독보적인 기술력, 극강의 소통력, (주)한화그린, 매일경제TV 극찬기업 20230317 김용우 대표이사 독점 영상",
      date: "24.04.09",
    },
  },
  {
    id: 1,
    subject:
      "인류최강 축산분뇨정화처리기업, 독보적인 기술력, 극강의 소통력, (주)한화그린, 매일경제TV 극찬기업 20230317 김용우 대표이사 독점 영상",
    author: "관리자",
    hits: 4234,
    date: "24-04-09 19:07",
    listDate: "04-09",
    listSubject:
      "인류최강 축산분뇨정화처리기업, 독보적인 기술력, 극강의 소통력, (주)한화그린, 매일경제TV 극찬기업 202…",
    content:
      "인류최강 축산분뇨정화처리기업, 독보적인 기술력, 극강의 소통력, (주)한화그린, 매일경제TV 극찬기업 20230317 김용우 대표이사 독점 영상",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_7tdLlEvj_be9eae30eae9c200d0ca0546704ab797e3bdb1d5_600x338.jpg`,
    imageLink: `${ASSET}/data/file/news/9cdfc0fc5d82328c0a1e999cc9468361_7tdLlEvj_be9eae30eae9c200d0ca0546704ab797e3bdb1d5.jpg`,
    relatedLink: "https://www.youtube.com/embed/2miCfR4OQJU?si=omWQ_Hdeqmr1zfjt",
    linkCount: 1944,
    prev: {
      id: 2,
      subject:
        "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
      date: "24.04.09",
    },
    next: null,
  },
];

export function getNewsPost(id) {
  return newsPosts.find((post) => post.id === Number(id));
}

export function incrementNewsHits(id) {
  const post = newsPosts.find((item) => item.id === Number(id));
  if (post) post.hits += 1;
}

export const noticePosts = [
  {
    id: 1,
    isNotice: true,
    subject: "한화그린 홈페이지 리뉴얼",
    author: "관리자",
    hits: 3437,
    date: "04-11",
    content:
      "안녕하세요. (주)한화그린입니다.\n\n홈페이지가 새롭게 리뉴얼되었습니다.\n보다 편리한 서비스 제공을 위해 지속적으로 개선하겠습니다.\n\n감사합니다.",
  },
];

export function getNoticePost(id) {
  return noticePosts.find((post) => post.id === Number(id));
}

export function incrementNoticeHits(id) {
  const post = noticePosts.find((item) => item.id === Number(id));
  if (post) post.hits += 1;
}

export function filterPosts(posts, { field, keyword }) {
  const query = keyword.trim().toLowerCase();
  if (!query) return posts;

  return posts.filter((post) => {
    const subject = post.subject.toLowerCase();
    const content = (post.content || "").toLowerCase();

    if (field === "wr_subject") return subject.includes(query);
    if (field === "wr_content") return content.includes(query);
    return subject.includes(query) || content.includes(query);
  });
}

export function boardListUrl(table) {
  return `/bbs/board.php?bo_table=${table}`;
}

export function boardWriteUrl(table) {
  return `/bbs/write.php?bo_table=${table}`;
}

export function boardViewUrl(table, id) {
  return `/bbs/board.php?bo_table=${table}&wr_id=${id}`;
}
