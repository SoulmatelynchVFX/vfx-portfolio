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
    experience: "Senior VFX Artist · 曾参与多部广告与游戏过场",
    /** 个人简介段落 */
    bio: [
      "专注于影视级特效与实时渲染，热衷于在粒子、流体与光影之间寻找戏剧性的瞬间。",
      "擅长 Houdini 程序化特效、UE5 实时渲染与 Nuke 合成，习惯以导演思维拆解镜头，用技术手段放大情绪。",
    ],
    /** 座右铭/个人标签 */
    motto: "特效是叙事的延长线。",
    /** 技能标签 */
    skills: ["Houdini", "UE5", "Nuke", "Redshift", "Karma", "VEX", "Niagara", "Python"],
  },
} as const;
