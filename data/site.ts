/**
 * 站点全局配置 —— 把这里的占位信息换成你自己的。
 */
export const site = {
  /** 显示在首页正中央的名字 */
  name: "Seal Wang",
  /** 头衔 */
  role: "VFX Artist",
  /** 副标语（技能关键词） */
  tagline: "Houdini · UE5 · Nuke",
  /** 首页「叠底」视频（金翅大鹏，作为文字蒙版的填充层） */
  heroVideo: "/videos/golden-wing.mp4",
  /** 首页标题「Seal Wang」动态字标（webm 黑底，用 mix-blend-screen 透明化） */
  heroTitleVideo: "/videos/seal-wang.webm",
  /** 首页全屏背景视频（Showreel 混剪，暂未使用） */
  showreelVideo: "/videos/hero.mp4",
  /** 背景视频的封面图（首帧之前显示） */
  showreelPoster: "/posters/hero.jpg",
  /** 页脚联系邮箱 */
  email: "soulmatelynch@gmail.com",
} as const;
