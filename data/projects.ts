import type { Category, Project } from "../types";

/** 分类过滤标签。想加分类就在这里加一条，然后在 projects 里引用对应 id。 */
export const categories: Category[] = [
  { id: "all", label: "全部作品" },
  { id: "houdini", label: "Houdini 粒子与流体" },
  { id: "ue5", label: "UE5 实时渲染" },
  { id: "nuke", label: "Nuke 影视合成" },
  { id: "render", label: "三维渲染" },
];

/**
 * 作品数据。替换方法：
 * 1. 把视频放到 public/videos/，封面图放到 public/posters/；
 * 2. 把这里的 video / poster 路径改成你自己的文件名。
 */
export const projects: Project[] = [
  {
    id: "particle-storm",
    title: "粒子风暴",
    category: "houdini",
    year: "2025",
    duration: "00:18",
    description:
      "由 Houdini POP 粒子系统驱动的万点星火，配合 VEX 编写的自定义风力与湍流场，捕捉爆裂瞬间的秩序与混沌。",
    techStack: ["Houdini POP Network", "VEX 自定义场", "Karma XPU", "Nuke 分层合成"],
    video: "/videos/particle-storm.mp4",
    poster: "/posters/particle-storm.jpg",
  },
  {
    id: "fluid-vessel",
    title: "流体容器",
    category: "houdini",
    year: "2025",
    duration: "00:24",
    description:
      "FLIP 流体在透明容器中的翻涌与回落，使用白水（Whitewater）辅助粒子补充细节，VDB 网格化后在 Karma 中渲染。",
    techStack: ["Houdini FLIP", "Whitewater", "VDB 网格化", "Karma XPU"],
    video: "/videos/fluid-vessel.mp4",
    poster: "/posters/fluid-vessel.jpg",
  },
  {
    id: "magma-dragon",
    title: "熔岩巨兽",
    category: "houdini",
    year: "2024",
    duration: "00:32",
    description:
      "Pyro 烟火与 FLIP 流体耦合的熔岩表面，通过自定义材质渐变模拟高温金属的流动质感。",
    techStack: ["Houdini Pyro", "FLIP 耦合", "Redshift", "材质渐变"],
    video: "/videos/magma-dragon.mp4",
    poster: "/posters/magma-dragon.jpg",
  },
  {
    id: "cyber-street",
    title: "赛博街区",
    category: "ue5",
    year: "2025",
    duration: "00:28",
    description:
      "UE5 中的霓虹雨夜街道，Lumen 全局光照与 Nanite 高模资产支撑的实时渲染场景。",
    techStack: ["Unreal Engine 5", "Lumen", "Nanite", "Megascans 资产"],
    video: "/videos/cyber-street.mp4",
    poster: "/posters/cyber-street.jpg",
  },
  {
    id: "neon-beacon",
    title: "霓虹信标",
    category: "ue5",
    year: "2024",
    duration: "00:22",
    description:
      "Niagara 粒子系统生成的悬浮光带与信号脉冲，在 Sequencer 中完成的镜头调度与后期调色。",
    techStack: ["UE5 Niagara", "Sequencer", "光线追踪反射", "DaVinci 调色"],
    video: "/videos/neon-beacon.mp4",
    poster: "/posters/neon-beacon.jpg",
  },
  {
    id: "stealth-jet",
    title: "隐形战机",
    category: "nuke",
    year: "2025",
    duration: "00:26",
    description:
      "实拍素材上的 CG 战机合成：镜头跟踪、阴影匹配与大气透视统一，使用 Deep 合成处理前景遮挡。",
    techStack: ["Nuke 跟踪", "Deep 合成", "Keylight 抠像", "大气透视匹配"],
    video: "/videos/stealth-jet.mp4",
    poster: "/posters/stealth-jet.jpg",
  },
  {
    id: "macro-world",
    title: "微观世界",
    category: "nuke",
    year: "2024",
    duration: "00:20",
    description:
      "显微摄影风格的微观生物群落，多通道 AOV 分层合成，辅以胶片颗粒与色差等电影化处理。",
    techStack: ["Nuke 多通道合成", "AOV 分层", "胶片颗粒", "色差模拟"],
    video: "/videos/macro-world.mp4",
    poster: "/posters/macro-world.jpg",
  },
  {
    id: "still-life",
    title: "静物之光",
    category: "render",
    year: "2025",
    duration: "00:15",
    description:
      "Octane 渲染的珠宝静物，聚焦金属与玻璃材质的折射、焦散表现与 HDRI 布光练习。",
    techStack: ["Cinema 4D", "Octane Render", "焦散", "HDRI 布光"],
    video: "/videos/still-life.mp4",
    poster: "/posters/still-life.jpg",
  },
];
