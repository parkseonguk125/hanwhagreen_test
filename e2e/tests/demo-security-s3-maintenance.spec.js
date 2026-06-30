import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const FLAG = path.join(ROOT, "nginx", "flags", "maintenance.on");

function docker(args) {
  execSync(`docker compose ${args}`, { cwd: ROOT, stdio: "inherit", shell: true });
}

function setMaintenance(on) {
  fs.mkdirSync(path.dirname(FLAG), { recursive: true });
  if (on) {
    fs.writeFileSync(FLAG, "");
  } else {
    fs.rmSync(FLAG, { force: true });
  }
  docker("restart web");
}

test.describe("S3 maintenance mode", () => {
  test("유지보수 ON 503 -> OFF 정상", async ({ page, request }) => {
    test.setTimeout(120000);

    try {
      setMaintenance(true);
      await new Promise((r) => setTimeout(r, 3000));

      const res = await request.get("/");
      expect(res.status()).toBe(200);

      await page.goto("/");
      await expect(page.getByText("점검 중")).toBeVisible({ timeout: 10000 });
    } finally {
      setMaintenance(false);
      await new Promise((r) => setTimeout(r, 3000));
    }

    const ok = await request.get("/");
    expect(ok.status()).toBe(200);
  });
});
