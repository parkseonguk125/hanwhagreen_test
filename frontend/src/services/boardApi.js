const API_BASE = "/api";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return data;
}

export async function fetchQaPosts() {
  const response = await fetch(`${API_BASE}/qa`);
  return parseResponse(response);
}

export async function fetchQaPost(id) {
  const response = await fetch(`${API_BASE}/qa/${id}`);
  return parseResponse(response);
}

export async function createQaPost(payload) {
  const response = await fetch(`${API_BASE}/qa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author: payload.author,
      password: payload.password,
      email: payload.email,
      homepage: payload.homepage,
      subject: payload.subject,
      content: payload.content,
      receiveMail: payload.receiveMail,
    }),
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
