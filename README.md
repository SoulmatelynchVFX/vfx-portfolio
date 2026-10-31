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
│   ├── VideoPlayer.tsx   # 自定义播放器（进度条 / 静音 / 键盘控制 / 全屏）
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

### 播放器全屏

打开作品后，使用播放器右侧的“全屏”按钮进入浏览器全屏；全屏包含视频及播放、进度、声音和退出控件。按钮可用 Tab 聚焦、Enter 或空格操作。使用“退出全屏”返回作品窗口，焦点回到全屏按钮；浏览器退出全屏时按钮状态同步。Esc 优先退出浏览器全屏，返回作品窗口后再次 Esc 关闭作品并恢复画廊入口焦点。

浏览器不支持标准 Fullscreen API 或策略禁止全屏时，按钮不可用并显示原因，仍可在作品窗口播放。请求被拒绝时提示“全屏操作未完成”，不误报为视频加载失败，可继续播放或重试。不实现旧版 WebKit 专属视频全屏，也不声称所有 Safari/iOS 版本支持；这类环境保留窗口内播放。

状态以浏览器 `fullscreenchange` 和 `fullscreenElement` 为准，不在点击时假定已成功。没有新增全局快捷键，播放器原有键盘操作保持不变。全屏控件在窄屏可换行。

先启动本地服务，沿用下面的 Playwright/Edge 环境设置后运行：

```powershell
npm run test:fullscreen
npm run test:keyboard
```

全屏脚本验证实际进入/按钮退出、浏览器 API 退出、焦点恢复、拒绝后重试和不支持时降级；失败分支使用浏览器 API 模拟，不能代替 Safari/iOS 实机验证。截图存入已忽略的 `preview/fullscreen-desktop.png` 和 `preview/fullscreen-fallback-mobile.png`。原生全屏时的实体 Esc 行为还应手动验证。

### 播放器键盘操作

打开作品后，焦点先落在关闭按钮；按 Tab 可到达有可见焦点框的“视频播放器”。仅当播放器这一焦点停靠点聚焦时，空格播放/暂停，左右方向键后退/快进 5 秒，并限制在视频起止范围内。按住空格不会连续切换播放状态。

继续按 Tab 可操作原生进度滑块和播放、静音按钮，它们保留各自的键盘行为。播放器内的方向键不再切换作品；焦点在播放器外的弹窗区域时，左右键仍可切换作品。输入框、文本域、选择框与可编辑内容不会触发作品切换；组合键和输入法组字期间也不接管方向键。Esc 仍关闭弹窗并恢复入口焦点。

新增真实浏览器回归脚本 `scripts/check-player-keyboard.mjs`。先启动端口 3100 的开发服务器；脚本需要 Node.js、Edge 与已安装的 Playwright。可通过 `PLAYWRIGHT_MODULE` 指向现有 Playwright 模块目录，通过 `EDGE` 指定浏览器，通过 `URL` 指定本机页面。不自动下载浏览器或添加项目运行依赖。

```powershell
# 已有 Playwright 时；否则先将 PLAYWRIGHT_MODULE 指向可用模块目录
npm run test:keyboard
```

截图写入已忽略的 `preview/keyboard-desktop.png` 和 `preview/keyboard-mobile.png`。测试使用真实页面与键盘事件；不等于屏幕阅读器、Safari 或手机实机认证。

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
