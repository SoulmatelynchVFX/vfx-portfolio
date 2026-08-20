"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * 纯黑背景 + 自定义播放器；鼠标 2 秒无动作时平滑隐藏全部控件与光标，
 * 再次移动立即淡入恢复；支持 ESC 关闭、←/→ 切换作品。
 */
export default function Lightbox({ projects, index, onClose, onNavigate }: LightboxProps) {
  const project = projects[index];
  const prev = (index - 1 + projects.length) % projects.length;
  const next = (index + 1) % projects.length;
  const categoryLabel =
    categories.find((c) => c.id === project.category)?.label ?? project.category;
  const hasMultiple = projects.length > 1;
  const closeRef = useRef<HTMLButtonElement>(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const playingRef = useRef(true);
  const idleTimer = useRef<number | undefined>(undefined);

  // 播放状态：暂停时保持控件可见，恢复播放后继续参与空闲计时
  const handlePlayingChange = useCallback((playing: boolean) => {
    playingRef.current = playing;
    if (!playing) {
      setControlsVisible(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    }
  }, []);

  // 空闲计时：任何鼠标移动/点击/按键都会重置 2 秒倒计时
  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        if (playingRef.current) setControlsVisible(false);
      }, 2000);
    };

    const events: (keyof WindowEventMap)[] = ["pointermove", "pointerdown", "keydown"];
    events.forEach((ev) => window.addEventListener(ev, showControls));
    showControls();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, showControls));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  // 打开/关闭：锁定滚动 + 键盘导航 + 暂停/恢复 Lenis
  useEffect(() => {
    const lenis = getLenis();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight" && hasMultiple) onNavigate(next);
      else if (event.key === "ArrowLeft" && hasMultiple) onNavigate(prev);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNavigate, prev, next, hasMultiple]);

  const chrome = `transition-opacity duration-500 ${
    controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
  }`;
  // 控件隐藏时光标一并隐藏（CSS .cursor-none 覆盖整个 Lightbox）
  const cursorClass = controlsVisible ? "" : "cursor-none";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black p-4 sm:p-8 ${cursorClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={`作品播放：${project.title}`}
    >
      <div className="relative z-10 w-full max-w-6xl animate-lightbox-in">
        {/* 顶栏：分类 · 年份 + 序号 + 关闭（液态玻璃面板） */}
        <div className={`glass-panel mb-4 rounded-[22px] p-[12px_18px] ${chrome}`}>
          <div className="flex items-center justify-between gap-4">
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
            controlsVisible={controlsVisible}
            onPlayingChange={handlePlayingChange}
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => onNavigate(prev)}
                aria-label="上一个作品"
                className={`glass-button absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full md:flex ${chrome}`}
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
                className={`glass-button absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full md:flex ${chrome}`}
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
    </div>
  );
}