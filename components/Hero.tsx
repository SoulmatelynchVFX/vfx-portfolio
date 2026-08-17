"use client";

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
 * 首屏 Hero：
 * - 「金翅大鹏」视频直接作为全屏背景（放在文字背后）
 * - 一层渐变压暗保证文字可读，并自然过渡到画廊区
 * - 姓名 / 标签 / 头衔 / 标语作为普通白字叠在视频之上（PC 端大气字号）
 */
export default function Hero() {
  return (
    <section className="relative flex h-svh min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* 1. 底层视频（直接作为背景） */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={site.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* 2. 渐变压暗：轻量，让视频清晰可见，文字仍可读 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#0a0a0a]" />

      {/* 3. 文字层（正常白字显示在视频之上） */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.p
          variants={item}
          className="text-[11px] uppercase tracking-[0.5em] text-white/75"
        >
          Showreel — 2026
        </motion.p>
        <motion.h1
          variants={item}
          className="mt-6 whitespace-nowrap text-8xl font-light tracking-tight text-white"
        >
          {site.name}
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-6 text-sm uppercase tracking-[0.45em] text-white/90"
        >
          {site.role}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-3 text-xs uppercase tracking-[0.3em] text-white/65"
        >
          {site.tagline}
        </motion.p>
      </motion.div>

      {/* 4. 向下滚动提示 */}
      <motion.a
        href="#works"
        data-cursor="link"
        aria-label="向下滚动查看作品"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/50 transition hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </motion.a>
    </section>
  );
}
