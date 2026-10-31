// Real browser fullscreen, plus explicit browser-API failure simulations.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  executablePath: process.env.EDGE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});
let passed = 0;
const check = (name, condition) => { assert.ok(condition, name); console.log(`PASS ${++passed}: ${name}`); };
const errors = [];
async function openProject(page) {
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(process.env.URL || "http://127.0.0.1:3100", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: /^播放作品/ }).first();
  await trigger.click();
  await page.waitForFunction(() => document.querySelector("dialog video")?.readyState >= 2);
  await page.locator("dialog video").evaluate(video => video.pause());
  return trigger;
}
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const trigger = await openProject(page);
  const dialog = page.locator("dialog[open]");
  const player = page.locator("[data-video-player]");
  const button = player.getByRole("button", { name: "全屏", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.fullscreenElement?.matches("[data-video-player]"));
  check("Native fullscreen enters the entire player", await player.evaluate(el => el === document.fullscreenElement));
  const exit = player.getByRole("button", { name: "退出全屏", exact: true });
  await exit.waitFor();
  check("Exit and playback controls remain visible", await exit.isVisible() && await player.getByRole("slider").isVisible());
  check("Fullscreen fills viewport without horizontal overflow", await player.evaluate(el =>
    Math.abs(el.getBoundingClientRect().width - innerWidth) <= 2 && el.scrollWidth <= el.clientWidth));
  await mkdir("preview", { recursive: true });
  await page.screenshot({ path: "preview/fullscreen-desktop.png" });
  await player.focus();
  await page.keyboard.press("Space");
  check("Scoped space still plays in fullscreen", await player.locator("video").evaluate(v => !v.paused));
  await page.keyboard.press("Space");
  await exit.focus();
  await page.keyboard.press("Space");
  await page.waitForFunction(() => document.fullscreenElement === null);
  await button.waitFor();
  check("Exit restores button focus and keeps dialog open", await button.evaluate(el => el === document.activeElement) && await dialog.count() === 1);
  await button.click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  // Native cancel while fullscreen must never close the containing work dialog.
  await dialog.evaluate(el => el.dispatchEvent(new Event("cancel", { cancelable: true })));
  check("Dialog cancel is guarded during fullscreen", await dialog.count() === 1);
  // Browser-owned exit (same fullscreenchange path as browser Escape/menu).
  await page.evaluate(() => document.exitFullscreen());
  await button.waitFor();
  check("Browser exit syncs label and focus", await button.evaluate(el => el === document.activeElement));
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  check("Escape after fullscreen closes dialog and restores gallery focus", await trigger.evaluate(el => el === document.activeElement));

  await openProject(page);
  await page.locator("[data-video-player]").evaluate(el => {
    el.requestFullscreen = () => Promise.reject(new DOMException("Denied", "NotAllowedError"));
  });
  await page.getByRole("button", { name: "全屏", exact: true }).click();
  await page.getByText("全屏操作未完成，可继续播放或再次尝试。").waitFor();
  check("Rejected request leaves inline player usable", await page.evaluate(() => document.fullscreenElement === null) &&
    await page.locator("dialog").getByRole("slider").isEnabled() && await page.locator("dialog").getByRole("alert").count() === 0);
  await page.locator("[data-video-player]").evaluate(el => { delete el.requestFullscreen; });
  await page.getByRole("button", { name: "全屏", exact: true }).click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  check("Retry succeeds after rejected request", await page.getByText("全屏操作未完成，可继续播放或再次尝试。").count() === 0);
  await page.evaluate(() => document.exitFullscreen());

  const unsupported = await browser.newPage({ viewport: { width: 320, height: 740 } });
  await unsupported.addInitScript(() => {
    Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: false });
  });
  await openProject(unsupported);
  await unsupported.getByText("当前浏览器不支持页面全屏，可继续在此播放。").waitFor();
  check("Unsupported browser shows disabled control and explanation", await unsupported.getByRole("button", { name: "全屏", exact: true }).isDisabled());
  check("320px fallback has no horizontal overflow", await unsupported.locator("dialog").evaluate(el => el.scrollWidth <= el.clientWidth));
  check("Unsupported fullscreen does not disable media controls", await unsupported.locator("dialog").getByRole("slider").isEnabled());
  await unsupported.screenshot({ path: "preview/fullscreen-fallback-mobile.png" });
  check("No uncaught browser exceptions", errors.length === 0);
  console.log(`${passed} fullscreen checks passed; Safari/iOS and physical Escape during native fullscreen are not certified.`);
} finally {
  await browser.close();
}
