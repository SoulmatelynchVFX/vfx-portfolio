export type CategoryId = "houdini" | "ue5" | "nuke" | "render";

export interface Category {
  id: CategoryId | "all";
  label: string;
}

export interface Project {
  id: string;
  title: string;
  category: CategoryId;
  year: string;
  duration: string;
  description: string;
  techStack: string[];
  /** 视频路径，放在 public/videos/ 下 */
  video: string;
  /** 封面图路径，放在 public/posters/ 下 */
  poster: string;
}
