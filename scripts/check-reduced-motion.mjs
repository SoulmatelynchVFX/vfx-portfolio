import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  executablePath: process.env.EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
let passed = 0;
const errors = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  console.log(`PASS ${++passed}: ${name}`);
};

try {
  for (const [reducedMotion, width] of [["no-preference", 1280], ["reduce", 1280], ["reduce", 390]]) {
    const page = await browser.newPage({ reducedMotion, viewport: { width, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(process.env.URL || "http://127.0.0.1:3100", {
      waitUntil: "networkidle",
    });
    check(`Homepage loads at ${width}px with ${reducedMotion}`, response.status() === 200);
    const trigger = page.getByRole("button", { name: /^播放作品/ }).first();
    await trigger.focus();
    if (reducedMotion === "reduce") {
      check("Reduced gallery entry is immediately visible", await trigger.evaluate(el => {
        const style = getComputedStyle(el.parentElement);
        return style.opacity === "1" && style.transform === "none" && style.filter === "none";
      }));
      await trigger.hover();
      check("Reduced hover keeps preview paused", await trigger.locator("video").evaluate(el => el.paused));
    }
    await page.keyboard.press("Enter");
    const dialog = page.locator("dialog[open]");
    await dialog.waitFor();
    const animation = await dialog.locator(".lightbox-content").evaluate(el => getComputedStyle(el).animationName);
    check(`Dialog animation follows ${reducedMotion}`,
      animation === (reducedMotion === "reduce" ? "none" : "lightbox-in"));
    const close = dialog.getByRole("button", { name: "关闭", exact: true });
    check("Keyboard opening focuses close", await close.evaluate(el => el === document.activeElement));
    await page.waitForFunction(() => document.querySelector("dialog video")?.readyState >= 2);
    const video = dialog.locator("video");
    await video.evaluate(el => el.pause());
    const player = dialog.getByRole("group", { name: "视频播放器", exact: true });
    await player.focus();
    await page.keyboard.press("Space");
    check("User-initiated playback works", await video.evaluate(el => !el.paused));
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    check("Escape restores entry focus", await trigger.evaluate(el => el === document.activeElement));

    if (reducedMotion === "no-preference") {
      await trigger.hover();
      await page.waitForFunction(() => document.querySelector(".portfolio-card video")?.paused === false);
      check("Normal hover still previews media", await trigger.locator("video").evaluate(el => !el.paused));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(() => document.querySelector(".portfolio-card video")?.paused);
      check("Changing preference stops an active preview", await trigger.locator("video").evaluate(el => el.paused));
    }
    const practice = page.getByRole("button", { name: "练习", exact: true });
    await practice.focus();
    await page.keyboard.press("Enter");
    const filtered = page.getByRole("button", { name: "播放作品：流体容器", exact: true });
    await filtered.focus();
    check("Filtered entry is visible in reduced mode", await filtered.evaluate(el =>
      getComputedStyle(el.parentElement).opacity === "1"));
    check("Reduced anchor jumps immediately", await page.evaluate(() => {
      const target = document.querySelector("#contact");
      const expected = Math.min(target.getBoundingClientRect().top + scrollY,
        document.documentElement.scrollHeight - innerHeight);
      document.querySelector('a[href="#contact"]').click();
      return Math.abs(scrollY - expected) < 2;
    }));
    await page.close();
  }
  check("No uncaught browser errors", errors.length === 0);
  console.log(`${passed} reduced-motion checks passed.`);
} finally {
  await browser.close();
}
