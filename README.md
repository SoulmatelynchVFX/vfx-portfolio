# Seal Wang · 个人网站

这是我的个人网站，用来整理视觉特效作品、技术练习和个人介绍。

除了制作 VFX，我也在开发和维护这个网站。从作品怎么呈现，到视频播放、页面过渡和粒子交互，我把想尝试的东西放进实际页面里，再随着使用慢慢调整。这个仓库记录的就是网站本身的实现。

## 网站里有什么

首页以 Showreel 开场，接着是个人介绍、作品画廊和联系方式。作品按项目与练习分类，点击后可以查看视频、说明和使用的技术。

视觉上采用深色背景、玻璃质感和粒子文字，让界面与作品的风格连贯。视频播放器、首屏粒子和滚动过渡也都在这个仓库里维护。

## 实现

网站使用 Next.js 14、React 18 和 TypeScript，样式用 Tailwind CSS。页面动画由 Framer Motion 配合 Lenis 实现，粒子文字和首屏粒子使用 Canvas，视频播放基于原生 `<video>`。

内容与界面分开维护：更新作品时主要修改数据文件，调整展示方式时再改对应组件。

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
│   ├── site.ts           # 个人信息 / 联系方式 / 首页视频
│   └── projects.ts       # 作品数据（标题、分类、描述、技术栈）
├── types.ts              # Project / Category 类型定义
├── public/
│   ├── videos/           # 视频素材
│   └── posters/          # 封面图
└── scripts/
    ├── gen-placeholders.ps1  # 用 ffmpeg 生成占位视频/封面
    ├── check-lightbox.mjs    # E2E 冒烟测试（CDP 驱动无头 Edge）
    └── capture.mjs           # 运行时截图工具
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
```

生产构建：

```bash
npm run build && npm start
```

## 内容维护

新增或更新作品时，将视频和封面放进 `public/videos/`、`public/posters/`，再更新 `data/projects.ts` 中的条目。个人介绍和首页素材入口集中在 `data/site.ts`。

仓库还保留了调试页面用的占位素材生成脚本。`npm run gen:media` 需要 PowerShell 和 ffmpeg，运行前应检查输出路径，避免覆盖同名素材；占位素材不应被当作实际作品展示。

## 本地检查

构建检查使用 `npm run build`。播放器与画廊的冒烟测试、截图工具基于 Edge 的 CDP 接口，使用 Node.js 内置的 WebSocket；可用 Node.js 24 运行，Edge 不在默认安装路径时需设置 `EDGE` 环境变量。

这两个脚本当前固定匹配 `localhost:3100` 页面，检查时先在单独终端启动：

```bash
npm run dev -- --port 3100
```

然后运行：

```bash
npm run test:e2e
npm run shot
```

测试用于检查画廊与播放器交互；视频加载、移动端布局和动效表现还需要在实际设备上查看。
