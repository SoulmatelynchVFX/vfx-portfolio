// E2E smoke test for the portfolio lightbox + filter flow.
// Drives headless Edge via CDP (Node 24 has built-in WebSocket).
// Usage: node preview/check-lightbox.mjs
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const EDGE = process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = process.env.URL ?? "http://localhost:3100";
const PORT = Number(process.env.CDP_PORT ?? 9222);

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const profile = "preview/edge-profile";
  rmSync(profile, { recursive: true, force: true });
  mkdirSync(profile, { recursive: true });

  const edge = spawn(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    URL,
  ], { stdio: "ignore" });

  // wait for CDP endpoint + page target with our URL
  let page = null;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      page = targets.find((t) => t.type === "page" && t.url.includes("localhost:3100"));
      if (page) break;
    } catch { /* not up yet */ }
    await delay(500);
  }
  if (!page) throw new Error("Page target not available");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  const exceptions = [];

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(msg.params.exceptionDetails.text);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res.result?.value;
  };

  const results = [];
  const check = (name, ok) => {
    results.push(`${ok ? "PASS" : "FAIL"}  ${name}`);
    if (!ok) process.exitCode = 1;
  };

  await send("Runtime.enable");

  // wait for the page to finish loading (dev compile can take a moment)
  await evaluate(`new Promise(r => { const t = setInterval(() => {
    if (document.readyState === 'complete') { clearInterval(t); r(true); }
  }, 150); setTimeout(() => { clearInterval(t); r(false); }, 20000); })`);
  await delay(500);

  // 1. wait for grid cards
  await evaluate(`new Promise(r => { const t = setInterval(() => {
    const n = document.querySelectorAll('button[aria-label^="播放作品"]').length;
    if (n === 8) { clearInterval(t); r(n); }
  }, 200); })`);
  check("8 cards rendered", (await evaluate(`document.querySelectorAll('button[aria-label^="播放作品"]').length`)) === 8);

  // 2. open lightbox from first card
  await evaluate(`document.querySelector('button[aria-label^="播放作品"]').click()`);
  await delay(600);
  check("lightbox dialog open", await evaluate(`!!document.querySelector('[role="dialog"]')`));
  check("video mounted (custom player)", await evaluate(`(() => { const v = document.querySelector('[role="dialog"] video'); return !!v && !v.controls && v.src.endsWith('particle-storm.mp4') && !!document.querySelector('[role="dialog"] button[aria-label="暂停"]'); })()`));
  check("tech stack chips visible", (await evaluate(`document.querySelectorAll('[role="dialog"] [class*="rounded-full"]').length`)) >= 4);

  // 3. keyboard: ArrowRight -> next project
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))`);
  await delay(500);
  check("arrow-right switches video", await evaluate(`(() => { const v = document.querySelector('[role="dialog"] video'); return !!v && v.src.endsWith('fluid-vessel.mp4'); })()`));

  // 4. counter text
  check("counter shows 02 / 08", await evaluate(`document.body.innerText.includes('02 / 08')`));

  // 5. close via Escape
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await delay(400);
  check("escape closes dialog", await evaluate(`!document.querySelector('[role="dialog"]')`));
  check("body scroll unlocked", await evaluate(`document.body.style.overflow !== 'hidden'`));

  // 6. filter: UE5 实时渲染 -> 2 cards
  await evaluate(`(() => { const btns = [...document.querySelectorAll('button')]; btns.find(b => b.textContent.trim() === 'UE5 实时渲染').click(); })()`);
  await delay(500);
  check("filter -> 2 cards", (await evaluate(`document.querySelectorAll('button[aria-label^="播放作品"]').length`)) === 2);
  check("filtered titles correct", await evaluate(`document.body.innerText.includes('赛博街区') && document.body.innerText.includes('霓虹信标') && !document.body.innerText.includes('粒子风暴')`));

  // 7. filter back to all
  await evaluate(`(() => { const btns = [...document.querySelectorAll('button')]; btns.find(b => b.textContent.trim() === '全部作品').click(); })()`);
  await delay(500);
  check("filter back -> 8 cards", (await evaluate(`document.querySelectorAll('button[aria-label^="播放作品"]').length`)) === 8);

  console.log("\n--- Results ---");
  for (const r of results) console.log(r);
  if (exceptions.length) {
    console.log("\n--- JS exceptions ---");
    for (const e of exceptions) console.log(e);
    process.exitCode = 1;
  } else {
    console.log("\nNo uncaught JS exceptions.");
  }

  ws.close();
  edge.kill();
  rmSync(profile, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("E2E failed:", err.message);
  process.exit(1);
});
