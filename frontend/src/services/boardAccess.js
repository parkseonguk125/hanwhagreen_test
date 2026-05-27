const STORAGE_PREFIX = "qa_unlock_";

export function storeUnlockedQaPost(post) {
  if (!post?.id) return;
  sessionStorage.setItem(`${STORAGE_PREFIX}${post.id}`, JSON.stringify(post));
}

export function getUnlockedQaPost(id) {
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isQaPostUnlocked(id) {
  return Boolean(getUnlockedQaPost(id));
}

export function clearUnlockedQaPost(id) {
  sessionStorage.removeItem(`${STORAGE_PREFIX}${id}`);
}
