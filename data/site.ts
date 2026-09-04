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
  /** 首页全屏背景视频（金翅大鹏，当前首屏主角） */
  heroVideo: "/videos/golden-wing.mp4",
  /** 背景视频首帧封面（加载前显示，避免黑屏闪烁） */
  heroPoster: "/posters/golden-wing.jpg",
  /** 首屏标题上方的小标签 */
  heroLabel: "Showreel — 2026",
  /** 页脚联系邮箱 */
  email: "soulmatelynch@gmail.com",

  /** 关于页（占位信息，可替换为你自己的履历与头像） */
  about: {
    /** 头像路径（空字符串则使用 CSS 渐变占位） */
    avatar: "/avatars/avatar.jpg",
    /** 状态标签 */
    status: "可接项目 · 随时可聊",
    /** 经历/身份一句话 */
    experience: "VFX & Technical Director · Houdini / UE5 / Nuke",
    /** 个人简介段落 */
    bio: [
      "以影视与实时视觉特效为核心，将程序化制作、实时引擎与后期合成放在同一条可交付的管线里。",
      "我既关注镜头中的情绪与细节，也关注数据、性能与复用性；用工程化思维，让复杂效果真正进入项目。",
    ],
    /** 座右铭/个人标签 */
    motto: "让技术服务于镜头，让镜头留下情绪。",
    /** 技能标签 */
    skills: ["Houdini", "VEX", "Solaris / USD", "Karma", "MaterialX", "UE5", "VAT", "Nuke", "Next.js", "Rust", "AI Workflows"],
  },
} as const;
