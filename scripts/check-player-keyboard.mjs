// Real keyboard regression on the running Next.js site; requires Playwright + Edge.
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
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(process.env.URL || "http://127.0.0.1:3100", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: /^播放作品/ }).first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("dialog[open]");
  await dialog.waitFor();
  const player = dialog.getByRole("group", { name: "视频播放器", exact: true });
  const video = dialog.locator("video");
  await page.waitForFunction(() => document.querySelector("dialog video")?.readyState >= 2);
  await video.evaluate(v => v.pause());
  const originalSrc = await video.getAttribute("src");
  const close = dialog.getByRole("button", { name: "关闭", exact: true });
  await close.focus();
  await page.keyboard.press("Tab");
  check("Tab reaches named player", await player.evaluate(el => el === document.activeElement));
  check("Keyboard focus indicator visible", await player.evaluate(el => {
    const style = getComputedStyle(el);
    return el.matches(":focus-visible") && style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
  }));
  await player.evaluate(async el => {
    el.querySelector("video").currentTime = 0.1;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  check("Immediate play/pause does not report a playback failure", await dialog.getByRole("alert").count() === 0);
  await page.keyboard.press("Space");
  check("Space plays", await video.evaluate(v => !v.paused));
  await page.keyboard.press("Space");
  check("Space pauses", await video.evaluate(v => v.paused));
  await player.dispatchEvent("keydown", { key: " ", repeat: true });
  check("Held space does not toggle again", await video.evaluate(v => v.paused));
  await video.evaluate(v => { v.currentTime = 0; });
  await page.keyboard.press("ArrowRight");
  check("Right seeks 5 seconds with duration clamp", await video.evaluate(v => Math.abs(v.currentTime - Math.min(5, v.duration)) < 0.05));
  check("Player arrows do not switch project", await video.getAttribute("src") === originalSrc);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  check("Left clamps at zero", await video.evaluate(v => v.currentTime === 0));
  await video.evaluate(v => { v.currentTime = Math.max(0, v.duration - 0.1); });
  await page.keyboard.press("ArrowRight");
  check("Right clamps at duration", await video.evaluate(v => Math.abs(v.currentTime - v.duration) < 0.05));
  await video.evaluate(v => { v.currentTime = 0; });
  await page.keyboard.press("Control+ArrowRight");
  await player.dispatchEvent("keydown", { key: "ArrowRight", isComposing: true });
  check("Modified and IME keys ignored", await video.evaluate(v => v.currentTime === 0));
  // Programmatic seeks deliver timeupdate asynchronously; wait for the controlled slider.
  await page.waitForFunction(() => Number(document.querySelector('dialog input[type="range"]')?.value) === 0);
  await page.keyboard.press("Tab");
  const slider = dialog.getByRole("slider", { name: "播放进度" });
  check("Tab reaches native slider", await slider.evaluate(el => el === document.activeElement));
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => Math.abs(document.querySelector("dialog video").currentTime - 0.1) < 0.05);
  check("Slider keeps its 0.1-second native step", await video.evaluate(v => Math.abs(v.currentTime - 0.1) < 0.05));
  check("Slider does not navigate projects", await video.getAttribute("src") === originalSrc);
  await page.keyboard.press("Tab");
  const playButton = dialog.getByRole("button", { name: "播放", exact: true });
  check("Tab reaches play button", await playButton.evaluate(el => el === document.activeElement));
  await page.keyboard.press("Space");
  check("Native button toggles once", await video.evaluate(v => !v.paused));
  await page.keyboard.press("Space");
  check("Native button can pause", await video.evaluate(v => v.paused));
  // Synthetic controls guard future additions; actual keystrokes still run through the dialog.
  for (const tag of ["input", "textarea", "select", "div"]) {
    await dialog.evaluate((el, name) => {
      const field = document.createElement(name);
      field.id = "keyboard-regression-field";
      if (name === "div") field.contentEditable = "true";
      el.append(field); field.focus();
    }, tag);
    await page.keyboard.press("ArrowRight");
    check(`${tag} arrow does not switch project`, await video.getAttribute("src") === originalSrc);
    await page.locator("#keyboard-regression-field").evaluate(el => el.remove());
  }
  await player.focus();
  await mkdir("preview", { recursive: true });
  await page.screenshot({ path: "preview/keyboard-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  check("Mobile dialog has no horizontal overflow", await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));
  await page.screenshot({ path: "preview/keyboard-mobile.png" });
  check("Player controls remain enabled without a false error", await slider.isEnabled() && await dialog.getByRole("alert").count() === 0);
  await video.evaluate(v => {
    v.play = () => Promise.reject(new DOMException("Unsupported media", "NotSupportedError"));
  });
  await player.dispatchEvent("keydown", { key: " " });
  await dialog.getByRole("alert").waitFor();
  check("Real playback failures still show an error", await dialog.getByRole("alert").isVisible() && await slider.isDisabled());
  await close.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(src => document.querySelector("dialog video")?.getAttribute("src") !== src, originalSrc);
  check("Arrows outside player still switch project", await video.getAttribute("src") !== originalSrc);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  check("Escape restores trigger focus", await trigger.evaluate(el => el === document.activeElement));
  check("Closing unlocks page scroll", await page.evaluate(() => document.body.style.overflow !== "hidden"));
  check("No uncaught browser exceptions", errors.length === 0);
  console.log(`${passed} keyboard checks passed.`);
} finally {
  await browser.close();
}
