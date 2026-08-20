"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { site } from "../data/site";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * 首屏 Hero（v0.0.5）：
 * - 底层 Showreel 视频全屏铺满（首帧前用 poster 兜底，避免黑屏闪烁）
 * - 标题以实白字叠加在视频上，配一层压暗遮罩 + drop-shadow 保证任何帧都清晰可读
 * - 尊重 prefers-reduced-motion：开启时暂停循环视频
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const v = videoRef.current;
      if (!v) return;
      if (mq.matches) v.pause();
      else v.play().catch(() => {});
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section className="relative h-svh min-h-[560px] w-full select-none overflow-hidden bg-[#0a0a0a]">
      {/* 1. 底层视频：全屏铺满（Showreel 混剪），poster 兜底首帧 */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={site.showreelVideo}
        poster={site.showreelPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* 2. 压暗遮罩：上/下加重保证标签可读，中部仅轻压留给标题 */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/15 to-black/70" />

      {/* 3. 标题：实白字 + 阴影兜底亮帧，始终清晰可读 */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <h1 className="whitespace-nowrap px-6 text-center text-7xl font-medium tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-8xl">
          {site.name}
        </h1>
      </div>

      {/* 4. 标题上方标签（来自配置） */}
      <motion.p
        variants={item}
        initial="hidden"
        animate="show"
        className="absolute left-1/2 top-[18%] z-30 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.5em] text-white/70"
      >
        {site.heroLabel}
      </motion.p>

      {/* 5. 标题下方头衔 + 标语 */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute bottom-[14%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="whitespace-nowrap text-xs uppercase tracking-[0.45em] text-white/90 sm:text-sm"
        >
          {site.role}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-3 whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-white/55"
        >
          {site.tagline}
        </motion.p>
      </motion.div>

      {/* 6. 向下滚动提示 */}
      <motion.a
        href="#works"
        data-cursor="link"
        aria-label="向下滚动查看作品"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </motion.a>
    </section>
  );
}
