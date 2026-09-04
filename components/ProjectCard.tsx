"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Project } from "../types";
import { categories } from "../data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: () => void;
}

/**
 * 画廊缩略图卡片：封面懒加载。
 * 悬停时封面平滑渐隐、静音循环播放视频片段，移开即恢复封面。
 */
export default function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const categoryLabel =
    categories.find((c) => c.id === project.category)?.label ?? project.category;

  const handleEnter = () => {
    setHovered(true);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  };

  const handleLeave = () => {
    setHovered(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-cursor="play"
      aria-label={`播放作品：${project.title}`}
      className="portfolio-card group block w-full text-left"
    >
      <div className="project-note-card">
        <div className="project-note-heading">
          <p>
            作品记录 {String(index).padStart(2, "0")} <span>· {project.year}</span>
          </p>
          <h3>{project.title}</h3>
        </div>

        <div className="project-frame relative aspect-[16/10] overflow-hidden">
        {/* 封面图：悬停渐隐并轻微放大 */}
        <Image
          src={project.poster}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className={`object-cover transition-all duration-700 ease-out ${
            hovered ? "scale-[1.06] opacity-0" : "opacity-100"
          }`}
        />

        {/* 悬停预览视频：静音循环 */}
        <video
          ref={videoRef}
          src={project.video}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

          {/* 轻微压暗层，保证播放入口可读 */}
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20" />

          <span className="project-play-mark" aria-hidden="true">↗</span>
        </div>

        <div className="project-note-meta">
          <span>{categoryLabel}</span>
          <span>{project.duration}</span>
        </div>
      </div>
    </button>
  );
}
