import { getAuthToken } from "./authAccess";

const API_BASE = "/api";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return data;
}

export async function loginMember({ mb_id, mb_password, auto_login }) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mb_id, mb_password, auto_login }),
  });
  return parseResponse(response);
}

export async function fetchCurrentMember() {
  const token = getAuthToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    return null;
  }

  const data = await parseResponse(response);
  return data.member;
}

export async function logoutMember() {
  const token = getAuthToken();
  if (!token) return { ok: true };

  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}
