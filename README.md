# VFX Portfolio — 个人视觉特效作品集网站

暗黑、极简、电影感风格的视频作品集：全屏 Showreel 首屏 + 可分类过滤的作品画廊 + 沉浸式 Lightbox 播放器。

## 技术选型

| 需求 | 选型 | 理由 |
| --- | --- | --- |
| 前端框架 | **Next.js 14 (App Router) + React 18 + TypeScript** | 生态成熟、可静态导出（`output: 'export'`）免费部署到任意静态托管，天然支持 SEO 元数据 |
| 样式 | **Tailwind CSS 3** | 快速实现暗黑极简风格，移动端响应式开箱即用 |
| 图片 | `next/image` + `loading="lazy"` | 原生懒加载，画廊封面按需加载 |
| 视频 | 原生 `<video>`（`preload="metadata"` / 点击后再加载） | 画廊不预载视频，只有打开 Lightbox 才真正请求视频文件，首屏只加载 1 个背景视频 |
| 字体 | 系统无衬线字体栈（含 PingFang / 微软雅黑） | 零外部请求，离线可用，中文显示友好 |

## 目录结构

```
vfx-portfolio/
├── app/
│   ├── layout.tsx        # 全局布局 + SEO 元数据
│   ├── page.tsx          # 首页：Hero + 画廊 + 页脚
│   └── globals.css       # 全局样式 / 动画 / 滚动条
├── components/
│   ├── Hero.tsx          # 全屏自动循环背景视频 + 居中姓名（SVG 玻璃字）
│   ├── About.tsx         # 个人介绍页（头像 / 简介 / 技能）
│   ├── Gallery.tsx       # 分类过滤 + 网格 + Lightbox 状态管理
│   ├── FilterBar.tsx     # 分类标签（液态玻璃条，移动端可横滑）
│   ├── ProjectCard.tsx   # 缩略图卡片（封面懒加载 + hover 静音预览）
│   ├── Lightbox.tsx      # 沉浸式弹窗播放器 + 技术栈说明区
│   ├── VideoPlayer.tsx   # 自定义播放器（进度条 / 静音 / 空闲隐藏控件）
│   ├── ParticleLayer.tsx # 粒子汇聚成字（作品集底部 2026VFX 签名）
│   └── SmoothScroll.tsx  # Lenis 平滑滚动 + 锚点接管
├── lib/
│   └── lenis.ts          # Lenis 单例（供 Lightbox stop/start）
├── data/
│   ├── site.ts           # ★ 你的名字 / 头衔 / 邮箱 / Showreel 路径
│   └── projects.ts       # ★ 作品数据（标题、分类、描述、技术栈）
├── types.ts              # Project / Category 类型定义
├── public/
│   ├── videos/           # 视频文件（占位视频已生成）
│   └── posters/          # 封面图（占位封面已生成）
└── scripts/
    ├── gen-placeholders.ps1  # 用 ffmpeg 生成占位视频/封面
    ├── check-lightbox.mjs    # E2E 冒烟测试（CDP 驱动无头 Edge）
    └── capture.mjs           # 运行时截图工具
```

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

生产构建：

```bash
npm run build && npm start
```

> 如需纯静态导出（部署到 GitHub Pages / Netlify / 任意静态托管）：
> 在 `next.config.mjs` 中把 `output: 'export'` 打开，再 `npm run build`，产物在 `out/`。
> 图片优化已关闭（`images.unoptimized: true`），静态导出开箱即用。

## 换成你自己的作品

1. **个人信息**：编辑 `data/site.ts`（名字、头衔、邮箱、Showreel 路径）。
2. **作品**：把视频放到 `public/videos/`、封面图放到 `public/posters/`，然后在 `data/projects.ts` 中增删改条目：
   - `category` 对应分类 id（`project` / `practice`），想加分类就在 `categories` 里加一条；
   - `techStack` 就是播放器下方显示的技术栈标签（节点、渲染器、软件等）；
   - `video` / `poster` 改成你自己的文件名。
3. **视频编码建议**（发给客户/制片前）：统一转成 H.264 + `-movflags +faststart`，浏览器兼容最好：

```bash
ffmpeg -i 原片.mov -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an 输出.mp4
```

## 占位视频

`npm run gen:media` 会用 ffmpeg 重新生成 9 个暗色调的渐变 / 分形动画占位视频及封面（需要先安装 ffmpeg，如 `winget install Gyan.FFmpeg`）。它们只是用来跑通 UI 的，正式上线前请替换成真实作品。

## 已验证（本机实测）

- `npm run build` 通过（首屏 JS ≈ 97 kB）
- E2E 冒烟测试 11 项全过：卡片渲染 / 点击打开 Lightbox / 视频自动播放 / 技术栈标签 / 键盘 ←→ 切换 / 序号计数 / ESC 关闭 / 滚动锁定释放 / 分类过滤
- 桌面端 + 移动端（390px）响应式截图确认
- 截图与测试：`npm run shot`、`npm run test:e2e`（需先启动 dev server）

## 性能要点

- 画廊只加载封面图（懒加载），不预载视频；Lightbox 打开时才请求对应视频
- 背景视频 `muted + loop + playsInline`，手机端自动播放无阻塞
- 动效默认全局开启（`MotionConfig reducedMotion="never"` + Lenis `respectReducedMotion:false`），未对系统「减少动画」做降级，按设计保留电影感动效
