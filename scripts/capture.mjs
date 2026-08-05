// Captures real runtime screenshots (main, gallery, lightbox, mobile) via CDP.
// Usage: node preview/capture.mjs
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const EDGE = process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = process.env.URL ?? "http://localhost:3100";
const PORT = Number(process.env.CDP_PORT ?? 9223);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = "preview/edge-profile-capture";
  rmSync(profile, { recursive: true, force: true });
  mkdirSync(profile, { recursive: true });
  mkdirSync("preview", { recursive: true });

  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
    "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, URL,
  ], { stdio: "ignore" });

  let page = null;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      page = targets.find((t) => t.type === "page" && t.url.includes("localhost:3100"));
      if (page) break;
    } catch { /* retry */ }
    await delay(500);
  }
  if (!page) throw new Error("page target not found");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    return res.result?.value;
  };
  const shot = async (file) => {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`preview/${file}`, Buffer.from(data, "base64"));
    console.log("saved", file);
  };
  const viewport = async (w, h) =>
    send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await evaluate(`new Promise(r => { const t = setInterval(() => { if (document.readyState === 'complete') { clearInterval(t); r(1); } }, 150); })`);
  await delay(1200);

  // 1. desktop: hero
  await evaluate(`window.scrollTo(0, 0)`);
  await delay(800);
  await shot("desktop-hero.png");

  // 2. desktop: gallery scrolled into view
  await evaluate(`document.getElementById('works').scrollIntoView()`);
  await delay(800);
  await shot("desktop-gallery.png");

  // 3. desktop: lightbox open (first card)
  await evaluate(`document.querySelector('button[aria-label^="播放作品"]').click()`);
  await delay(1500);
  await shot("desktop-lightbox.png");
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await delay(400);

  // 4. mobile: hero
  await viewport(390, 844);
  await evaluate(`window.scrollTo(0, 0)`);
  await delay(800);
  await shot("mobile-hero.png");

  // 5. mobile: gallery
  await evaluate(`document.getElementById('works').scrollIntoView()`);
  await delay(800);
  await shot("mobile-gallery.png");

  // 6. mobile: lightbox
  await evaluate(`document.querySelector('button[aria-label^="播放作品"]').click()`);
  await delay(1500);
  await shot("mobile-lightbox.png");

  ws.close();
  edge.kill();
  rmSync(profile, { recursive: true, force: true });
  console.log("done");
}

main().catch((e) => { console.error("capture failed:", e.message); process.exit(1); });
