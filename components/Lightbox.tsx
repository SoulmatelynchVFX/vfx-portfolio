"use client";

import { useEffect, useRef } from "react";
import type { Project } from "../types";
import { categories } from "../data/projects";
import { getLenis } from "../lib/lenis";
import VideoPlayer from "./VideoPlayer";

interface LightboxProps {
  projects: Project[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * 沉浸式全屏播放器（Lightbox）：
 * 纯黑背景 + 自定义播放器；控件始终可见，支持键盘与触控，
 * 支持 ESC 关闭、←/→ 切换作品。
 */
export default function Lightbox({ projects, index, onClose, onNavigate }: LightboxProps) {
  const project = projects[index];
  const prev = (index - 1 + projects.length) % projects.length;
  const next = (index + 1) % projects.length;
  const categoryLabel =
    categories.find((c) => c.id === project.category)?.label ?? project.category;
  const hasMultiple = projects.length > 1;
  const closeRef = useRef<HTMLButtonElement>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const chrome = "";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const lenis = getLenis();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    dialog.showModal();
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="portfolio-lightbox"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.repeat ||
            event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const target = event.target;
        // Player shortcuts and editable/native inputs must never switch the project.
        if (target instanceof HTMLElement && (target.isContentEditable ||
            target.closest("input, textarea, select, [data-video-player]"))) return;
        if (hasMultiple && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
          event.preventDefault();
          onNavigate(event.key === "ArrowRight" ? next : prev);
        }
      }}
      aria-modal="true"
      aria-label={`作品播放：${project.title}`}
    >
      <div className="lightbox-content relative z-10 w-full max-w-6xl animate-lightbox-in">
        {/* 顶栏：分类 · 年份 + 序号 + 关闭（液态玻璃面板） */}
        <div className={`lightbox-header glass-panel mb-4 rounded-[22px] p-[12px_18px] ${chrome}`}>
          <div className="flex items-center justify-between gap-4">
            <p className="truncate text-[11px] uppercase tracking-[0.3em] text-white/65">
              {categoryLabel} · {project.year}
            </p>
            <div className="flex shrink-0 items-center gap-5">
              {hasMultiple && (
                <span className="hidden text-[11px] tabular-nums text-white/60 sm:block">
                  {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                </span>
              )}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                data-cursor="link"
                aria-label="关闭"
                className="glass-button h-9 w-9 rounded-full"
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
        </div>

        {/* 播放器 + 左右切换 */}
        <div className="relative">
          <VideoPlayer
            key={project.id}
            src={project.video}
            poster={project.poster}
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => onNavigate(prev)}
                aria-label="上一个作品"
                className={`lightbox-desktop-nav glass-button absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full md:flex ${chrome}`}
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
                className={`lightbox-desktop-nav glass-button absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full md:flex ${chrome}`}
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

        {/* 下方信息区：标题 / 说明 / 技术栈（液态玻璃面板） */}
        <div className={`glass-panel mt-6 rounded-[22px] p-[20px_24px] ${chrome}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-2xl font-light tracking-tight text-white">{project.title}</h3>
            {hasMultiple && (
              <span className="text-[11px] tabular-nums text-white/60 md:hidden">
                {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
            )}
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
            {project.description}
          </p>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
              技术栈 / Technical Stack
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.techStack.map((tag) => (
                <span
                  key={tag}
                  className="glass-tag rounded-full px-3 py-1 text-xs text-white/80"
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
                className="glass-button rounded-full px-4 py-2 text-xs"
              >
                ← 上一个
              </button>
              <button
                type="button"
                onClick={() => onNavigate(next)}
                className="glass-button rounded-full px-4 py-2 text-xs"
              >
                下一个 →
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
