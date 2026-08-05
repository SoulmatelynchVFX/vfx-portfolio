import Image from "next/image";
import type { Project } from "../types";
import { categories } from "../data/projects";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

/** 画廊缩略图卡片：封面懒加载，悬停出现播放按钮 */
export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const categoryLabel =
    categories.find((c) => c.id === project.category)?.label ?? project.category;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`播放作品：${project.title}`}
      className="group block w-full text-left"
    >
      <div className="relative aspect-video overflow-hidden bg-[#101010] ring-1 ring-white/10 transition duration-300 group-hover:ring-white/30">
        <Image
          src={project.poster}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        {/* 悬停压暗 + 播放按钮 */}
        <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/40 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </span>
        </div>
        <span className="absolute right-2 top-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] tabular-nums text-white/80">
          {project.duration}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="truncate text-sm font-medium text-white">{project.title}</h3>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-white/40">
          {project.year}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/45">{categoryLabel}</p>
    </button>
  );
}
