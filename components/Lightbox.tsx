"use client";

import { useEffect, useRef } from "react";
import type { Project } from "../types";
import { categories } from "../data/projects";

interface LightboxProps {
  projects: Project[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * 沉浸式播放弹窗（Lightbox）：
 * 打开时锁定页面滚动，支持 ESC 关闭、←/→ 切换作品；
 * 播放器下方预留技术栈说明区。
 */
export default function Lightbox({ projects, index, onClose, onNavigate }: LightboxProps) {
  const project = projects[index];
  const prev = (index - 1 + projects.length) % projects.length;
  const next = (index + 1) % projects.length;
  const categoryLabel =
    categories.find((c) => c.id === project.category)?.label ?? project.category;
  const hasMultiple = projects.length > 1;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight" && hasMultiple) onNavigate(next);
      else if (event.key === "ArrowLeft" && hasMultiple) onNavigate(prev);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNavigate, prev, next, hasMultiple]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`作品播放：${project.title}`}
    >
      {/* 点击背景关闭 */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl animate-lightbox-in">
        {/* 顶栏：分类 · 年份 + 序号 + 关闭 */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="truncate text-[11px] uppercase tracking-[0.3em] text-white/50">
            {categoryLabel} · {project.year}
          </p>
          <div className="flex shrink-0 items-center gap-5">
            {hasMultiple && (
              <span className="hidden text-[11px] tabular-nums text-white/40 sm:block">
                {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white hover:bg-white hover:text-black"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 播放器（key 变化时重新挂载，实现切换作品自动播放） */}
        <div className="relative aspect-video w-full overflow-hidden bg-black ring-1 ring-white/10">
          <video
            key={project.id}
            src={project.video}
            poster={project.poster}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="h-full w-full object-contain"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => onNavigate(prev)}
                aria-label="上一个作品"
                className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition hover:bg-white hover:text-black md:flex"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onNavigate(next)}
                aria-label="下一个作品"
                className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition hover:bg-white hover:text-black md:flex"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* 下方信息区：标题 / 说明 / 技术栈（这里就是预留的填写空间） */}
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-2xl font-light tracking-tight text-white">{project.title}</h3>
            {hasMultiple && (
              <span className="text-[11px] tabular-nums text-white/40 md:hidden">
                {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
            )}
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
            {project.description}
          </p>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              技术栈 / Technical Stack
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.techStack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 移动端上一个 / 下一个 */}
          {hasMultiple && (
            <div className="mt-6 flex items-center justify-between md:hidden">
              <button
                type="button"
                onClick={() => onNavigate(prev)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
              >
                ← 上一个
              </button>
              <button
                type="button"
                onClick={() => onNavigate(next)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
              >
                下一个 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
