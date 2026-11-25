import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  executablePath: process.env.EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});

try {
  for (const [width, reducedMotion] of [[1280, "no-preference"], [1280, "reduce"], [390, "reduce"]]) {
    const page = await browser.newPage({ reducedMotion, viewport: { width, height: 900 } });
    await page.goto(process.env.URL || "http://127.0.0.1:3100", { waitUntil: "networkidle" });
    const toolbar = page.locator(".gallery-toolbar");
    const status = toolbar.getByRole("status");
    const cards = page.locator(".portfolio-grid").getByRole("button", { name: /^播放作品/ });
    assert.ok((await status.ariaSnapshot()).includes(`项目：${await cards.count()} 个作品。`));

    for (const label of ["练习", "项目"]) {
      const filter = toolbar.getByRole("button", { name: label, exact: true });
      await filter.press("Enter");
      await page.waitForFunction((name) => {
        const selected = document.querySelector(".gallery-toolbar button[aria-pressed='true']");
        return selected?.textContent.trim() === name;
      }, label);
      assert.ok((await status.ariaSnapshot()).includes(`${label}：${await cards.count()} 个作品。`));
      assert.ok(await filter.evaluate(element => element === document.activeElement));
    }
    await page.close();
    console.log(`PASS: gallery filter status and focus at ${width}px (${reducedMotion})`);
  }
} finally {
  await browser.close();
}
