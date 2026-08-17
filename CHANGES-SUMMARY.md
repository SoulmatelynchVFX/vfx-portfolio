# 个人网站升级 — 改动前后对比总结

> 仓库：`SoulmatelynchVFX/vfx-portfolio` · 提交 `0e49601`（`feat(ui): 高级感视觉与微交互升级`）
> 14 个文件 · +728 / -59 行 · 构建 ✅ · E2E 11/11 ✅

---

## 一、依赖变更

| 位置 | 之前 | 之后 |
| --- | --- | --- |
| `package.json` | 仅 `next` / `react` / `@vercel/analytics` | **新增 `lenis@^1.3.26`（平滑滚动）** + **`framer-motion@^13.1.0`（入场动画 / 光标 spring）** |

> 注：未用旧的 `@studio-freight/lenis`，用的是它的继任包 `lenis`。

---

## 二、逐文件对比

### 1. `app/globals.css`（全局样式）

**之前**：`html { scroll-behavior: smooth; }`（原生 CSS 平滑，与 Lenis 冲突）

**之后**：
- 移除 `html { scroll-behavior: smooth }`
- 新增 Lenis 推荐样式（`.lenis-smooth / .lenis-stopped` 等）
- 新增桌面端隐藏原生光标的媒体查询：

```css
@media (hover: hover) and (pointer: fine) {
  * { cursor: none !important; }
}
```

---

### 2. `app/layout.tsx`（根布局）

**之前**：`<body>{children}</body>` 直接渲染

**之后**：包一层 `MotionConfig`（尊重 `prefers-reduced-motion`）+ 平滑滚动 + 定制光标：

```tsx
<MotionConfig reducedMotion="user">
  <SmoothScroll>{children}</SmoothScroll>
  <CustomCursor />
</MotionConfig>
```

---

### 3. `app/page.tsx`（首页）

**改动**：页脚邮箱 `<a>` 增加 `data-cursor="link"`（触发光标的磁性吸附）。

---

### 4. `components/Hero.tsx`（首屏）— 服务端组件 → 客户端组件

**之前**：纯静态 `<div>`，文字一次性出现，无入场动画。

**之后**：文字用 `motion` 容器做错落（stagger）淡入上浮：

```tsx
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
```

滚动提示 `<a>` 增加 `data-cursor="link"`，并延迟 1.1s 淡入。

---

### 5. `components/Gallery.tsx`（画廊网格）

**之前**：整块网格一次性 `animate-fade-in-up`，无错落。

**之后**：`motion.div` 容器 + `whileInView` + `staggerChildren 0.08`，每张卡片独立 `y:28→0` 依次浮现；`key={active}` 让切换分类时重新触发：

```tsx
<motion.div
  variants={gridVariants}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.1 }}
>
  {visible.map((p, i) => (
    <motion.div key={p.id} variants={itemVariants}>
      <ProjectCard project={p} onOpen={() => open(i)} />
    </motion.div>
  ))}
</motion.div>
```

---

### 6. `components/ProjectCard.tsx`（缩略图卡片）

**之前**：只有封面图 + 悬停出现一个静态播放按钮图标。

**之后**：
- 删除原「播放按钮圆圈」覆盖层（交给定制光标的 PLAY 态）
- 新增**悬停视频预览**：`onMouseEnter` 播放静音循环片段、`onMouseLeave` 暂停并归零；封面 `opacity-0 + scale-[1.06]`，视频 `opacity-100`，互为淡入淡出
- 卡片根元素加 `data-cursor="play"`

```tsx
<video
  ref={videoRef}
  src={project.video}
  muted loop playsInline preload="metadata"
  className={`... ${hovered ? "opacity-100" : "opacity-0"}`}
/>
```

> 用 `preload="metadata"`（而非 `auto`）保持原「画廊不预载视频」的性能约定。

---

### 7. `components/Lightbox.tsx`（沉浸式播放器）

**之前**：`bg-black/90 backdrop-blur-sm` 半透明背景 + 原生 `<video controls>`，控件常驻、浏览器自行管理显隐。

**之后**：
- 背景改为**纯黑 `bg-black`**（消除视觉干扰）
- 原生 `controls` 替换为自定义 `VideoPlayer`
- 新增 **2 秒空闲计时**：`pointermove / pointerdown / keydown` 重置计时；触发后隐藏全部 UI（顶栏 / 左右切换 / 标题技术栈 / 播放控件）**和光标**；暂停时强制保持可见
- 打开时 `getLenis()?.stop()` 防止后台滚动，关闭时 `start()`

```tsx
const showControls = () => {
  setControlsVisible(true);
  clearTimeout(idleTimer.current);
  idleTimer.current = setTimeout(() => {
    if (playingRef.current) setControlsVisible(false);
  }, 2000);
};
```

---

### 8. 新增 `components/VideoPlayer.tsx`（自定义播放器，223 行）

替代原生 controls，包含：
- 纯黑播放容器 + 视频点击切换播放/暂停
- 中央大播放键（暂停时浮现）
- 底部控件条：**可拖拽 seek 的进度条** / `mm:ss` 时间 / 静音切换（图标随状态变化）
- 由父组件传入的 `controlsVisible` 控制整体淡入淡出（500ms）

---

### 9. 新增 `components/CustomCursor.tsx`（定制光标，135 行）

- 白点 + `mix-blend-difference`（在暗底显示白、亮底自动反色）
- `useMotionValue + useSpring` 弹簧跟手（stiffness 600 / damping 42）
- 三种形态：
  - 默认 → 10px 小圆点
  - `data-cursor="play"`（视频卡片）→ 放大 76px + 显示 **PLAY**
  - `data-cursor="link"`（文字链接）→ 放大 40px + **磁性吸附**（向元素中心偏移 35%）
- 仅 `(hover:hover) and (pointer:fine)` 设备启用；通过 `cursor-show` / `cursor-hide` 事件与 Lightbox 联动

---

### 10. 新增 `components/SmoothScroll.tsx` + `lib/lenis.ts`

- `SmoothScroll`：初始化 Lenis（`duration:1.15`、指数缓动）+ rAF 循环 + 劫持 `a[href^="#"]` 交给 `lenis.scrollTo`
- `lib/lenis.ts`：Lenis 单例，供 Lightbox `stop/start`
- `prefers-reduced-motion` 时直接不初始化 Lenis

---

### 11. `scripts/check-lightbox.mjs`（E2E 测试）

**之前**：`v.controls === true`（断言原生控件）

**之后**：`!v.controls && 存在 button[aria-label="暂停"]`（断言自定义播放器）

```js
check("video mounted (custom player)",
  await evaluate(`(() => { const v = document.querySelector('[role="dialog"] video');
    return !!v && !v.controls && v.src.endsWith('particle-storm.mp4')
      && !!document.querySelector('[role="dialog"] button[aria-label="暂停"]'); })()`));
```

---

## 三、验证结果

| 检查 | 结果 |
| --- | --- |
| `npm run build` | ✅ 编译 / 类型检查 / 静态生成全部通过，首屏 JS 97 kB → 144 kB |
| `node scripts/check-lightbox.mjs` | ✅ 11/11 PASS，无 JS 异常 |
| `node scripts/capture.mjs` | ✅ 6 张截图（桌面 / 移动端 × Hero / Gallery / Lightbox） |
| Git | ✅ 已推送到 `origin/main` |
