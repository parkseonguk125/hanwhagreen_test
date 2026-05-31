import { getAuthToken } from "./authAccess";

const API_BASE = "/api";

function jsonHeaders(includeAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return data;
}

export async function fetchNoticePosts() {
  const response = await fetch(`${API_BASE}/notice`);
  return parseResponse(response);
}

export async function fetchNoticePost(id, { skipHit = false } = {}) {
  const query = skipHit ? "?hit=0" : "";
  const response = await fetch(`${API_BASE}/notice/${id}${query}`);
  return parseResponse(response);
}

export async function createNoticePost(payload) {
  const response = await fetch(`${API_BASE}/notice`, {
    method: "POST",
    headers: jsonHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateNoticePost(id, payload) {
  const response = await fetch(`${API_BASE}/notice/${id}`, {
    method: "PUT",
    headers: jsonHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteNoticePost(id) {
  const response = await fetch(`${API_BASE}/notice/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(true),
  });
  return parseResponse(response);
}

export async function fetchQaPosts() {
  const response = await fetch(`${API_BASE}/qa`);
  return parseResponse(response);
}

export async function fetchQaPost(id) {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE}/qa/${id}`, { headers });
  return parseResponse(response);
}

function appendQaFormFields(formData, payload) {
  formData.append("author", payload.author);
  formData.append("password", payload.password);
  formData.append("email", payload.email || "");
  formData.append("homepage", payload.homepage || "");
  formData.append("link1", payload.link1 || "");
  formData.append("link2", payload.link2 || "");
  formData.append("subject", payload.subject);
  formData.append("content", payload.content);
  formData.append("receiveMail", payload.receiveMail ? "true" : "false");
  if (payload.newPassword) {
    formData.append("newPassword", payload.newPassword);
  }
}

export async function createQaPost(payload, file) {
  const formData = new FormData();
  appendQaFormFields(formData, payload);
  if (file) {
    formData.append("attachment", file);
  }

  const response = await fetch(`${API_BASE}/qa`, {
    method: "POST",
    body: formData,
  });
  return parseResponse(response);
}

export async function updateQaPost(id, payload, file) {
  const formData = new FormData();
  appendQaFormFields(formData, payload);
  if (file) {
    formData.append("attachment", file);
  }

  const response = await fetch(`${API_BASE}/qa/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseResponse(response);
}

function parseFilenameFromDisposition(header) {
  if (!header) return "";
  const match = header.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1] || match[2] || "");
  } catch {
    return match[1] || match[2] || "";
  }
}

export async function downloadQaAttachment(id, password) {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (password?.trim()) {
    headers["X-Qa-Password"] = password.trim();
  } else {
    throw new Error("첨부파일을 받으려면 비밀번호 확인이 필요합니다.");
  }

  const response = await fetch(`${API_BASE}/qa/${id}/attachment`, { headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "첨부파일을 받을 수 없습니다.");
  }

  const blob = await response.blob();
  const filename =
    parseFilenameFromDisposition(response.headers.get("Content-Disposition")) ||
    `qa-attachment-${id}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function deleteQaPost(id, password) {
  const response = await fetch(`${API_BASE}/qa/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseResponse(response);
}

export async function incrementQaHits(id) {
  const response = await fetch(`${API_BASE}/qa/${id}/hit`, { method: "POST" });
  return parseResponse(response);
}

export async function verifyQaPost(id, password) {
  const response = await fetch(`${API_BASE}/qa/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseResponse(response);
}
