import { test, expect } from "@playwright/test";

const LOGIN_URL = "/api/auth/login";
const BAD_BODY = { mb_id: "admin", mb_password: "wrong_for_drill" };

test.describe("S2 rate limit", () => {
  test("반복 로그인 실패 후 429", async ({ request }) => {
    test.setTimeout(120000);

    let lastStatus = 0;
    for (let i = 0; i < 12; i += 1) {
      const res = await request.post(LOGIN_URL, { data: BAD_BODY });
      lastStatus = res.status();
      if (lastStatus === 429) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    expect(lastStatus).toBe(429);
  });
});
